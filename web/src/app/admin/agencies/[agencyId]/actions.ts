"use server";

import { eq } from "drizzle-orm";
import { getCurrentContext } from "@/lib/auth/current";
import { saveIntegration, deleteIntegration, type IntegrationProvider } from "@/lib/agency-keys";
import { db, schema } from "@/lib/db";

/** Operator-only: zet het plan van een agency handmatig. */
export async function adminSetPlan(
  agencyId: string,
  plan: "trial" | "starter" | "pro" | "scale" | "cancelled"
): Promise<{ error?: string }> {
  const ctx = await getCurrentContext();
  if (ctx?.profile?.role !== "operator") return { error: "Geen toegang." };

  await db
    .update(schema.agencies)
    .set({ plan, status: plan === "cancelled" ? "churned" : plan === "trial" ? "trial" : "active", updatedAt: new Date() })
    .where(eq(schema.agencies.id, agencyId));

  return {};
}

/** Operator-only: reset de maandtellers van een agency (bv. bij upgrade midden in de maand). */
export async function adminResetUsage(agencyId: string): Promise<{ error?: string }> {
  const ctx = await getCurrentContext();
  if (ctx?.profile?.role !== "operator") return { error: "Geen toegang." };

  await db
    .update(schema.agencies)
    .set({
      aiCallsThisMonth: 0,
      metaCallsThisMonth: 0,
      schedulerRunsThisMonth: 0,
      usageResetAt: new Date(),
      usageAlert80Sent: false,
      usageAlert100Sent: false,
      updatedAt: new Date(),
    })
    .where(eq(schema.agencies.id, agencyId));

  return {};
}

/** Operator-only: sla API-key op namens een agency. */
export async function adminSaveIntegration(
  agencyId: string,
  provider: IntegrationProvider,
  credentials: Record<string, string>
): Promise<{ error?: string }> {
  const ctx = await getCurrentContext();
  if (ctx?.profile?.role !== "operator") return { error: "Geen toegang." };

  const cleaned = Object.fromEntries(
    Object.entries(credentials).filter(([, v]) => v.trim() !== "")
  );
  if (Object.keys(cleaned).length === 0) return { error: "Vul minimaal één veld in." };

  return saveIntegration(agencyId, provider, cleaned);
}

/** Operator-only: verwijder API-koppeling van een agency. */
export async function adminDeleteIntegration(
  agencyId: string,
  provider: IntegrationProvider
): Promise<{ error?: string }> {
  const ctx = await getCurrentContext();
  if (ctx?.profile?.role !== "operator") return { error: "Geen toegang." };
  await deleteIntegration(agencyId, provider);
  return {};
}
