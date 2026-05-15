// /admin/clients — operator ziet ALLE klanten van ALLE agencies
// Agencies zien dit nooit — zij zien alleen /portal/clients (gefilterd op hun agencyId)

import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Globe, Mail } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Badge } from "@/components/ui/badge";
import { db, schema } from "@/lib/db";

export default async function AdminClientsPage() {
  // Alle klanten van alle agencies — alleen operator mag dit zien
  const clients = await db
    .select({
      id: schema.clients.id,
      displayName: schema.clients.displayName,
      status: schema.clients.status,
      portalEnabled: schema.clients.portalEnabled,
      portalEmail: schema.clients.portalEmail,
      websiteUrl: schema.clients.websiteUrl,
      metaAdAccountId: schema.clients.metaAdAccountId,
      googleAdsCustomerId: schema.clients.googleAdsCustomerId,
      createdAt: schema.clients.createdAt,
      agencyId: schema.clients.agencyId,
      // Agency info via join
      agencyName: schema.agencies.displayName,
      agencyColor: schema.agencies.primaryColor,
    })
    .from(schema.clients)
    .leftJoin(schema.agencies, eq(schema.agencies.id, schema.clients.agencyId))
    .orderBy(desc(schema.clients.createdAt));

  const totalPortal = clients.filter((c) => c.portalEnabled).length;
  const totalMeta = clients.filter((c) => c.metaAdAccountId).length;
  const totalGoogle = clients.filter((c) => c.googleAdsCustomerId).length;

  return (
    <>
      <Topbar
        title="Alle klanten"
        description={`${clients.length} klanten totaal · ${totalPortal} portaal actief · ${totalMeta} Meta · ${totalGoogle} Google`}
      />
      <div className="p-4 md:p-6 max-w-5xl">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[32px_1fr_150px_80px_80px_80px] gap-3 px-5 h-9 items-center border-b border-[var(--border-default)]">
            <div />
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Klant</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Agency</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Portaal</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
              <span title="Meta Ad Account">Meta</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
              <span title="Google Ads Customer ID">Google</span>
            </div>
          </div>

          {clients.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-tertiary)] text-[13px]">
              Nog geen klanten op het platform.
            </div>
          ) : (
            clients.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[32px_1fr_150px_80px_80px_80px] gap-3 px-5 py-3 items-center border-t border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                {/* Avatar */}
                <div
                  className="size-7 rounded-full grid place-items-center text-white text-[11px] font-bold shrink-0"
                  style={{ backgroundColor: c.agencyColor ?? "#10b981" }}
                >
                  {c.displayName.charAt(0).toUpperCase()}
                </div>

                {/* Naam + info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                      {c.displayName}
                    </span>
                    <Badge
                      tone={c.status === "active" ? "success" : c.status === "new" ? "info" : "neutral"}
                      className="h-[16px] px-1 text-[9px] shrink-0"
                    >
                      {c.status?.toUpperCase() ?? "—"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {c.portalEmail && (
                      <span className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
                        <Mail className="size-3" />
                        {c.portalEmail}
                      </span>
                    )}
                    {c.websiteUrl && (
                      <a
                        href={c.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--accent-500)]"
                      >
                        <Globe className="size-3" />
                        {c.websiteUrl.replace(/^https?:\/\//, "").split("/")[0]}
                      </a>
                    )}
                  </div>
                </div>

                {/* Agency */}
                <Link
                  href={`/admin/agencies/${c.agencyId}`}
                  className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--accent-500)] transition-colors truncate"
                >
                  {c.agencyName ?? "—"}
                </Link>

                {/* Portaal */}
                <div>
                  {c.portalEnabled ? (
                    <Badge tone="success" className="h-[16px] px-1.5 text-[9px]">AAN</Badge>
                  ) : (
                    <Badge tone="neutral" className="h-[16px] px-1.5 text-[9px]">UIT</Badge>
                  )}
                </div>

                {/* Meta */}
                <div className="text-[11px] font-mono text-[var(--text-tertiary)] truncate">
                  {c.metaAdAccountId ? (
                    <span className="text-[var(--status-success)]">✓</span>
                  ) : (
                    <span className="text-[var(--text-tertiary)]">—</span>
                  )}
                </div>

                {/* Google */}
                <div className="text-[11px] font-mono text-[var(--text-tertiary)] truncate">
                  {c.googleAdsCustomerId ? (
                    <span className="text-[var(--status-success)]">✓</span>
                  ) : (
                    <span className="text-[var(--text-tertiary)]">—</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
