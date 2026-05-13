import { redirect } from "next/navigation";
import { eq, desc, inArray } from "drizzle-orm";
import { Download, FileText } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card } from "@/components/ui/card";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";

export default async function ReportsPage() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) redirect("/onboarding");

  // Eerst client IDs van deze agency
  const clientRows = await db
    .select({ id: schema.clients.id })
    .from(schema.clients)
    .where(eq(schema.clients.agencyId, ctx.agency.id));
  const clientIds = clientRows.map((c) => c.id);

  const reports = clientIds.length
    ? await db
        .select({
          id: schema.reports.id,
          pdfUrl: schema.reports.pdfUrl,
          createdAt: schema.reports.createdAt,
          version: schema.reports.version,
          clientName: schema.clients.displayName,
          serviceName: schema.services.displayName,
        })
        .from(schema.reports)
        .leftJoin(schema.clients, eq(schema.clients.id, schema.reports.clientId))
        .leftJoin(schema.serviceRequests, eq(schema.serviceRequests.id, schema.reports.serviceRequestId))
        .leftJoin(schema.services, eq(schema.services.id, schema.serviceRequests.serviceId))
        .where(inArray(schema.reports.clientId, clientIds))
        .orderBy(desc(schema.reports.createdAt))
    : [];

  return (
    <>
      <Topbar
        title="Rapporten"
        description={`${reports.length} ${reports.length === 1 ? "rapport" : "rapporten"} geleverd · gebrand met ${ctx.agency.displayName}`}
      />
      <div className="p-4 md:p-6">
        {reports.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="size-12 rounded-xl bg-[var(--bg-surface-2)] grid place-items-center mx-auto mb-4">
              <FileText className="size-6 text-[var(--accent-500)]" />
            </div>
            <h2 className="text-[18px] font-medium tracking-display mb-2">Nog geen rapporten</h2>
            <p className="text-[var(--text-secondary)] text-[13px]">
              Vraag een service aan in de Service-catalogus. Zodra de operator klaar is, verschijnen
              gegenereerde rapporten hier — gebrand met jouw logo en kleuren.
            </p>
          </Card>
        ) : (
          <Card className="!p-0 overflow-x-auto">
            <div className="min-w-[640px]">
            <div className="grid grid-cols-[1fr_180px_140px_100px_44px] px-5 h-9 bg-[var(--bg-surface-2)] border-b border-[var(--border-default)] items-center text-[10px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium">
              <div>Rapport</div>
              <div>Klant</div>
              <div>Datum</div>
              <div className="text-right">Versie</div>
              <div></div>
            </div>
            {reports.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1fr_180px_140px_100px_44px] px-5 h-12 items-center border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors text-[13px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="size-3.5 text-[var(--text-secondary)] shrink-0" />
                  <span className="truncate">{r.serviceName ?? "Rapport"}</span>
                </div>
                <div className="text-[var(--text-secondary)]">{r.clientName}</div>
                <div className="text-[var(--text-tertiary)] text-[12px] tabular">
                  {new Date(r.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div className="text-right text-[var(--text-tertiary)] text-[12px] tabular">v{r.version}</div>
                {r.pdfUrl ? (
                  <a
                    href={r.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] justify-self-end"
                  >
                    <Download className="size-4" />
                  </a>
                ) : (
                  <span className="text-[var(--text-tertiary)] justify-self-end">—</span>
                )}
              </div>
            ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
