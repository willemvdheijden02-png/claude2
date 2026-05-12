import Link from "next/link";
import { ArrowUpRight, Download, GaugeCircle, PenTool, Search, Sparkles } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const kpis = [
  { label: "Active clients", value: "7" },
  { label: "Pending requests", value: "2" },
  { label: "Reports geleverd", value: "11", sub: "deze maand" },
  { label: "Gem. turnaround", value: "14u" },
];

const pinnedServices = [
  { icon: GaugeCircle, name: "Meta Ads Audit", eta: "~24u" },
  { icon: Search, name: "SEO Audit", eta: "~36u" },
  { icon: PenTool, name: "Static Remix", eta: "~12u" },
  { icon: Sparkles, name: "Onboarding", eta: "~24u" },
];

const recentReports = [
  { name: "Bol BH's — Meta Ads Audit", date: "Vandaag", size: "2.4 MB" },
  { name: "Slaapwijs — Static Remix Pack", date: "Gisteren", size: "8.1 MB" },
  { name: "Hopper Lingerie — Brand DNA", date: "2 dagen geleden", size: "1.8 MB" },
  { name: "Restful — Meta Ads Audit", date: "3 dagen geleden", size: "2.6 MB" },
];

export default function PortalOverviewPage() {
  return (
    <>
      <Topbar
        title="Welkom terug, Northbeam"
        description="3 van 10 onboardings deze maand gebruikt"
      />
      <div className="p-6 space-y-6">
        {/* Quota strip */}
        <Card className="p-5 bg-[var(--bg-surface-2)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] font-medium">
                Quota
              </div>
              <div className="text-[var(--text-md)] mt-1">
                <span className="font-medium text-[var(--text-primary)]">3</span>
                <span className="text-[var(--text-secondary)]"> van </span>
                <span className="font-medium text-[var(--text-primary)]">10</span>
                <span className="text-[var(--text-secondary)]"> onboardings deze maand</span>
              </div>
            </div>
            <Badge tone="accent">PRO PLAN</Badge>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent-500)]"
              style={{ width: "30%" }}
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
              {recentReports.map((r, i) => (
                <div
                  key={i}
                  className="px-6 py-3 border-t border-[var(--border-default)] flex items-center gap-3 hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-[var(--text-primary)] truncate">
                      {r.name}
                    </div>
                    <div className="text-[10px] text-[var(--text-tertiary)] tabular">
                      {r.date} · {r.size}
                    </div>
                  </div>
                  <Download className="size-4 text-[var(--text-tertiary)] shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
