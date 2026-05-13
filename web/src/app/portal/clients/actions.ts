"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";
import { env } from "@/lib/env";

export type ClientResult = { error: string } | { success: true; clientId: string };

export async function createClient(
  _prev: ClientResult | null,
  formData: FormData
): Promise<ClientResult> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return { error: "Geen actieve agency. Login opnieuw." };

  const displayName = (formData.get("displayName") as string)?.trim();
  const websiteUrl = (formData.get("websiteUrl") as string)?.trim() || null;
  const icpDescription = (formData.get("icpDescription") as string)?.trim() || null;
  const budgetRaw = (formData.get("budgetMonthly") as string)?.trim();
  const budgetMonthlyCents = budgetRaw ? Math.round(parseFloat(budgetRaw) * 100) : null;
  const metaAdAccountId = (formData.get("metaAdAccountId") as string)?.trim() || null;
  const googleAdsCustomerId = (formData.get("googleAdsCustomerId") as string)?.trim() || null;
  const competitorsRaw = (formData.get("competitors") as string)?.trim() || "";
  const competitors = competitorsRaw
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!displayName) return { error: "Vul een klantnaam in." };
  if (displayName.length < 2) return { error: "Naam moet minimaal 2 tekens zijn." };

  // Meta ad account format check (mag leeg, anders moet beginnen met act_)
  if (metaAdAccountId && !metaAdAccountId.startsWith("act_")) {
    return { error: "Meta ad account ID moet beginnen met 'act_' (bv act_1234567890)." };
  }

  try {
    const [inserted] = await db
      .insert(schema.clients)
      .values({
        agencyId: ctx.agency.id,
        displayName,
        websiteUrl,
        icpDescription,
        budgetMonthlyCents,
        metaAdAccountId,
        googleAdsCustomerId,
        competitors: competitors.length > 0 ? competitors : null,
        status: "new",
      })
      .returning({ id: schema.clients.id });

    revalidatePath("/portal/clients");
    revalidatePath("/portal");
    return { success: true, clientId: inserted.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Kon klant niet aanmaken." };
  }
}

function generatePortalToken() {
  // 32 random bytes -> 43-char URL-safe base64
  return randomBytes(32).toString("base64url");
}

async function sendPortalMagicLink(
  toEmail: string,
  clientName: string,
  agencyName: string,
  agencyColor: string,
  portalUrl: string
) {
  const apiKey = env("RESEND_API_KEY");
  if (!apiKey) return { ok: false, reason: "Resend niet geconfigureerd." };
  const fromEmail = env("RESEND_FROM_EMAIL") ?? "Willoe <onboard@resend.dev>";

  const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fafafa;margin:0;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">
  <div style="padding:24px;">
    <h1 style="font-size:20px;margin:0 0 12px;color:#0a0a0a;">Welkom bij je klantportaal</h1>
    <p style="font-size:14px;color:#525252;line-height:1.5;margin:0 0 20px;">
      Hi ${clientName},<br/><br/>
      ${agencyName} heeft een klantportaal voor je klaargezet. Hier vind je je rapporten,
      KPI&apos;s en facturen op één plek. De link werkt zonder wachtwoord — bewaar 'm goed.
    </p>
    <a href="${portalUrl}" style="display:inline-block;background:${agencyColor};color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:14px;font-weight:500;">
      Open je portaal
    </a>
    <p style="font-size:12px;color:#a3a3a3;margin:24px 0 0;line-height:1.5;">
      Of kopieer deze link:<br/>
      <span style="word-break:break-all;">${portalUrl}</span>
    </p>
  </div>
</div>
</body></html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `Je klantportaal bij ${agencyName}`,
        html,
      }),
    });
    return { ok: res.ok };
  } catch (err) {
    console.error("[portal magic link]", err);
    return { ok: false };
  }
}

export async function enableClientPortal(
  clientId: string,
  portalEmail: string
): Promise<{ error?: string; portalUrl?: string; emailSent?: boolean }> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return { error: "Geen actieve agency." };

  const email = portalEmail.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Vul een geldig emailadres in." };
  }

  const [client] = await db
    .select()
    .from(schema.clients)
    .where(and(eq(schema.clients.id, clientId), eq(schema.clients.agencyId, ctx.agency.id)))
    .limit(1);
  if (!client) return { error: "Klant niet gevonden." };

  const token = client.portalToken ?? generatePortalToken();

  await db
    .update(schema.clients)
    .set({
      portalEnabled: true,
      portalToken: token,
      portalEmail: email,
      updatedAt: new Date(),
    })
    .where(eq(schema.clients.id, clientId));

  const siteUrl = env("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3001";
  const portalUrl = `${siteUrl}/c/${token}`;

  const sent = await sendPortalMagicLink(
    email,
    client.displayName,
    ctx.agency.displayName,
    ctx.agency.primaryColor,
    portalUrl
  );

  revalidatePath("/portal/clients");
  return { portalUrl, emailSent: sent.ok };
}

export async function disableClientPortal(
  clientId: string
): Promise<{ error?: string }> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return { error: "Geen actieve agency." };

  await db
    .update(schema.clients)
    .set({ portalEnabled: false, updatedAt: new Date() })
    .where(and(eq(schema.clients.id, clientId), eq(schema.clients.agencyId, ctx.agency.id)));

  revalidatePath("/portal/clients");
  return {};
}

export async function resendPortalMagicLink(
  clientId: string
): Promise<{ error?: string; emailSent?: boolean }> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return { error: "Geen actieve agency." };

  const [client] = await db
    .select()
    .from(schema.clients)
    .where(and(eq(schema.clients.id, clientId), eq(schema.clients.agencyId, ctx.agency.id)))
    .limit(1);
  if (!client || !client.portalToken || !client.portalEmail) {
    return { error: "Portal is niet ingeschakeld voor deze klant." };
  }

  const siteUrl = env("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3001";
  const portalUrl = `${siteUrl}/c/${client.portalToken}`;

  const sent = await sendPortalMagicLink(
    client.portalEmail,
    client.displayName,
    ctx.agency.displayName,
    ctx.agency.primaryColor,
    portalUrl
  );

  return { emailSent: sent.ok };
}

export async function deleteClient(clientId: string): Promise<{ error?: string }> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return { error: "Geen actieve agency." };

  try {
    // RLS zorgt dat alleen eigen clients gedeletet worden, maar dubbel-check:
    const [client] = await db
      .select()
      .from(schema.clients)
      .where(eq(schema.clients.id, clientId))
      .limit(1);
    if (!client || client.agencyId !== ctx.agency.id) {
      return { error: "Klant niet gevonden of geen toegang." };
    }
    await db.delete(schema.clients).where(eq(schema.clients.id, clientId));
    revalidatePath("/portal/clients");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Kon klant niet verwijderen." };
  }
}
