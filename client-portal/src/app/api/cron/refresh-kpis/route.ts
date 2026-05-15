import { NextRequest, NextResponse } from "next/server";

// Scheduled taak — draait dagelijks om 07:00
// Triggert de KPI sync in de agency app zodat kpi_snapshots up-to-date zijn.
// Vercel Cron roept dit endpoint aan via vercel.json.

export async function GET(req: NextRequest) {
  // Beveilig met CRON_SECRET (zelfde als agency app)
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const agencyUrl = process.env.AGENCY_APP_URL ?? "http://localhost:3002";
  const cronSecret = process.env.CRON_SECRET ?? "";

  try {
    // Trigger de bestaande sync-kpis cron in de agency app
    const res = await fetch(`${agencyUrl}/api/cron/sync-kpis`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
      signal: AbortSignal.timeout(120_000),
    });

    const body = await res.json().catch(() => ({}));

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      triggered: new Date().toISOString(),
      response: body,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
