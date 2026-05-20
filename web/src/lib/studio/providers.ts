import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getAgencyCredentials, IntegrationNotConnectedError } from "@/lib/agency-keys";
import { getCurrentContext } from "@/lib/auth/current";
import { trackUsage, checkUsageAllowed } from "@/lib/usage";
import { env } from "@/lib/env";

/**
 * Laadt Anthropic client voor de huidige agency.
 * Gebruikt agency's eigen keys (BYOK) of platform keys als fallback.
 * Logt usage na elke call voor facturatie + limiet-bewaking.
 */
export async function getAnthropicForCurrentAgency() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) throw new IntegrationNotConnectedError("anthropic");

  // Controleer of agency nog binnen limiet zit
  const allowed = await checkUsageAllowed(ctx.agency.id, "anthropic");
  if (!allowed) {
    throw new Error(
      "Je hebt je maandlimiet voor AI-calls bereikt. Upgrade je plan in /portal/billing."
    );
  }

  const creds = await getAgencyCredentials(ctx.agency.id, "anthropic");
  const client = createAnthropic({ apiKey: creds.api_key });

  // Log de call (fire-and-forget — niet awaiten om stream niet te vertragen)
  trackUsage(ctx.agency.id, "anthropic", 1).catch(console.error);

  return client;
}

export async function getGoogleForCurrentAgency() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) throw new IntegrationNotConnectedError("gemini");

  const creds = await getAgencyCredentials(ctx.agency.id, "gemini");
  return createGoogleGenerativeAI({ apiKey: creds.api_key });
}

// Legacy helpers (operator only) — voor backwards compat tot we ze allemaal vervangen
export function getAnthropic() {
  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing in .env.local");
  return createAnthropic({ apiKey });
}

export function getGoogle() {
  const apiKey = env("GOOGLE_API_KEY");
  if (!apiKey) throw new Error("GOOGLE_API_KEY missing in .env.local");
  return createGoogleGenerativeAI({ apiKey });
}
