import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProposalsPage({
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

  const proposals = await db
    .select({
      id: schema.proposals.id,
      title: schema.proposals.title,
      description: schema.proposals.description,
      proposalType: schema.proposals.proposalType,
      status: schema.proposals.status,
      createdAt: schema.proposals.createdAt,
      expiresAt: schema.proposals.expiresAt,
    })
    .from(schema.proposals)
    .where(eq(schema.proposals.clientId, client.id))
    .orderBy(desc(schema.proposals.createdAt));

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending:  { label: "Wacht op reactie", color: "#f59e0b" },
    approved: { label: "Goedgekeurd",      color: "#10b981" },
    rejected: { label: "Afgewezen",        color: "#ef4444" },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Voorstellen
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Voorstellen van je agency voor goedkeuring
        </p>
      </div>

      {proposals.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Nog geen voorstellen.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => {
            const sc = statusConfig[p.status] ?? { label: p.status, color: "#6b7280" };
            const isPending = p.status === "pending";
            return (
              <div
                key={p.id}
                style={{
                  background: "var(--bg-surface-2)",
                  border: `1px solid ${isPending ? "#f59e0b40" : "var(--border-default)"}`,
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: `${sc.color}22`,
                          color: sc.color,
                        }}
                      >
                        {sc.label}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {new Date(p.createdAt).toLocaleDateString("nl-NL")}
                      </span>
                    </div>
                    <h2
                      className="text-[14px] font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {p.title}
                    </h2>
                    <p
                      className="text-[13px] mt-1 line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {p.description}
                    </p>
                  </div>
                  <Link
                    href={`/${token}/proposals/${p.id}`}
                    style={{
                      background: isPending ? "var(--accent-500)" : "var(--bg-surface)",
                      color: isPending ? "white" : "var(--text-secondary)",
                      borderRadius: "8px",
                      padding: "6px 14px",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none",
                      border: isPending ? "none" : "1px solid var(--border-default)",
                      whiteSpace: "nowrap",
                      shrink: 0,
                    } as React.CSSProperties}
                  >
                    {isPending ? "Bekijken →" : "Details →"}
                  </Link>
                </div>
                {p.expiresAt && isPending && (
                  <p className="text-[11px] mt-2" style={{ color: "#f59e0b" }}>
                    Verloopt op {new Date(p.expiresAt).toLocaleDateString("nl-NL")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
