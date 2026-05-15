"use server";

import { getCurrentContext } from "@/lib/auth/current";
import { saveIntegration, deleteIntegration, type IntegrationProvider } from "@/lib/agency-keys";

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
