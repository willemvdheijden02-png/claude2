"use server";

import { revalidatePath } from "next/cache";
import { getCurrentContext } from "@/lib/auth/current";
import {
  saveIntegration,
  deleteIntegration,
  type IntegrationProvider,
} from "@/lib/agency-keys";

export type IntegrationResult = { error: string } | { success: true };

const providerFields: Record<IntegrationProvider, string[]> = {
  anthropic: ["api_key"],
  gemini: ["api_key"],
  meta: ["app_id", "access_token"],
  google_ads: ["developer_token", "customer_id"],
  stripe: ["secret_key", "publishable_key"],
  resend: ["api_key"],
};

export async function connectIntegration(
  _prev: IntegrationResult | null,
  formData: FormData
): Promise<IntegrationResult> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return { error: "Geen actieve agency." };

  const provider = formData.get("provider") as IntegrationProvider;
  if (!provider || !providerFields[provider]) {
    return { error: "Ongeldige provider." };
  }

  const credentials: Record<string, string> = {};
  for (const field of providerFields[provider]) {
    const value = (formData.get(field) as string)?.trim();
    if (!value) return { error: `Veld '${field}' is verplicht.` };
    credentials[field] = value;
  }

  const result = await saveIntegration(ctx.agency.id, provider, credentials);
  revalidatePath("/portal/integrations");
  if (result.error) return { error: result.error };
  return { success: true };
}

export async function disconnectIntegration(
  provider: IntegrationProvider
): Promise<{ error?: string }> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return { error: "Geen actieve agency." };
  await deleteIntegration(ctx.agency.id, provider);
  revalidatePath("/portal/integrations");
  return {};
}
