// /admin/services — operator ziet ALLE services van ALLE agencies

import { desc, eq } from "drizzle-orm";
import { Topbar } from "@/components/shell/topbar";
import { Badge } from "@/components/ui/badge";
import { db, schema } from "@/lib/db";

export default async function AdminServicesPage() {
  const services = await db
    .select({
      id: schema.services.id,
      displayName: schema.services.displayName,
      category: schema.services.category,
      priceCents: schema.services.priceCents,
      isActive: schema.services.isActive,
      agencyId: schema.services.agencyId,
      createdAt: schema.services.createdAt,
      agencyName: schema.agencies.displayName,
      agencyColor: schema.agencies.primaryColor,
    })
    .from(schema.services)
    .leftJoin(schema.agencies, eq(schema.agencies.id, schema.services.agencyId))
    .orderBy(desc(schema.services.createdAt));

  function formatPrice(cents: number) {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  }

  const categoryTone: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
    audit: "info",
    creative: "success",
    seo: "warning",
    strategy: "neutral",
    onboarding: "info",
    studio: "success",
  };

  return (
    <>
      <Topbar
        title="Services"
        description={`${services.length} services totaal`}
      />
      <div className="p-4 md:p-6 max-w-5xl">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[32px_1fr_120px_80px_80px_120px] gap-3 px-5 h-9 items-center border-b border-[var(--border-default)]">
            <div />
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Naam</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Categorie</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Prijs</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Status</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Agency</div>
          </div>

          {services.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-tertiary)] text-[13px]">
              Nog geen services op het platform.
            </div>
          ) : (
            services.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[32px_1fr_120px_80px_80px_120px] gap-3 px-5 py-3 items-center border-t border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                {/* Avatar */}
                <div
                  className="size-7 rounded-full grid place-items-center text-white text-[11px] font-bold shrink-0"
                  style={{ backgroundColor: s.agencyColor ?? "#10b981" }}
                >
                  {s.displayName.charAt(0).toUpperCase()}
                </div>

                {/* Naam */}
                <div className="min-w-0">
                  <span className="text-[13px] font-medium text-[var(--text-primary)] truncate block">
                    {s.displayName}
                  </span>
                </div>

                {/* Categorie */}
                <div>
                  <Badge
                    tone={categoryTone[s.category] ?? "neutral"}
                    className="h-[16px] px-1.5 text-[9px]"
                  >
                    {s.category.toUpperCase()}
                  </Badge>
                </div>

                {/* Prijs */}
                <div className="text-[13px] tabular-nums text-[var(--text-secondary)]">
                  {s.priceCents === 0 ? (
                    <span className="text-[var(--text-tertiary)]">—</span>
                  ) : (
                    formatPrice(s.priceCents)
                  )}
                </div>

                {/* Status */}
                <div>
                  {s.isActive ? (
                    <Badge tone="success" className="h-[16px] px-1.5 text-[9px]">ACTIEF</Badge>
                  ) : (
                    <Badge tone="neutral" className="h-[16px] px-1.5 text-[9px]">INACTIEF</Badge>
                  )}
                </div>

                {/* Agency */}
                <div className="text-[12px] text-[var(--text-secondary)] truncate">
                  {s.agencyName ?? <span className="text-[var(--text-tertiary)]">Globaal</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
