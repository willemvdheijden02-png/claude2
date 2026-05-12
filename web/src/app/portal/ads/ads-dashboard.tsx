"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MetaAccountSummary, MetaPeriod } from "@/lib/meta/insights";

const periodLabels: Record<MetaPeriod, string> = {
  "4d": "4 dagen",
  "7d": "7 dagen",
  "14d": "14 dagen",
  "30d": "30 dagen",
  "90d": "90 dagen",
};

type ClientOption = {
  id: string;
  displayName: string;
  metaAdAccountId: string | null;
};

function nl(n: number, dec = 0) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(n);
}

function eur(value: number) {
  return `€${nl(value, 0)}`;
}

function deltaPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function AdsDashboard({
  clients,
  selectedClientId,
}: {
  clients: ClientOption[];
  selectedClientId: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [period, setPeriod] = useState<MetaPeriod>("7d");
  const [data, setData] = useState<{
    current: MetaAccountSummary;
    previousSpend: number;
    previousRevenue: number;
    previousConversions: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const accountId = selectedClient?.metaAdAccountId;

  async function fetchData() {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/meta/insights?account=${accountId}&period=${period}`);
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        setData(null);
      } else {
        setData(json);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onbekende fout");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, period]);

  function changeClient(id: string) {
    startTransition(() => {
      router.push(`/portal/ads?client=${id}`);
    });
  }

  const current = data?.current;
  const prevSpend = data?.previousSpend ?? 0;
  const prevRevenue = data?.previousRevenue ?? 0;
  const prevConversions = data?.previousConversions ?? 0;

  const spendDelta = current ? deltaPct(current.spend, prevSpend) : 0;
  const revenueDelta = current ? deltaPct(current.revenue, prevRevenue) : 0;
  const conversionsDelta = current ? deltaPct(current.conversions, prevConversions) : 0;
  const prevRoas = prevSpend > 0 ? prevRevenue / prevSpend : 0;
  const roasDelta = current ? deltaPct(current.roas, prevRoas) : 0;

  return (
    <>
      <Topbar
        title="Ads Manager"
        description={
          current
            ? `${selectedClient?.displayName ?? current.accountName} · ${current.campaigns.length} campagnes · ${periodLabels[period]}`
            : "Facebook Ads performance"
        }
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={fetchData} disabled={loading}>
              <RefreshCw className={cn(loading && "animate-spin")} />
              Verversen
            </Button>
            <Button size="sm" variant="secondary" disabled>
              <Upload />
              CSV
            </Button>
            <Button size="sm" variant="secondary" disabled>
              <Download />
              Export
            </Button>
          </div>
        }
      />
      <div className="p-6 space-y-6">
        {/* Client picker + Meta connection status */}
        <Card className="p-4 bg-[var(--bg-surface-2)] flex items-center gap-4">
          <div className="size-9 rounded-md bg-[#1877F2]/15 grid place-items-center shrink-0">
            <span className="text-[#1877F2] font-bold text-[18px] leading-none">f</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[var(--text-primary)] flex items-center gap-2">
              {selectedClient?.displayName ?? "Geen klant"}
              <Badge tone="success" className="h-[18px]">LIVE</Badge>
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)] font-mono">
              {accountId}
            </div>
          </div>
          <select
            value={selectedClientId}
            onChange={(e) => changeClient(e.target.value)}
            className="h-9 px-3 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)] text-[12px] outline-none focus:border-[var(--accent-500)] min-w-[160px]"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
              </option>
            ))}
          </select>
        </Card>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border border-[var(--border-default)] rounded-md p-0.5 bg-[var(--bg-surface)]">
            {(Object.keys(periodLabels) as MetaPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-2.5 h-7 text-[12px] rounded transition-colors",
                  period === p
                    ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-medium"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                )}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[12px] text-[var(--text-tertiary)]">
            <Filter className="size-3.5" />
            <span>vs vorige {periodLabels[period].toLowerCase()}</span>
          </div>
        </div>

        {error && (
          <Card className="p-4 border-[var(--status-danger)] bg-[rgb(239_68_68/0.06)]">
            <div className="text-[13px] text-[var(--status-danger)] font-medium mb-1">
              Meta API fout
            </div>
            <div className="text-[12px] text-[var(--text-secondary)] font-mono break-all">
              {error}
            </div>
          </Card>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Spend"
            value={current ? eur(current.spend) : "—"}
            delta={spendDelta}
            sub={`vs €${nl(prevSpend, 0)}`}
            loading={loading}
          />
          <KpiCard
            label="Revenue"
            value={current ? eur(current.revenue) : "—"}
            delta={revenueDelta}
            sub={`vs €${nl(prevRevenue, 0)}`}
            loading={loading}
            positive
          />
          <KpiCard
            label="ROAS"
            value={current ? nl(current.roas, 2) : "—"}
            delta={roasDelta}
            sub={`vs ${nl(prevRoas, 2)}`}
            loading={loading}
            positive
          />
          <KpiCard
            label="Conversies"
            value={current ? nl(current.conversions) : "—"}
            delta={conversionsDelta}
            sub={`vs ${nl(prevConversions)}`}
            loading={loading}
            positive
          />
        </div>

        {current && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SmallMetric label="Impressions" value={nl(current.impressions)} />
            <SmallMetric label="Clicks" value={nl(current.clicks)} />
            <SmallMetric label="CTR" value={`${nl(current.ctr, 2)}%`} />
            <SmallMetric label="CPC" value={`€${nl(current.cpc, 2)}`} />
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="text-[15px] font-medium tracking-display">Campagnes</div>
            <CardDescription className="text-[12px] mt-0.5">
              {current
                ? `${current.campaigns.length} campagnes · ${periodLabels[period]}`
                : "Laden..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <div className="grid grid-cols-[1fr_80px_100px_100px_100px_80px_80px] px-6 h-9 bg-[var(--bg-surface-2)] border-y border-[var(--border-default)] items-center text-[10px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium">
              <div>Campagne</div>
              <div className="text-right">Status</div>
              <div className="text-right">Spend</div>
              <div className="text-right">Revenue</div>
              <div className="text-right">ROAS</div>
              <div className="text-right">CPA</div>
              <div className="text-right">Conv.</div>
            </div>
            {loading && !current && (
              <div className="px-6 py-12 text-center text-[var(--text-tertiary)] text-[13px] flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Live data ophalen van Meta...
              </div>
            )}
            {current?.campaigns.length === 0 && (
              <div className="px-6 py-12 text-center text-[var(--text-tertiary)] text-[13px]">
                Geen campagnes gevonden in deze periode.
              </div>
            )}
            {current?.campaigns.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1fr_80px_100px_100px_100px_80px_80px] px-6 h-12 items-center border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors text-[13px] cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="truncate text-[var(--text-primary)]">{c.name}</div>
                </div>
                <div className="text-right">
                  <Badge
                    tone={c.effective_status === "ACTIVE" ? "success" : "neutral"}
                    className="h-[18px] px-1.5 text-[9px]"
                  >
                    {c.effective_status === "ACTIVE" ? "ACTIEF" : c.effective_status}
                  </Badge>
                </div>
                <div className="text-right tabular text-[var(--text-secondary)]">{eur(c.spend)}</div>
                <div className="text-right tabular text-[var(--text-secondary)]">{eur(c.revenue)}</div>
                <div
                  className={cn(
                    "text-right tabular font-medium",
                    c.roas >= 3
                      ? "text-[var(--status-success)]"
                      : c.roas >= 2
                      ? "text-[var(--text-primary)]"
                      : c.roas > 0
                      ? "text-[var(--status-warning)]"
                      : "text-[var(--text-tertiary)]"
                  )}
                >
                  {c.roas > 0 ? nl(c.roas, 2) : "—"}
                </div>
                <div className="text-right tabular text-[var(--text-secondary)]">
                  {c.cpa > 0 ? `€${nl(c.cpa, 2)}` : "—"}
                </div>
                <div className="text-right tabular text-[var(--text-primary)]">{c.conversions}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Google Ads strip */}
        <Card className="p-4 bg-[var(--bg-surface-2)] border-dashed flex items-center gap-4">
          <div className="size-9 rounded-md bg-[#4285F4]/10 grid place-items-center shrink-0">
            <span className="text-[#4285F4] font-bold text-[14px] leading-none tracking-tight">G</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[var(--text-primary)]">
              Google Ads — wachtend op approval van developer token
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)]">
              Aangevraagd 11 mei 2026. Approval duurt ~1 week.
            </div>
          </div>
          <Badge tone="warning">PENDING</Badge>
        </Card>
      </div>
    </>
  );
}

function KpiCard({
  label,
  value,
  delta,
  sub,
  loading,
  positive,
}: {
  label: string;
  value: string;
  delta: number;
  sub: string;
  loading?: boolean;
  positive?: boolean;
}) {
  const isUp = delta > 0;
  const goodWhenUp = positive ?? false;
  const showGood = goodWhenUp ? isUp : !isUp;
  return (
    <Card>
      <CardHeader>
        <CardDescription className="uppercase text-[10px] tracking-[0.08em]">
          {label}
        </CardDescription>
        <div className="flex items-end gap-2 mt-1">
          <div className="text-[var(--text-2xl)] font-medium tracking-display tabular text-[var(--text-primary)]">
            {loading && value === "—" ? <span className="opacity-50">…</span> : value}
          </div>
          {delta !== 0 && (
            <div
              className={cn(
                "flex items-center gap-0.5 mb-1.5 text-[11px] tabular font-medium",
                showGood ? "text-[var(--status-success)]" : "text-[var(--status-warning)]"
              )}
            >
              {isUp ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              {Math.abs(delta)}%
            </div>
          )}
        </div>
        <CardDescription className="text-[11px] tabular">{sub}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] font-medium">
        {label}
      </div>
      <div className="text-[15px] font-medium tabular text-[var(--text-primary)] mt-0.5">
        {value}
      </div>
    </div>
  );
}
