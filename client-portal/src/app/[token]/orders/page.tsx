import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "Ingediend",
  in_progress: "Bezig",
  done: "Afgerond",
  failed: "Mislukt",
  cancelled: "Geannuleerd",
};

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  in_progress: "#8b5cf6",
  done: "#10b981",
  failed: "#ef4444",
  cancelled: "#6b7280",
};

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [client] = await db
    .select({ id: schema.clients.id })
    .from(schema.clients)
    .where(eq(schema.clients.portalToken, token))
    .limit(1);

  if (!client) notFound();

  const orders = await db
    .select({
      id: schema.serviceRequests.id,
      status: schema.serviceRequests.status,
      brief: schema.serviceRequests.brief,
      createdAt: schema.serviceRequests.createdAt,
      estimatedDelivery: schema.serviceRequests.estimatedDelivery,
      serviceName: schema.services.displayName,
      priceCents: schema.services.priceCents,
    })
    .from(schema.serviceRequests)
    .innerJoin(schema.services, eq(schema.serviceRequests.serviceId, schema.services.id))
    .where(eq(schema.serviceRequests.clientId, client.id))
    .orderBy(desc(schema.serviceRequests.createdAt));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Mijn Opdrachten
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {orders.length} opdracht{orders.length !== 1 ? "en" : ""}
          </p>
        </div>
        <Link
          href={`/${token}/orders/new`}
          style={{
            background: "var(--accent-500)",
            color: "white",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + Nieuwe Opdracht
        </Link>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <p className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>
            Nog geen opdrachten ingediend.
          </p>
          <Link
            href={`/${token}/orders/new`}
            className="mt-4 inline-block"
            style={{
              background: "var(--accent-500)",
              color: "white",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Eerste opdracht indienen
          </Link>
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {orders.map((order, idx) => (
            <Link
              key={order.id}
              href={`/${token}/orders/${order.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-surface-hover transition-colors"
              style={{
                borderTop: idx > 0 ? "1px solid var(--border-default)" : undefined,
                textDecoration: "none",
              }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {order.serviceName}
                </p>
                {order.brief && (
                  <p
                    className="text-[12px] truncate mt-0.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {order.brief}
                  </p>
                )}
                <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {new Date(order.createdAt).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {order.priceCents > 0 && (
                  <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {new Intl.NumberFormat("nl-NL", {
                      style: "currency",
                      currency: "EUR",
                    }).format(order.priceCents / 100)}
                  </span>
                )}
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: `${statusColors[order.status] ?? "#6b7280"}22`,
                    color: statusColors[order.status] ?? "#6b7280",
                  }}
                >
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
