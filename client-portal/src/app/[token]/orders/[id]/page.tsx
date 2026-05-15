import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

const statusSteps = [
  { key: "pending",     label: "Ingediend" },
  { key: "in_progress", label: "Bezig"     },
  { key: "done",        label: "Afgerond"  },
];

const statusIndex: Record<string, number> = {
  pending: 0,
  in_progress: 1,
  done: 2,
  failed: 2,
  cancelled: 2,
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ token: string; id: string }>;
}) {
  const { token, id } = await params;

  const [client] = await db
    .select({ id: schema.clients.id })
    .from(schema.clients)
    .where(eq(schema.clients.portalToken, token))
    .limit(1);

  if (!client) notFound();

  const [order] = await db
    .select({
      id: schema.serviceRequests.id,
      status: schema.serviceRequests.status,
      brief: schema.serviceRequests.brief,
      operatorNotes: schema.serviceRequests.operatorNotes,
      createdAt: schema.serviceRequests.createdAt,
      startedAt: schema.serviceRequests.startedAt,
      completedAt: schema.serviceRequests.completedAt,
      estimatedDelivery: schema.serviceRequests.estimatedDelivery,
      serviceName: schema.services.displayName,
      serviceDescription: schema.services.description,
      priceCents: schema.services.priceCents,
    })
    .from(schema.serviceRequests)
    .innerJoin(schema.services, eq(schema.serviceRequests.serviceId, schema.services.id))
    .where(
      and(
        eq(schema.serviceRequests.id, id),
        eq(schema.serviceRequests.clientId, client.id)
      )
    )
    .limit(1);

  if (!order) notFound();

  const currentStep = statusIndex[order.status] ?? 0;
  const isFailed = order.status === "failed";
  const isCancelled = order.status === "cancelled";

  function fmt(d: Date | string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/${token}/orders`}
            className="text-[12px] mb-2 inline-block"
            style={{ color: "var(--text-tertiary)" }}
          >
            ← Alle opdrachten
          </Link>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {order.serviceName}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Ingediend op {fmt(order.createdAt)}
          </p>
        </div>
        {order.priceCents > 0 && (
          <span
            className="text-[14px] font-semibold shrink-0"
            style={{ color: "var(--accent-500)" }}
          >
            {new Intl.NumberFormat("nl-NL", {
              style: "currency",
              currency: "EUR",
            }).format(order.priceCents / 100)}
          </span>
        )}
      </div>

      {/* Timeline */}
      {!isFailed && !isCancelled && (
        <div
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <p
            className="text-[12px] font-medium mb-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            Status
          </p>
          <div className="flex items-center gap-0">
            {statusSteps.map((step, idx) => {
              const done = idx <= currentStep;
              const isLast = idx === statusSteps.length - 1;
              return (
                <div key={step.key} className="flex items-center" style={{ flex: isLast ? "0 0 auto" : 1 }}>
                  <div className="flex flex-col items-center">
                    <div
                      className="size-8 rounded-full grid place-items-center text-[12px] font-bold"
                      style={{
                        background: done ? "var(--accent-500)" : "var(--bg-surface)",
                        border: `2px solid ${done ? "var(--accent-500)" : "var(--border-strong)"}`,
                        color: done ? "white" : "var(--text-tertiary)",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className="text-[11px] mt-1.5 whitespace-nowrap"
                      style={{ color: done ? "var(--text-primary)" : "var(--text-tertiary)" }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className="flex-1 h-0.5 mx-2"
                      style={{
                        background: idx < currentStep ? "var(--accent-500)" : "var(--border-strong)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {order.estimatedDelivery && (
            <p className="text-[12px] mt-4" style={{ color: "var(--text-secondary)" }}>
              Verwachte oplevering: {fmt(order.estimatedDelivery)}
            </p>
          )}
        </div>
      )}

      {(isFailed || isCancelled) && (
        <div
          style={{
            background: "#ef444410",
            border: "1px solid #ef444430",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <p className="text-[13px] font-medium" style={{ color: "#ef4444" }}>
            {isFailed ? "Opdracht mislukt" : "Opdracht geannuleerd"}
          </p>
        </div>
      )}

      {/* Details card */}
      <div
        style={{
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-default)",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <h2
          className="text-[13px] font-semibold mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          Opdrachtdetails
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              Dienst
            </p>
            <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
              {order.serviceName}
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {order.serviceDescription}
            </p>
          </div>
          {order.brief && (
            <div>
              <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                Opdrachtomschrijving
              </p>
              <p
                className="text-[13px] whitespace-pre-wrap"
                style={{ color: "var(--text-primary)" }}
              >
                {order.brief}
              </p>
            </div>
          )}
          {order.startedAt && (
            <div>
              <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                Gestart op
              </p>
              <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                {fmt(order.startedAt)}
              </p>
            </div>
          )}
          {order.completedAt && (
            <div>
              <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                Afgerond op
              </p>
              <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                {fmt(order.completedAt)}
              </p>
            </div>
          )}
          {order.operatorNotes && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                Notitie van je agency
              </p>
              <p
                className="text-[13px] whitespace-pre-wrap"
                style={{ color: "var(--text-primary)" }}
              >
                {order.operatorNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
