import Link from "next/link";
import { desc, count, eq } from "drizzle-orm";
import { ChevronRight, Plug } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Badge } from "@/components/ui/badge";
import { db, schema } from "@/lib/db";
import { NewAgencyButton } from "./new-agency-button";

export default async function AdminAgenciesPage() {
  // Alle agencies met klantaantal + actieve koppelingen
  const agencies = await db
    .select({
      id: schema.agencies.id,
      displayName: schema.agencies.displayName,
      primaryColor: schema.agencies.primaryColor,
      status: schema.agencies.status,
      plan: schema.agencies.plan,
      createdAt: schema.agencies.createdAt,
    })
    .from(schema.agencies)
    .orderBy(desc(schema.agencies.createdAt));

  // Klantaantallen per agency
  const clientCounts = await db
    .select({ agencyId: schema.clients.agencyId, value: count() })
    .from(schema.clients)
    .groupBy(schema.clients.agencyId);

  // Koppelingen per agency
  const integrationCounts = await db
    .select({ agencyId: schema.agencyIntegrations.agencyId, value: count() })
    .from(schema.agencyIntegrations)
    .where(eq(schema.agencyIntegrations.status, "connected"))
    .groupBy(schema.agencyIntegrations.agencyId);

  const clientMap = Object.fromEntries(clientCounts.map((r) => [r.agencyId, r.value]));
  const integMap = Object.fromEntries(integrationCounts.map((r) => [r.agencyId, r.value]));

  return (
    <>
      <Topbar
        title="Agencies"
        description={`${agencies.length} agencies op het platform`}
        action={<NewAgencyButton />}
      />

      <div className="p-4 md:p-6 max-w-4xl">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_90px_80px_80px_110px_40px] gap-3 px-5 h-9 items-center border-b border-[var(--border-default)]">
            <div />
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Agency</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Status</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] text-right">Klanten</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] text-right">
              <Plug className="size-3 inline mr-0.5" />Keys
            </div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Plan</div>
            <div />
          </div>

          {agencies.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-tertiary)] text-[13px]">
              Nog geen agencies.
            </div>
          ) : (
            agencies.map((a) => (
              <Link
                key={a.id}
                href={`/admin/agencies/${a.id}`}
                className="grid grid-cols-[40px_1fr_90px_80px_80px_110px_40px] gap-3 px-5 h-14 items-center border-t border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors group"
              >
                {/* Avatar */}
                <div
                  className="size-8 rounded-lg grid place-items-center text-white text-[13px] font-semibold shrink-0"
                  style={{ backgroundColor: a.primaryColor }}
                >
                  {a.displayName.charAt(0).toUpperCase()}
                </div>

                {/* Naam */}
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-500)] transition-colors">
                    {a.displayName}
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">
                    {new Date(a.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>

                {/* Status */}
                <Badge
                  tone={
                    a.status === "active" ? "success" :
                    a.status === "trial"  ? "warning" : "neutral"
                  }
                  className="h-[18px] px-1.5 text-[9px] w-fit"
                >
                  {a.status.toUpperCase()}
                </Badge>

                {/* Klanten */}
                <div className="text-[13px] text-right tabular text-[var(--text-secondary)]">
                  {clientMap[a.id] ?? 0}
                </div>

                {/* Koppelingen */}
                <div className={`text-[13px] text-right tabular ${
                  (integMap[a.id] ?? 0) > 0
                    ? "text-[var(--status-success)]"
                    : "text-[var(--text-tertiary)]"
                }`}>
                  {integMap[a.id] ?? 0} / 6
                </div>

                {/* Plan */}
                <div className="text-[11px] uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                  {a.plan}
                </div>

                <ChevronRight className="size-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-500)] transition-colors" />
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
