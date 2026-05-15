import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte, lte, sum, avg } from "drizzle-orm";
import { db, schema } from "@/lib/db";

// GET /api/kpis?token=xxx&range=7&platform=meta
// range: 1 | 4 | 7 | 30 (days)
// platform: meta | google | all

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const range = parseInt(searchParams.get("range") ?? "7", 10);
  const platform = searchParams.get("platform") ?? "all";

  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  // Validate token → get client
  const [client] = await db
    .select({ id: schema.clients.id, displayName: schema.clients.displayName })
    .from(schema.clients)
    .where(and(eq(schema.clients.portalToken, token), eq(schema.clients.portalEnabled, true)))
    .limit(1);

  if (!client) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Date range
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - range);
  const fromStr = from.toISOString().split("T")[0];
  const toStr = today.toISOString().split("T")[0];

  // Build filter
  const filters = [
    eq(schema.kpiSnapshots.clientId, client.id),
    gte(schema.kpiSnapshots.date, fromStr),
    lte(schema.kpiSnapshots.date, toStr),
  ];
  if (platform !== "all") {
    // cast via sql to avoid enum mismatch
    const { sql } = await import("drizzle-orm");
    filters.push(sql`${schema.kpiSnapshots.platform} = ${platform}`);
  }

  // Aggregate totals
  const [totals] = await db
    .select({
      totalSpendCents: sum(schema.kpiSnapshots.spendCents),
      totalImpressions: sum(schema.kpiSnapshots.impressions),
      totalClicks: sum(schema.kpiSnapshots.clicks),
      totalConversions: sum(schema.kpiSnapshots.conversions),
      totalRevenueCents: sum(schema.kpiSnapshots.revenueCents),
      avgRoas: avg(schema.kpiSnapshots.roas),
    })
    .from(schema.kpiSnapshots)
    .where(and(...filters));

  // Daily breakdown (for sparkline)
  const daily = await db
    .select({
      date: schema.kpiSnapshots.date,
      platform: schema.kpiSnapshots.platform,
      spendCents: schema.kpiSnapshots.spendCents,
      impressions: schema.kpiSnapshots.impressions,
      clicks: schema.kpiSnapshots.clicks,
      conversions: schema.kpiSnapshots.conversions,
      revenueCents: schema.kpiSnapshots.revenueCents,
      roas: schema.kpiSnapshots.roas,
    })
    .from(schema.kpiSnapshots)
    .where(and(...filters))
    .orderBy(schema.kpiSnapshots.date);

  // Per-platform breakdown
  const byPlatform: Record<string, {
    spend: number; impressions: number; clicks: number;
    conversions: number; revenue: number; roas: number | null;
  }> = {};

  for (const row of daily) {
    const p = row.platform;
    if (!byPlatform[p]) byPlatform[p] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, roas: null };
    byPlatform[p].spend += row.spendCents ?? 0;
    byPlatform[p].impressions += Number(row.impressions ?? 0);
    byPlatform[p].clicks += Number(row.clicks ?? 0);
    byPlatform[p].conversions += row.conversions ?? 0;
    byPlatform[p].revenue += Number(row.revenueCents ?? 0);
  }

  // Compute ROAS per platform
  for (const p of Object.keys(byPlatform)) {
    const d = byPlatform[p];
    d.roas = d.spend > 0 ? Math.round((d.revenue / d.spend) * 100) / 100 : null;
    // Convert cents to euros
    d.spend = Math.round(d.spend / 100);
    d.revenue = Math.round(d.revenue / 100);
  }

  const spend = Number(totals?.totalSpendCents ?? 0);
  const revenue = Number(totals?.totalRevenueCents ?? 0);

  return NextResponse.json({
    range,
    platform,
    from: fromStr,
    to: toStr,
    hasData: daily.length > 0,
    totals: {
      spendEur: Math.round(spend / 100),
      impressions: Number(totals?.totalImpressions ?? 0),
      clicks: Number(totals?.totalClicks ?? 0),
      conversions: Number(totals?.totalConversions ?? 0),
      revenueEur: Math.round(revenue / 100),
      roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : null,
      ctr: Number(totals?.totalImpressions ?? 0) > 0
        ? Math.round((Number(totals?.totalClicks ?? 0) / Number(totals?.totalImpressions ?? 0)) * 10000) / 100
        : null,
    },
    byPlatform,
    daily: daily.map((d) => ({
      date: d.date,
      platform: d.platform,
      spendEur: Math.round((d.spendCents ?? 0) / 100),
      impressions: Number(d.impressions ?? 0),
      clicks: Number(d.clicks ?? 0),
      conversions: d.conversions ?? 0,
      roas: d.roas ? Number(d.roas) : null,
    })),
  });
}
