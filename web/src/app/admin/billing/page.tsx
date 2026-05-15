// /admin/billing — operator ziet ALLE facturen van ALLE agencies

import { desc, eq, sum } from "drizzle-orm";
import { Topbar } from "@/components/shell/topbar";
import { Badge } from "@/components/ui/badge";
import { db, schema } from "@/lib/db";

export default async function AdminBillingPage() {
  const invoices = await db
    .select({
      id: schema.invoices.id,
      status: schema.invoices.status,
      totalCents: schema.invoices.totalCents,
      createdAt: schema.invoices.createdAt,
      issueDate: schema.invoices.issueDate,
      invoiceNumber: schema.invoices.invoiceNumber,
      agencyId: schema.invoices.agencyId,
      agencyName: schema.agencies.displayName,
      clientId: schema.invoices.clientId,
      clientName: schema.clients.displayName,
    })
    .from(schema.invoices)
    .leftJoin(schema.agencies, eq(schema.agencies.id, schema.invoices.agencyId))
    .leftJoin(schema.clients, eq(schema.clients.id, schema.invoices.clientId))
    .orderBy(desc(schema.invoices.createdAt));

  // Totaal betaald
  const [paidResult] = await db
    .select({ total: sum(schema.invoices.totalCents) })
    .from(schema.invoices)
    .where(eq(schema.invoices.status, "paid"));

  const totalPaidCents = Number(paidResult?.total ?? 0);

  function formatPrice(cents: number) {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  }

  function formatDate(dateStr: string | Date | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const statusTone: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
    paid: "success",
    sent: "warning",
    draft: "neutral",
    overdue: "danger",
  };

  const statusLabel: Record<string, string> = {
    paid: "BETAALD",
    sent: "OPEN",
    draft: "CONCEPT",
    overdue: "VERLOPEN",
  };

  return (
    <>
      <Topbar
        title="Facturatie"
        description={`${invoices.length} facturen · ${formatPrice(totalPaidCents)} totaal betaald`}
      />
      <div className="p-4 md:p-6 max-w-5xl">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[140px_1fr_150px_100px_80px] gap-3 px-5 h-9 items-center border-b border-[var(--border-default)]">
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Datum</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Klant</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Agency</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] text-right">Bedrag</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Status</div>
          </div>

          {invoices.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-tertiary)] text-[13px]">
              Nog geen facturen op het platform.
            </div>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="grid grid-cols-[140px_1fr_150px_100px_80px] gap-3 px-5 py-3 items-center border-t border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                {/* Datum */}
                <div className="min-w-0">
                  <div className="text-[12px] text-[var(--text-secondary)]">
                    {formatDate(inv.issueDate ?? inv.createdAt)}
                  </div>
                  {inv.invoiceNumber && (
                    <div className="text-[10px] font-mono text-[var(--text-tertiary)] mt-0.5">
                      {inv.invoiceNumber}
                    </div>
                  )}
                </div>

                {/* Klant */}
                <div className="min-w-0">
                  <span className="text-[13px] font-medium text-[var(--text-primary)] truncate block">
                    {inv.clientName ?? <span className="text-[var(--text-tertiary)]">—</span>}
                  </span>
                </div>

                {/* Agency */}
                <div className="text-[12px] text-[var(--text-secondary)] truncate">
                  {inv.agencyName ?? <span className="text-[var(--text-tertiary)]">—</span>}
                </div>

                {/* Bedrag */}
                <div className="text-[13px] tabular-nums text-[var(--text-primary)] text-right font-medium">
                  {formatPrice(inv.totalCents)}
                </div>

                {/* Status */}
                <div>
                  <Badge
                    tone={statusTone[inv.status] ?? "neutral"}
                    className="h-[16px] px-1.5 text-[9px]"
                  >
                    {statusLabel[inv.status] ?? inv.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
