import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { FileText, TrendingUp, Receipt } from "lucide-react";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function formatEuros(cents: number) {
  return `€${(cents / 100).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`;
}

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [client] = await db
    .select({
      id: schema.clients.id,
      displayName: schema.clients.displayName,
      websiteUrl: schema.clients.websiteUrl,
      agencyId: schema.clients.agencyId,
      portalEnabled: schema.clients.portalEnabled,
    })
    .from(schema.clients)
    .where(eq(schema.clients.portalToken, token))
    .limit(1);

  if (!client || !client.portalEnabled) notFound();

  const [agency] = await db
    .select({
      displayName: schema.agencies.displayName,
      primaryColor: schema.agencies.primaryColor,
      logoUrl: schema.agencies.logoUrl,
    })
    .from(schema.agencies)
    .where(eq(schema.agencies.id, client.agencyId))
    .limit(1);

  if (!agency) notFound();

  // Log laatste view (best-effort, geen await blocker)
  void db
    .update(schema.clients)
    .set({ portalLastViewedAt: new Date() })
    .where(eq(schema.clients.id, client.id));

  const reports = await db
    .select({
      id: schema.reports.id,
      createdAt: schema.reports.createdAt,
      pdfUrl: schema.reports.pdfUrl,
      version: schema.reports.version,
      serviceName: schema.services.displayName,
    })
    .from(schema.reports)
    .leftJoin(
      schema.serviceRequests,
      eq(schema.serviceRequests.id, schema.reports.serviceRequestId)
    )
    .leftJoin(schema.services, eq(schema.services.id, schema.serviceRequests.serviceId))
    .where(eq(schema.reports.clientId, client.id))
    .orderBy(desc(schema.reports.createdAt))
    .limit(20);

  const invoices = await db
    .select({
      id: schema.invoices.id,
      invoiceNumber: schema.invoices.invoiceNumber,
      issueDate: schema.invoices.issueDate,
      totalCents: schema.invoices.totalCents,
      status: schema.invoices.status,
      pdfUrl: schema.invoices.pdfUrl,
    })
    .from(schema.invoices)
    .where(eq(schema.invoices.clientId, client.id))
    .orderBy(desc(schema.invoices.createdAt))
    .limit(20);

  const accent = agency.primaryColor || "#7c3aed";

  return (
    <div
      className="min-h-screen bg-[#fafafa] text-[#0a0a0a]"
      style={{ ["--accent" as string]: accent } as React.CSSProperties}
    >
      {/* Header */}
      <header className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-3">
          {agency.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agency.logoUrl} alt={agency.displayName} className="h-8 w-auto" />
          ) : (
            <div
              className="size-9 rounded-lg grid place-items-center text-white font-semibold text-[15px]"
              style={{ background: accent }}
            >
              {agency.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-[15px] font-medium leading-tight">{agency.displayName}</div>
            <div className="text-[12px] text-[#737373]">Klantportaal voor {client.displayName}</div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <section>
          <h1 className="text-[24px] font-medium tracking-tight mb-2">
            Welkom, {client.displayName}
          </h1>
          <p className="text-[14px] text-[#525252]">
            Hier vind je je rapporten, KPI&apos;s en facturen op één plek.
            {client.websiteUrl && (
              <>
                {" "}
                Voor:{" "}
                <a href={client.websiteUrl} className="underline" target="_blank" rel="noreferrer">
                  {client.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              </>
            )}
          </p>
        </section>

        {/* Rapporten */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="size-4" style={{ color: accent }} />
            <h2 className="text-[15px] font-medium">Rapporten</h2>
            <span className="text-[12px] text-[#a3a3a3]">({reports.length})</span>
          </div>
          {reports.length === 0 ? (
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-8 text-center text-[13px] text-[#737373]">
              Nog geen rapporten geleverd.
            </div>
          ) : (
            <div className="bg-white border border-[#e5e5e5] rounded-lg divide-y divide-[#f0f0f0] overflow-hidden">
              {reports.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium truncate">
                      {r.serviceName ?? "Rapport"}
                    </div>
                    <div className="text-[11px] text-[#a3a3a3] mt-0.5">
                      v{r.version} · {formatDate(r.createdAt)}
                    </div>
                  </div>
                  {r.pdfUrl && (
                    <a
                      href={r.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12px] font-medium px-3 py-1.5 rounded-md text-white hover:opacity-90 transition-opacity"
                      style={{ background: accent }}
                    >
                      Bekijken
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Facturen */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="size-4" style={{ color: accent }} />
            <h2 className="text-[15px] font-medium">Facturen</h2>
            <span className="text-[12px] text-[#a3a3a3]">({invoices.length})</span>
          </div>
          {invoices.length === 0 ? (
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-8 text-center text-[13px] text-[#737373]">
              Nog geen facturen.
            </div>
          ) : (
            <div className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden">
              <table className="w-full text-[13px]">
                <thead className="bg-[#fafafa] text-[11px] uppercase tracking-[0.05em] text-[#737373]">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">Nummer</th>
                    <th className="text-left px-4 py-2.5 font-medium">Datum</th>
                    <th className="text-right px-4 py-2.5 font-medium">Bedrag</th>
                    <th className="text-left px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-[#f0f0f0]">
                      <td className="px-4 py-3 font-medium">{inv.invoiceNumber ?? "—"}</td>
                      <td className="px-4 py-3 text-[#525252]">{formatDate(inv.issueDate)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatEuros(inv.totalCents)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-[0.05em] font-medium ${
                            inv.status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : inv.status === "overdue"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv.pdfUrl && (
                          <a
                            href={inv.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[12px] underline"
                            style={{ color: accent }}
                          >
                            PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="pt-6 mt-6 border-t border-[#e5e5e5] text-[11px] text-[#a3a3a3] flex items-center gap-1.5">
          <TrendingUp className="size-3" />
          Beheerd door {agency.displayName}
        </footer>
      </main>
    </div>
  );
}
