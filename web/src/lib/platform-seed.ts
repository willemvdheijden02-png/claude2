/**
 * Platform integrations seeder.
 * Vult nieuwe agencies automatisch in met Willem's platform-keys.
 * Agencies kunnen deze later overschrijven met eigen BYOK via /portal/integrations.
 */

import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";

type Provider = typeof schema.agencyIntegrations.$inferInsert["provider"];

function buildPlatformCredentials(): Array<{
  provider: Provider;
  credentials: Record<string, string>;
}> {
  const integrations: Array<{ provider: Provider; credentials: Record<string, string> }> = [];

  const anthropicKey = env("ANTHROPIC_API_KEY");
  if (anthropicKey) {
    integrations.push({ provider: "anthropic", credentials: { api_key: anthropicKey } });
  }

  const geminiKey = env("GOOGLE_API_KEY");
  if (geminiKey) {
    integrations.push({ provider: "gemini", credentials: { api_key: geminiKey } });
  }

  const metaToken = env("META_ACCESS_TOKEN");
  if (metaToken) {
    integrations.push({
      provider: "meta",
      credentials: {
        access_token: metaToken,
        ...(env("META_APP_ID") ? { app_id: env("META_APP_ID")! } : {}),
      },
    });
  }

  const gadsToken = env("GOOGLE_ADS_DEVELOPER_TOKEN");
  if (gadsToken) {
    integrations.push({
      provider: "google_ads",
      credentials: {
        developer_token: gadsToken,
        ...(env("GOOGLE_ADS_CUSTOMER_ID") ? { customer_id: env("GOOGLE_ADS_CUSTOMER_ID")! } : {}),
      },
    });
  }

  const resendKey = env("RESEND_API_KEY");
  if (resendKey) {
    integrations.push({ provider: "resend", credentials: { api_key: resendKey } });
  }

  return integrations;
}

/**
 * Seed platform integrations voor een nieuwe agency.
 * Doet niets als de agency al keys heeft voor die provider.
 */
export async function seedPlatformIntegrations(agencyId: string): Promise<void> {
  const integrations = buildPlatformCredentials();
  if (integrations.length === 0) return;

  for (const { provider, credentials } of integrations) {
    await db
      .insert(schema.agencyIntegrations)
      .values({
        agencyId,
        provider,
        credentials,
        status: "connected",
        lastVerifiedAt: new Date(),
      })
      .onConflictDoNothing(); // Skip als agency al eigen keys heeft
  }
}
