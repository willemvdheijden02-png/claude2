import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "@/lib/env";
import { getAgencyKey, IntegrationNotConnectedError } from "@/lib/agency-keys";
import { getCurrentContext } from "@/lib/auth/current";

/**
 * BYOK: laadt agency-specifieke API keys uit DB.
 * Fallback naar env vars als de current user een operator is (Willem self-service).
 */

export async function getAnthropicForCurrentAgency() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) throw new IntegrationNotConnectedError("anthropic");

  // Operator fallback — Willem zelf mag eigen env key gebruiken voor testen
  if (ctx.profile?.role === "operator") {
    const envKey = env("ANTHROPIC_API_KEY");
    if (envKey) return createAnthropic({ apiKey: envKey });
  }

  const apiKey = await getAgencyKey(ctx.agency.id, "anthropic", "api_key");
  return createAnthropic({ apiKey });
}

export async function getGoogleForCurrentAgency() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) throw new IntegrationNotConnectedError("gemini");

  if (ctx.profile?.role === "operator") {
    const envKey = env("GOOGLE_API_KEY");
    if (envKey) return createGoogleGenerativeAI({ apiKey: envKey });
  }

  const apiKey = await getAgencyKey(ctx.agency.id, "gemini", "api_key");
  return createGoogleGenerativeAI({ apiKey });
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
