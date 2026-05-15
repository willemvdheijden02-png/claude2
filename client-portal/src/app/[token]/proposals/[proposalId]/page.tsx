import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { ProposalRespond } from "./proposal-respond";

export const dynamic = "force-dynamic";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ token: string; proposalId: string }>;
}) {
  const { token, proposalId } = await params;

  const [client] = await db
    .select({ id: schema.clients.id })
    .from(schema.clients)
    .where(eq(schema.clients.portalToken, token))
    .limit(1);

  if (!client) notFound();

  const [proposal] = await db
    .select()
    .from(schema.proposals)
    .where(
      and(
        eq(schema.proposals.id, proposalId),
        eq(schema.proposals.clientId, client.id)
      )
    )
    .limit(1);

  if (!proposal) notFound();

  const typeLabels: Record<string, string> = {
    budget_change: "Budgetwijziging",
    strategy_change: "Strategiewijziging",
    new_campaign: "Nieuwe campagne",
    other: "Overig",
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending:  { label: "Wacht op reactie", color: "#f59e0b" },
    approved: { label: "Goedgekeurd",      color: "#10b981" },
    rejected: { label: "Afgewezen",        color: "#ef4444" },
  };

  const sc = statusConfig[proposal.status] ?? { label: proposal.status, color: "#6b7280" };
  const isPending = proposal.status === "pending";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/${token}/proposals`}
          className="text-[12px] mb-2 inline-block"
          style={{ color: "var(--text-tertiary)" }}
        >
          ← Alle voorstellen
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {proposal.title}
          </h1>
          <span
            className="text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0"
            style={{
              background: `${sc.color}22`,
              color: sc.color,
            }}
          >
            {sc.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            {typeLabels[proposal.proposalType] ?? proposal.proposalType}
          </span>
          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            · {new Date(proposal.createdAt).toLocaleDateString("nl-NL")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-default)",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <p
          className="text-[13px] whitespace-pre-wrap"
          style={{ color: "var(--text-primary)", lineHeight: 1.7 }}
        >
          {proposal.description}
        </p>

        {(proposal.currentValue || proposal.proposedValue) && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: "1px solid var(--border-default)" }}>
            {proposal.currentValue && (
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Huidige situatie
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                  {proposal.currentValue}
                </p>
              </div>
            )}
            {proposal.proposedValue && (
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Voorstel
                </p>
                <p
                  className="text-[13px] font-medium"
                  style={{ color: "var(--accent-500)" }}
                >
                  {proposal.proposedValue}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Client response (if already responded) */}
      {!isPending && proposal.clientNote && (
        <div
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <p className="text-[12px] font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>
            Jouw reactie
          </p>
          <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
            {proposal.clientNote}
          </p>
          {proposal.respondedAt && (
            <p className="text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>
              Beantwoord op {new Date(proposal.respondedAt).toLocaleDateString("nl-NL")}
            </p>
          )}
        </div>
      )}

      {/* Respond form — only if pending */}
      {isPending && (
        <ProposalRespond proposalId={proposalId} token={token} />
      )}
    </div>
  );
}
