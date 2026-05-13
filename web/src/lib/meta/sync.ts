// Meta KPI sync — backfill spend/clicks/conv per dag voor de klanten van een agency.
// Wordt gebruikt door zowel /api/cron/sync-kpis als de "Haal Meta data op" knop.

import { eq, and, isNotNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getAgencyCredentials, IntegrationNotConnectedError } from "@/lib/agency-keys";

const META_GRAPH_VERSION = "v21.0";

type InsightRow = {
  date_start?: string;
  date_stop?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  actions?: { action_type: string; value: string }[];
  action_values?: { action_type: string; value: string }[];
};

function sumActions(arr: { action_type: string; value: string }[] | undefined, types: string[]) {
  if (!arr) return 0;
  return arr
    .filter((a) => types.some((t) => a.action_type.includes(t)))
    .reduce((sum, a) => sum + Number(a.value || 0), 0);
}

export type MetaSyncResult = {
  clientsChecked: number;
  clientsSkipped: number;
  snapshotsWritten: number;
  errors: { client: string; message: string }[];
};

async function fetchDailyInsights(
  accountId: string,
  accessToken: string,
  days: number
): Promise<InsightRow[]> {
  const url = new URL(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${accountId}/insights`
  );
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", "spend,impressions,clicks,actions,action_values");
  url.searchParams.set("time_increment", "1");
  url.searchParams.set("date_preset", days <= 7 ? "last_7d" : days <= 14 ? "last_14d" : days <= 30 ? "last_30d" : "last_90d");
  url.searchParams.set("limit", "100");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meta API ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  return json?.data ?? [];
}

/**
 * Sync Meta KPIs for all clients of a specific agency.
 * @param agencyId Agency to sync for
 * @param days How many days back to fetch (default 30, max 90)
 */
export async function syncMetaKpisForAgency(
  agencyId: string,
  days = 30
): Promise<MetaSyncResult> {
  const result: MetaSyncResult = {
    clientsChecked: 0,
    clientsSkipped: 0,
    snapshotsWritten: 0,
    errors: [],
  };

  // Token ophalen
  let token: string;
  try {
    const creds = await getAgencyCredentials(agencyId, "meta");
    if (!creds.access_token) throw new IntegrationNotConnectedError("meta");
    token = creds.access_token;
  } catch (err) {
    if (err instanceof IntegrationNotConnectedError) {
      throw new Error("Meta integratie niet gekoppeld. Verbind 'm eerst.");
    }
    throw err;
  }

  // Klanten met Meta ad account
  const clients = await db
    .select({
      id: schema.clients.id,
      displayName: schema.clients.displayName,
      metaAdAccountId: schema.clients.metaAdAccountId,
    })
    .from(schema.clients)
    .where(
      and(
        eq(schema.clients.agencyId, agencyId),
        isNotNull(schema.clients.metaAdAccountId)
      )
    );

  for (const c of clients) {
    if (!c.metaAdAccountId) {
      result.clientsSkipped++;
      continue;
    }
    result.clientsChecked++;

    try {
      const rows = await fetchDailyInsights(c.metaAdAccountId, token, days);

      for (const row of rows) {
        if (!row.date_start) continue;
        const spend = Math.round(Number(row.spend ?? 0) * 100);
        const impressions = Number(row.impressions ?? 0);
        const clicks = Number(row.clicks ?? 0);
        const conversions = sumActions(row.actions, [
          "purchase",
          "omni_purchase",
          "complete_registration",
          "lead",
        ]);
        const revenue = Math.round(
          sumActions(row.action_values, ["purchase", "omni_purchase"]) * 100
        );
        const roas = spend > 0 ? (revenue / spend).toFixed(4) : null;

        await db
          .insert(schema.kpiSnapshots)
          .values({
            clientId: c.id,
            date: row.date_start,
            platform: "meta",
            spendCents: spend,
            impressions,
            clicks,
            conversions,
            revenueCents: revenue,
            roas,
            rawData: row as Record<string, unknown>,
          })
          .onConflictDoUpdate({
            target: [
              schema.kpiSnapshots.clientId,
              schema.kpiSnapshots.date,
              schema.kpiSnapshots.platform,
            ],
            set: {
              spendCents: spend,
              impressions,
              clicks,
              conversions,
              revenueCents: revenue,
              roas,
              rawData: row as Record<string, unknown>,
            },
          });
        result.snapshotsWritten++;
      }
    } catch (err) {
      result.errors.push({
        client: c.displayName,
        message: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  return result;
}

/**
 * Haal lijst van ad accounts op die deze agency-token kan bereiken.
 * Handig om in de UI te tonen "Je token ziet 3 ad accounts: act_X, act_Y, act_Z".
 */
export async function listAccessibleAdAccounts(
  agencyId: string
): Promise<{ id: string; name: string; currency: string; accountStatus: number }[]> {
  const creds = await getAgencyCredentials(agencyId, "meta");
  if (!creds.access_token) throw new IntegrationNotConnectedError("meta");

  const url = new URL(`https://graph.facebook.com/${META_GRAPH_VERSION}/me/adaccounts`);
  url.searchParams.set("access_token", creds.access_token);
  url.searchParams.set("fields", "id,name,currency,account_status");
  url.searchParams.set("limit", "50");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meta API ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  return (json?.data ?? []).map((a: { id: string; name: string; currency: string; account_status: number }) => ({
    id: a.id,
    name: a.name,
    currency: a.currency,
    accountStatus: a.account_status,
  }));
}
