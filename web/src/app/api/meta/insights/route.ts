import { NextRequest } from "next/server";
import { getPeriodComparison, type MetaPeriod } from "@/lib/meta/insights";
import { IntegrationNotConnectedError } from "@/lib/agency-keys";

export const runtime = "nodejs";
export const maxDuration = 30;

const validPeriods: MetaPeriod[] = ["4d", "7d", "14d", "30d", "90d"];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const accountId = url.searchParams.get("account") ?? "act_664527626124737";
  const periodParam = url.searchParams.get("period") ?? "7d";
  const period: MetaPeriod = (validPeriods.includes(periodParam as MetaPeriod)
    ? periodParam
    : "7d") as MetaPeriod;

  try {
    const data = await getPeriodComparison(accountId, period);
    return Response.json(data);
  } catch (err) {
    if (err instanceof IntegrationNotConnectedError) {
      return Response.json(
        { error: "Connect je Meta Business token in /portal/integrations om live data te zien." },
        { status: 402 }
      );
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
