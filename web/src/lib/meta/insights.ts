// Meta Marketing API client.
// BYOK: gebruikt agency-specifieke access token uit DB.
// Operator fallback naar env voor Willem zelf.

import { env } from "@/lib/env";
import { getAgencyCredentials, IntegrationNotConnectedError } from "@/lib/agency-keys";
import { getCurrentContext } from "@/lib/auth/current";

const META_GRAPH_VERSION = "v21.0";
const META_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export type MetaPeriod = "4d" | "7d" | "14d" | "30d" | "90d";

const datePresetMap: Record<MetaPeriod, string> = {
  "4d": "last_3d",
  "7d": "last_7d",
  "14d": "last_14d",
  "30d": "last_30d",
  "90d": "last_90d",
};

export type MetaCampaign = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
  effective_status: string;
  spend: number;
  revenue: number;
  conversions: number;
  cpa: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
};

export type MetaAccountSummary = {
  accountId: string;
  accountName: string;
  spend: number;
  revenue: number;
  conversions: number;
  cpa: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  campaigns: MetaCampaign[];
};

async function getToken(): Promise<string> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) throw new IntegrationNotConnectedError("meta");

  // Operator fallback — Willem self-service
  if (ctx.profile?.role === "operator") {
    const envToken = env("META_ACCESS_TOKEN");
    if (envToken) return envToken;
  }

  const creds = await getAgencyCredentials(ctx.agency.id, "meta");
  if (!creds.access_token) throw new IntegrationNotConnectedError("meta");
  return creds.access_token;
}

async function metaFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = await getToken();
  const url = new URL(`${META_BASE}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meta API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

type Action = { action_type: string; value: string };

function sumActions(actions: Action[] | undefined, types: string[]): number {
  if (!actions) return 0;
  return actions
    .filter((a) => types.includes(a.action_type))
    .reduce((s, a) => s + parseFloat(a.value), 0);
}

type InsightRow = {
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  actions?: Action[];
  action_values?: Action[];
  campaign_id?: string;
  campaign_name?: string;
};

function rowToMetrics(row: InsightRow) {
  const spend = parseFloat(row.spend ?? "0");
  const impressions = parseInt(row.impressions ?? "0", 10);
  const clicks = parseInt(row.clicks ?? "0", 10);
  const ctr = parseFloat(row.ctr ?? "0");
  const cpc = parseFloat(row.cpc ?? "0");
  const conversions = sumActions(row.actions, ["purchase", "omni_purchase"]);
  const revenue = sumActions(row.action_values, ["purchase", "omni_purchase"]);
  const cpa = conversions > 0 ? spend / conversions : 0;
  const roas = spend > 0 ? revenue / spend : 0;
  return { spend, impressions, clicks, ctr, cpc, conversions, revenue, cpa, roas };
}

export async function getAccountSummary(
  accountId: string,
  period: MetaPeriod
): Promise<MetaAccountSummary> {
  const accountInfo = await metaFetch<{ id: string; name: string }>(`/${accountId}`, {
    fields: "id,name",
  });

  const accountInsights = await metaFetch<{ data: InsightRow[] }>(
    `/${accountId}/insights`,
    {
      fields: "spend,impressions,clicks,ctr,cpc,actions,action_values",
      date_preset: datePresetMap[period],
    }
  );
  const totals = accountInsights.data[0]
    ? rowToMetrics(accountInsights.data[0])
    : { spend: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, conversions: 0, revenue: 0, cpa: 0, roas: 0 };

  const campaignInsights = await metaFetch<{ data: InsightRow[] }>(
    `/${accountId}/insights`,
    {
      level: "campaign",
      fields: "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,actions,action_values",
      date_preset: datePresetMap[period],
      limit: "50",
    }
  );

  const campaignsList = await metaFetch<{
    data: { id: string; name: string; status: string; effective_status: string }[];
  }>(`/${accountId}/campaigns`, {
    fields: "id,name,status,effective_status",
    limit: "50",
  });
  const statusById = new Map(campaignsList.data.map((c) => [c.id, c]));

  const campaigns: MetaCampaign[] = campaignInsights.data.map((row) => {
    const m = rowToMetrics(row);
    const meta = statusById.get(row.campaign_id ?? "");
    return {
      id: row.campaign_id ?? "",
      name: row.campaign_name ?? meta?.name ?? "Unknown",
      status: (meta?.status as MetaCampaign["status"]) ?? "ACTIVE",
      effective_status: meta?.effective_status ?? "ACTIVE",
      ...m,
    };
  });
  campaigns.sort((a, b) => b.spend - a.spend);

  return {
    accountId: accountInfo.id,
    accountName: accountInfo.name,
    ...totals,
    campaigns,
  };
}

export async function getPeriodComparison(
  accountId: string,
  period: MetaPeriod
): Promise<{
  current: MetaAccountSummary;
  previousSpend: number;
  previousRevenue: number;
  previousConversions: number;
}> {
  const current = await getAccountSummary(accountId, period);

  const days = parseInt(period.replace("d", ""), 10);
  const today = new Date();
  const prevEnd = new Date(today);
  prevEnd.setDate(prevEnd.getDate() - days - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days + 1);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const prevInsights = await metaFetch<{ data: InsightRow[] }>(
    `/${accountId}/insights`,
    {
      fields: "spend,impressions,clicks,actions,action_values",
      time_range: JSON.stringify({ since: fmt(prevStart), until: fmt(prevEnd) }),
    }
  );
  const prev = prevInsights.data[0]
    ? rowToMetrics(prevInsights.data[0])
    : { spend: 0, revenue: 0, conversions: 0 };

  return {
    current,
    previousSpend: prev.spend,
    previousRevenue: prev.revenue,
    previousConversions: prev.conversions,
  };
}
