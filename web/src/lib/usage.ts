/**
 * Usage tracking — bijhoudt verbruik per agency per maand.
 * Stuurt WhatsApp alert naar Willem bij 80% en 100% van plan-limiet.
 */

import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendWhatsApp } from "@/lib/twilio";

export type UsageType = "anthropic" | "meta" | "scheduler";

// ─── Plan limieten per maand ─────────────────────────────────────────────────
// Gebaseerd op marktonderzoek: GoHighLevel $97-297, AgencyAnalytics $29-479.
// AI-content is NIET standaard bij concurrenten — premium differentiator.
export const PLAN_LIMITS: Record<
  string,
  { aiCalls: number; metaCalls: number; schedulerRuns: number }
> = {
  trial:     { aiCalls: 50,     metaCalls: 500,    schedulerRuns: 30    },
  starter:   { aiCalls: 500,    metaCalls: 2_500,  schedulerRuns: 150   },
  pro:       { aiCalls: 2_500,  metaCalls: 12_500, schedulerRuns: 750   },
  scale:     { aiCalls: 10_000, metaCalls: 50_000, schedulerRuns: 3_000 },
  cancelled: { aiCalls: 0,      metaCalls: 0,      schedulerRuns: 0     },
};

/**
 * Reset maandtellers als we in een nieuwe maand zitten.
 */
async function maybeResetMonthlyCounters(agencyId: string) {
  const [agency] = await db
    .select({ usageResetAt: schema.agencies.usageResetAt, plan: schema.agencies.plan })
    .from(schema.agencies)
    .where(eq(schema.agencies.id, agencyId))
    .limit(1);

  if (!agency) return;

  const now = new Date();
  const resetAt = new Date(agency.usageResetAt);
  const isNewMonth =
    now.getFullYear() > resetAt.getFullYear() ||
    now.getMonth() > resetAt.getMonth();

  if (isNewMonth) {
    await db
      .update(schema.agencies)
      .set({
        aiCallsThisMonth: 0,
        metaCallsThisMonth: 0,
        schedulerRunsThisMonth: 0,
        usageResetAt: now,
        usageAlert80Sent: false,
        usageAlert100Sent: false,
        updatedAt: now,
      })
      .where(eq(schema.agencies.id, agencyId));
  }
}

/**
 * Log een API call en verhoog de maandteller.
 * count = aantal calls (1 voor AI/scheduler, variabel voor Meta batch)
 */
export async function trackUsage(
  agencyId: string,
  type: UsageType,
  count: number = 1,
  metadata?: Record<string, unknown>
) {
  await maybeResetMonthlyCounters(agencyId);

  // Log de individuele call
  await db.insert(schema.usageLogs).values({
    agencyId,
    type,
    count,
    metadata: metadata ?? {},
  });

  // Atomisch increment van de juiste maandteller
  if (type === "anthropic") {
    await db
      .update(schema.agencies)
      .set({ aiCallsThisMonth: sql`${schema.agencies.aiCallsThisMonth} + ${count}`, updatedAt: new Date() })
      .where(eq(schema.agencies.id, agencyId));
  } else if (type === "meta") {
    await db
      .update(schema.agencies)
      .set({ metaCallsThisMonth: sql`${schema.agencies.metaCallsThisMonth} + ${count}`, updatedAt: new Date() })
      .where(eq(schema.agencies.id, agencyId));
  } else {
    await db
      .update(schema.agencies)
      .set({ schedulerRunsThisMonth: sql`${schema.agencies.schedulerRunsThisMonth} + ${count}`, updatedAt: new Date() })
      .where(eq(schema.agencies.id, agencyId));
  }

  // Check limieten en stuur WhatsApp alerts
  await checkLimitsAndAlert(agencyId);
}

/**
 * Haal huidige maandverbruik op.
 */
