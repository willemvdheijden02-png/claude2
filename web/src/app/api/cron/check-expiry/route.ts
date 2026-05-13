// Cron: dagelijks. Stuurt notificaties bij naderende trial-afloop of Meta token expiry.
// Vercel Cron beveiligt via Authorization: Bearer ${CRON_SECRET}.

import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull, lte, gte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";
export const maxDuration = 60;

const META_GRAPH_VERSION = "v21.0";

async function checkMetaTokenExpiry(accessToken: string): Promise<{
  valid: boolean;
  expiresAt: Date | null;
}> {
  try {
    // /debug_token vereist een app_token of een geldige user token zelf
    const url = new URL(`https://graph.facebook.com/${META_GRAPH_VERSION}/debug_token`);
    url.searchParams.set("input_token", accessToken);
    url.searchParams.set("access_token", accessToken);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return { valid: false, expiresAt: null };
    const json = await res.json();
    const data = json?.data;
    if (!data?.is_valid) return { valid: false, expiresAt: null };
    const exp = data.expires_at ?? data.data_access_expires_at;
    return { valid: true, expiresAt: exp ? new Date(exp * 1000) : null };
  } catch {
    return { valid: false, expiresAt: null };
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const cronSecret = env("CRON_SECRET");
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const results = { trialsChecked: 0, trialsNotified: 0, tokensChecked: 0, tokensNotified: 0, tokensInvalid: 0 };

  // ============================================================
  // 1) Trial-expiring (3 dagen voor afloop)
  // ============================================================
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in4Days = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  const trialAgencies = await db
    .select({
      id: schema.agencies.id,
      displayName: schema.agencies.displayName,
      trialEndsAt: schema.agencies.trialEndsAt,
      adminUserId: schema.agencies.adminUserId,
    })
    .from(schema.agencies)
    .where(
      and(
        eq(schema.agencies.plan, "trial"),
        gte(schema.agencies.trialEndsAt, in3Days),
        lte(schema.agencies.trialEndsAt, in4Days)
      )
    );

  for (const ag of trialAgencies) {
    results.trialsChecked++;
    if (!ag.trialEndsAt) continue;
    const daysLeft = Math.ceil(
      (new Date(ag.trialEndsAt).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    );
    await createNotification({
      agencyId: ag.id,
      recipientUserId: ag.adminUserId ?? undefined,
      type: "trial_expiring",
      title: `Je trial verloopt over ${daysLeft} dagen`,
      body: "Kies een plan om door te gaan zonder onderbreking. Anders wordt je account na de trial gepauzeerd.",
      link: "/portal/billing",
      sendEmail: true,
    });
    results.trialsNotified++;
  }

  // ============================================================
  // 2) Meta token expiry (14 dagen voor verlopen of al ongeldig)
  // ============================================================
  const metaIntegrations = await db
    .select({
      agencyId: schema.agencyIntegrations.agencyId,
      credentials: schema.agencyIntegrations.credentials,
      lastVerifiedAt: schema.agencyIntegrations.lastVerifiedAt,
      status: schema.agencyIntegrations.status,
    })
    .from(schema.agencyIntegrations)
    .where(
      and(
        eq(schema.agencyIntegrations.provider, "meta"),
        eq(schema.agencyIntegrations.status, "connected")
      )
    );

  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  for (const integ of metaIntegrations) {
    results.tokensChecked++;
    const token = integ.credentials?.access_token;
    if (!token) continue;

    const { valid, expiresAt } = await checkMetaTokenExpiry(token);

    if (!valid) {
      await db
        .update(schema.agencyIntegrations)
        .set({
          status: "invalid",
          lastError: "Token verlopen of ingetrokken",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.agencyIntegrations.agencyId, integ.agencyId),
            eq(schema.agencyIntegrations.provider, "meta")
          )
        );
      await createNotification({
        agencyId: integ.agencyId,
        type: "integration_invalid",
        title: "Meta-koppeling ongeldig",
        body: "Je Meta access token werkt niet meer. Verlengen kan via Integraties.",
        link: "/portal/integrations",
        sendEmail: true,
      });
      results.tokensInvalid++;
      continue;
    }

    if (expiresAt && expiresAt < in14Days && expiresAt > now) {
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      await createNotification({
        agencyId: integ.agencyId,
        type: "meta_token_expiring",
        title: `Meta token verloopt over ${daysLeft} dagen`,
        body: "Genereer een nieuw long-lived token via Graph API Explorer en plak 'm in Integraties.",
        link: "/portal/integrations",
        sendEmail: true,
      });
      results.tokensNotified++;
    }

    // Update lastVerifiedAt
    await db
      .update(schema.agencyIntegrations)
      .set({ lastVerifiedAt: new Date() })
      .where(
        and(
          eq(schema.agencyIntegrations.agencyId, integ.agencyId),
          eq(schema.agencyIntegrations.provider, "meta")
        )
      );
  }

  return NextResponse.json({ ok: true, results });
}
