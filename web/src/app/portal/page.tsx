import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, count, inArray, gte, desc } from "drizzle-orm";
import { ArrowUpRight, Download, GaugeCircle, PenTool, Search, Sparkles } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";

const pinnedServices = [
  { icon: GaugeCircle, name: "Meta Ads Audit", eta: "~24u" },
  { icon: Search, name: "SEO Audit", eta: "~36u" },
  { icon: PenTool, name: "Static Remix", eta: "~12u" },
  { icon: Sparkles, name: "Onboarding", eta: "~24u" },
];

function rel(ts: Date | null) {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "nu";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(ts).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export default async function PortalOverviewPage() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) redirect("/onboarding");

  const agency = ctx.agency;

  // Start of current month for "this month" stats
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Run all queries in parallel
  const [
    clientCountResult,
    activeRequestsResult,
    completedThisMonthResult,
    recentReports,
  ] = await Promise.all([
    // Total active clients
    db
      .select({ count: count() })
      .from(schema.clients)
      .where(
        and(
          eq(schema.clients.agencyId, agency.id),
          inArray(schema.clients.status, ["active", "onboarding"])
        )
      ),

    // Active + pending requests
    db
      .select({ count: count() })
      .from(schema.serviceRequests)
      .where(
        and(
          eq(schema.serviceRequests.agencyId, agency.id),
          inArray(schema.serviceRequests.status, ["pending", "in_progress"])
        )
      ),

    // Reports delivered this month
    db
      .select({ count: count() })
      .from(schema.serviceRequests)
      .where(
        and(
          eq(schema.serviceRequests.agencyId, agency.id),
          eq(schema.serviceRequests.status, "done"),
          gte(schema.serviceRequests.completedAt, monthStart)
        )
      ),

    // Recent completed requests (latest 4)
    db
      .select({
        id: schema.serviceRequests.id,
        completedAt: schema.serviceRequests.completedAt,
        serviceName: schema.services.displayName,
        clientName: schema.clients.displayName,
        pdfUrl: schema.reports.pdfUrl,
      })
      .from(schema.serviceRequests)
      .leftJoin(schema.services, eq(schema.services.id, schema.serviceRequests.serviceId))
      .leftJoin(schema.clients, eq(schema.clients.id, schema.serviceRequests.clientId))
      .leftJoin(schema.reports, eq(schema.reports.serviceRequestId, schema.serviceRequests.id))
      .where(
        and(
          eq(schema.serviceRequests.agencyId, agency.id),
          eq(schema.serviceRequests.status, "done")
        )
      )
      .orderBy(desc(schema.serviceRequests.completedAt))
      .limit(4),
  ]);

  const activeClients = clientCountResult[0]?.count ?? 0;
  const activeRequests = activeRequestsResult[0]?.count ?? 0;
  const completedThisMonth = completedThisMonthResult[0]?.count ?? 0;

  // Quota %
  const quota = agency.onboardingsQuota;
  const quotaUsed = agency.onboardingsUsedThisMonth;
  const quotaPct = quota > 0 ? Math.min((quotaUsed / quota) * 100, 100) : 0;

  const kpis = [
    { label: "Actieve klanten", value: String(activeClients) },
    { label: "Openstaande aanvragen", value: String(activeRequests) },
    { label: "Rapporten geleverd", value: String(completedThisMonth), sub: "deze maand" },
    { label: "Onboardings quota", value: `${quotaUsed}/${quota}`, sub: "deze maand" },
  ];

  return (
    <>
      <Topbar
        title={`Welkom terug, ${agency.displayName}`}
        description={`${quotaUsed} van ${quota} onboardings deze maand gebruikt`}
      />
      <div className="p-4 md:p-6 space-y-6">
        {/* Quota strip */}
        <Card className="p-5 bg-[var(--bg-surface-2)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] font-medium">
                Quota
              </div>
              <div className="text-[var(--text-md)] mt-1">
                <span className="font-medium text-[var(--text-primary)]">{quotaUsed}</span>
                <span className="text-[var(--text-secondary)]"> van </span>
                <span className="font-medium text-[var(--text-primary)]">{quota}</span>
                <span className="text-[var(--text-secondary)]"> onboardings deze maand</span>
              </div>
            </div>
            <Badge tone="accent">{agency.plan.toUpperCase()} PLAN</Badge>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent-500)]"
              style={{ width: `${quotaPct}%` }}
            />
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardHeader>
                <CardDescription className="uppercase text-[10px] tracking-[0.08em]">
                  {k.label}
                </CardDescription>
                <div className="text-[var(--text-2xl)] font-medium tracking-display tabular text-[var(--text-primary)] mt-1">
                  {k.value}
                </div>
                {k.sub && <CardDescription className="text-[11px]">{k.sub}</CardDescription>}
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pinned services */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[15px]">Snel een service starten</CardTitle>
                <CardDescription className="text-[12px] mt-0.5">
                  De vier meest gevraagde services
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/portal/services">
                  Hele catalogus
                  <ArrowUpRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {pinnedServices.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Link
                      key={s.name}
                      href="/portal/services"
                      className="border border-[var(--border-default)] rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] p-4 hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-md bg-[var(--bg-surface)] grid place-items-center group-hover:bg-[var(--accent-glow)] transition-colors">
                          <Icon className="size-[16px] text-[var(--text-secondary)] group-hover:text-[var(--accent-500)] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-[0.04em]">
                            {s.eta}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[15px]">Recente rapporten</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              {recentReports.length === 0 ? (
                <div className="px-6 py-6 text-center text-[12px] text-[var(--text-tertiary)]">
                  Nog geen rapporten
                </div>
              ) : (
                recentReports.map((r) => (
                  <div
                    key={r.id}
                    className={`px-6 py-3 border-t border-[var(--border-default)] flex items-center gap-3 transition-colors ${r.pdfUrl ? "hover:bg-[var(--bg-surface-hover)] cursor-pointer" : ""}`}
                    onClick={r.pdfUrl ? () => window.open(r.pdfUrl!, "_blank") : undefined}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-[var(--text-primary)] truncate">
                        {r.clientName} — {r.serviceName}
                      </div>
                      <div className="text-[10px] text-[var(--text-tertiary)] tabular">
                        {rel(r.completedAt)}
                      </div>
                    </div>
                    {r.pdfUrl && (
                      <Download className="size-4 text-[var(--text-tertiary)] shrink-0" />
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