export async function getMonthlyUsage(agencyId: string) {
  await maybeResetMonthlyCounters(agencyId);

  const [agency] = await db
    .select({
      plan: schema.agencies.plan,
      displayName: schema.agencies.displayName,
      aiCalls: schema.agencies.aiCallsThisMonth,
      metaCalls: schema.agencies.metaCallsThisMonth,
      schedulerRuns: schema.agencies.schedulerRunsThisMonth,
      usageAlert80Sent: schema.agencies.usageAlert80Sent,
      usageAlert100Sent: schema.agencies.usageAlert100Sent,
    })
    .from(schema.agencies)
    .where(eq(schema.agencies.id, agencyId))
    .limit(1);

  if (!agency) return null;

  const limits = PLAN_LIMITS[agency.plan] ?? PLAN_LIMITS.trial;

  return {
    plan: agency.plan,
    displayName: agency.displayName,
    limits,
    usage: {
      aiCalls: agency.aiCalls,
      metaCalls: agency.metaCalls,
      schedulerRuns: agency.schedulerRuns,
    },
    percentages: {
      aiCalls: limits.aiCalls > 0 ? Math.round((agency.aiCalls / limits.aiCalls) * 100) : 0,
      metaCalls: limits.metaCalls > 0 ? Math.round((agency.metaCalls / limits.metaCalls) * 100) : 0,
      schedulerRuns:
        limits.schedulerRuns > 0
          ? Math.round((agency.schedulerRuns / limits.schedulerRuns) * 100)
          : 0,
    },
  };
}

/**
 * Controleer of een agency over de limiet gaat.
 * Returns false als geblokkeerd, true als nog ruimte is.
 */
export async function checkUsageAllowed(agencyId: string, type: UsageType): Promise<boolean> {
  const usage = await getMonthlyUsage(agencyId);
  if (!usage) return true;

  const { limits, usage: current } = usage;

  switch (type) {
    case "anthropic":
      return limits.aiCalls === 0 || current.aiCalls < limits.aiCalls;
    case "meta":
      return limits.metaCalls === 0 || current.metaCalls < limits.metaCalls;
    case "scheduler":
      return limits.schedulerRuns === 0 || current.schedulerRuns < limits.schedulerRuns;
  }
}

/**
 * Stuur WhatsApp alert naar Willem als een agency op 80% of 100% zit.
 */
async function checkLimitsAndAlert(agencyId: string) {
  const [agency] = await db
    .select()
    .from(schema.agencies)
    .where(eq(schema.agencies.id, agencyId))
    .limit(1);

  if (!agency) return;

  const limits = PLAN_LIMITS[agency.plan] ?? PLAN_LIMITS.trial;
  const maxPct = Math.max(
    limits.aiCalls > 0 ? (agency.aiCallsThisMonth / limits.aiCalls) * 100 : 0,
    limits.metaCalls > 0 ? (agency.metaCallsThisMonth / limits.metaCalls) * 100 : 0,
    limits.schedulerRuns > 0 ? (agency.schedulerRunsThisMonth / limits.schedulerRuns) * 100 : 0
  );

  if (maxPct >= 100 && !agency.usageAlert100Sent) {
    const msg =
      `🚨 *LIMIET BEREIKT* — ${agency.displayName}\n` +
      `Plan: ${agency.plan} | AI: ${agency.aiCallsThisMonth}/${limits.aiCalls} calls\n` +
      `Meta: ${agency.metaCallsThisMonth}/${limits.metaCalls} calls\n` +
      `Upgrade nodig of blokkeren.`;
    await sendWhatsApp(msg);
    await db
      .update(schema.agencies)
      .set({ usageAlert100Sent: true, updatedAt: new Date() })
      .where(eq(schema.agencies.id, agencyId));
  } else if (maxPct >= 80 && !agency.usageAlert80Sent) {
    const msg =
      `⚠️ *80% verbruikt* — ${agency.displayName}\n` +
      `Plan: ${agency.plan} | AI: ${agency.aiCallsThisMonth}/${limits.aiCalls} (${Math.round((agency.aiCallsThisMonth / limits.aiCalls) * 100)}%)\n` +
      `Meta: ${agency.metaCallsThisMonth}/${limits.metaCalls} (${Math.round((agency.metaCallsThisMonth / limits.metaCalls) * 100)}%)\n` +
      `Overweeg upgraden of contact opnemen.`;
    await sendWhatsApp(msg);
    await db
      .update(schema.agencies)
      .set({ usageAlert80Sent: true, updatedAt: new Date() })
      .where(eq(schema.agencies.id, agencyId));
  }
}
