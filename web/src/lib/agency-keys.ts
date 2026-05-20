// Agency keys helper: laadt API keys uit DB met fallback naar platform-keys (Willem's keys).
// Agencies draaien standaard op de platform-keys zodat ze direct kunnen starten.
// Ze kunnen optioneel hun eigen BYOK keys instellen in /portal/integrations.

import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";

export type IntegrationProvider =
  | "anthropic"
  | "gemini"
  | "meta"
  | "google_ads"
  | "stripe"
  | "resend";

export class IntegrationNotConnectedError extends Error {
  constructor(public provider: IntegrationProvider) {
    super(`Integration '${provider}' is not connected. Connect it in /portal/integrations.`);
    this.name = "IntegrationNotConnectedError";
  }
}

/**
 * Platform-keys fallback — Willem's API keys als default voor alle agencies.
 * Agencies kunnen dit overschrijven met hun eigen BYOK in /portal/integrations.
 */
function getPlatformKeys(provider: IntegrationProvider): Record<string, string> | null {
  switch (provider) {
    case "anthropic": {
      const key = env("ANTHROPIC_API_KEY");
      return key ? { api_key: key } : null;
    }
    case "gemini": {
      const key = env("GOOGLE_API_KEY");
      return key ? { api_key: key } : null;
    }
    case "meta": {
      const token = env("META_ACCESS_TOKEN");
      const appId = env("META_APP_ID");
      if (!token) return null;
      return {
        access_token: token,
        ...(appId ? { app_id: appId } : {}),
      };
    }
    case "google_ads": {
      const devToken = env("GOOGLE_ADS_DEVELOPER_TOKEN");
      const customerId = env("GOOGLE_ADS_CUSTOMER_ID");
      if (!devToken) return null;
      return {
        developer_token: devToken,
        ...(customerId ? { customer_id: customerId } : {}),
      };
    }
    case "resend": {
      const key = env("RESEND_API_KEY");
      return key ? { api_key: key } : null;
    }
    case "stripe":
      // Stripe is altijd BYOK — elke agency heeft eigen Stripe account
      return null;
  }
}

/**
 * Haalt credentials op voor een agency + provider.
 * Prioriteit: 1. Agency's eigen keys (BYOK)  2. Platform keys (Willem's keys)
 * Gooit IntegrationNotConnectedError als beide ontbreken.
 */
export async function getAgencyCredentials(
  agencyId: string,
  provider: IntegrationProvider
): Promise<Record<string, string>> {
  const [row] = await db
    .select()
    .from(schema.agencyIntegrations)
    .where(
      and(
        eq(schema.agencyIntegrations.agencyId, agencyId),
        eq(schema.agencyIntegrations.provider, provider)
      )
    )
    .limit(1);

  // Agency heeft eigen werkende keys → gebruik die
  if (row && row.status === "connected" && row.credentials && Object.keys(row.credentials).length > 0) {
    return row.credentials as Record<string, string>;
  }

  // Fallback: platform keys (alle agencies draaien standaard hierop)
  const platformKeys = getPlatformKeys(provider);
  if (platformKeys) return platformKeys;

  throw new IntegrationNotConnectedError(provider);
}

/**
 * Convenience: haalt één specifiek veld op (bv "api_key").
 */
export async function getAgencyKey(
  agencyId: string,
  provider: IntegrationProvider,
  field: string = "api_key"
): Promise<string> {
  const creds = await getAgencyCredentials(agencyId, provider);
  const value = creds[field];
  if (!value) throw new IntegrationNotConnectedError(provider);
  return value;
}

/**
 * Status overview voor de Integrations pagina.
 */
export async function getAllIntegrations(agencyId: string) {
  const rows = await db
    .select()
    .from(schema.agencyIntegrations)
    .where(eq(schema.agencyIntegrations.agencyId, agencyId));
  return rows;
}

/**
 * Test een provider's credentials live.
 * Returns een leesbare error string of null bij success.
 */
export async function verifyCredentials(
  provider: IntegrationProvider,
  credentials: Record<string, string>
): Promise<string | null> {
  try {
    switch (provider) {
      case "anthropic": {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": credentials.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5",
            max_tokens: 5,
            messages: [{ role: "user", content: "hi" }],
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.status === 401) return "Ongeldige Anthropic API key.";
        if (!res.ok) return `Anthropic returned ${res.status}.`;
        return null;
      }
      case "gemini": {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${credentials.api_key}`,
          { signal: AbortSignal.timeout(10000) }
        );
        if (res.status === 400) return "Ongeldige Gemini API key (400).";
        if (!res.ok) return `Gemini returned ${res.status}.`;
        return null;
      }
      case "meta": {
        const res = await fetch(
          `https://graph.facebook.com/v21.0/me?access_token=${credentials.access_token}`,
          { signal: AbortSignal.timeout(10000) }
        );
        const data = await res.json();
        if (data.error) return `Meta: ${data.error.message}`;
        return null;
      }
      case "stripe": {
        const res = await fetch("https://api.stripe.com/v1/balance", {
          headers: { Authorization: `Bearer ${credentials.secret_key}` },
          signal: AbortSignal.timeout(10000),
        });
        if (res.status === 401) return "Ongeldige Stripe secret key.";
        if (!res.ok) return `Stripe returned ${res.status}.`;
        return null;
      }
      case "google_ads": {
        // Lichtgewicht check: developer token format
        if (!credentials.developer_token || credentials.developer_token.length < 10) {
          return "Developer token lijkt ongeldig (te kort).";
        }
        return null;
      }
      case "resend": {
        const res = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${credentials.api_key}` },
          signal: AbortSignal.timeout(10000),
        });
        if (res.status === 401) return "Ongeldige Resend API key.";
        if (!res.ok) return `Resend returned ${res.status}.`;
        return null;
      }
    }
  } catch (err) {
    return err instanceof Error ? err.message : "Verificatie faalde.";
  }
  return null;
}

/**
 * Sla credentials op + verifieer ze live.
 */
export async function saveIntegration(
  agencyId: string,
  provider: IntegrationProvider,
  credentials: Record<string, string>
): Promise<{ error?: string }> {
  const verifyError = await verifyCredentials(provider, credentials);
  const status: typeof schema.agencyIntegrations.$inferSelect.status = verifyError ? "invalid" : "connected";

  await db
    .insert(schema.agencyIntegrations)
    .values({
      agencyId,
      provider,
      credentials,
      status,
      lastVerifiedAt: new Date(),
      lastError: verifyError,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [schema.agencyIntegrations.agencyId, schema.agencyIntegrations.provider],
      set: {
        credentials,
        status,
        lastVerifiedAt: new Date(),
        lastError: verifyError,
        updatedAt: new Date(),
      },
    });

  return verifyError ? { error: verifyError } : {};
}

export async function deleteIntegration(agencyId: string, provider: IntegrationProvider) {
  await db
    .delete(schema.agencyIntegrations)
    .where(
      and(
        eq(schema.agencyIntegrations.agencyId, agencyId),
        eq(schema.agencyIntegrations.provider, provider)
      )
    );
}
