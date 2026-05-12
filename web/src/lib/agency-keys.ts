// BYOK helper: laadt agency-specifieke API keys uit DB.
// Vervangt env() voor variabele-kosten services.

import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";

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
 * Haalt credentials op voor een specifieke agency + provider.
 * Throws IntegrationNotConnectedError als niet geconnect of geen credentials.
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

  if (!row || row.status !== "connected" || !row.credentials) {
    throw new IntegrationNotConnectedError(provider);
  }
  return row.credentials as Record<string, string>;
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
