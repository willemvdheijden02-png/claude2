// Cron: dagelijks. Haalt gisteren's Meta-spend per klant op en schrijft naar kpi_snapshots.
// Idempotent: upsert via unieke (clientId, date, platform).

import { NextRequest, NextResponse } from "next/server";
import { isNotNull, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { getAgencyCredentials, IntegrationNotConnectedError } from "@/lib/agency-keys";

export const runtime = "nodejs";
export const maxDuration = 300;

const META_GRAPH_VERSION = "v21.0";

type InsightRow = {
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

async function fetchYesterdayInsights(
  accountId: string,
  accessToken: string
): Promise<InsightRow | null> {
  const url = new URL(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${accountId}/insights`
  );
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set(
    "fields",
    "spend,impressions,clicks,actions,action_values"
  );
  url.searchParams.set("date_preset", "yesterday");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data?.[0] ?? null;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const cronSecret = env("CRON_SECRET");
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // gisteren in YYYY-MM-DD
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dateStr = yesterday.toISOString().slice(0, 10);

  const results = { clientsChecked: 0, snapshotsWritten: 0, errors: [] as string[] };

  // Klanten met Meta ad account
  const clients = await db
    .select({
      id: schema.clients.id,
      agencyId: schema.clients.agencyId,
      displayName: schema.clients.displayName,
      metaAdAccountId: schema.clients.metaAdAccountId,
    })
    .from(schema.clients)
    .where(isNotNull(schema.clients.metaAdAccountId));

  // Token cache per agency
  const tokenCache = new Map<string, string | null>();
  async function getToken(agencyId: string): Promise<string | null> {
    if (tokenCache.has(agencyId)) return tokenCache.get(agencyId)!;
    try {
      const creds = await getAgencyCredentials(agencyId, "meta");
      const token = creds.access_token ?? null;
      tokenCache.set(agencyId, token);
      return token;
    } catch (err) {
      if (err instanceof IntegrationNotConnectedError) {
        tokenCache.set(agencyId, null);
        return null;
      }
      throw err;
    }
  }

  for (const c of clients) {
    if (!c.metaAdAccountId) continue;
    results.clientsChecked++;

    const token = await getToken(c.agencyId);
    if (!token) continue;

    try {
      const row = await fetchYesterdayInsights(c.metaAdAccountId, token);
      if (!row) continue;

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
          date: dateStr,
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
      results.snapshotsWritten++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      results.errors.push(`${c.displayName}: ${msg}`);
    }
  }

  return NextResponse.json({ ok: true, date: dateStr, results });
}
