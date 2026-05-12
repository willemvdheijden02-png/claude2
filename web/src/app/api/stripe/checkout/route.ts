import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { getCurrentContext } from "@/lib/auth/current";
import { db, schema } from "@/lib/db";
import { getStripePriceId, type PlanId } from "@/lib/plans";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Creates a Stripe Checkout Session voor het PLATFORM abonnement.
 * Gebruikt Willoe's eigen Stripe account (env STRIPE_SECRET_KEY), NIET de agency BYOK.
 */
export async function POST(req: NextRequest) {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) {
    return Response.json({ error: "Niet ingelogd of geen agency." }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: "starter" | "pro" | "scale" };
  if (!["starter", "pro", "scale"].includes(plan)) {
    return Response.json({ error: "Ongeldig plan." }, { status: 400 });
  }

  try {
    const stripe = getStripe(); // Willoe's eigen Stripe account
    const priceId = getStripePriceId(plan);
    const origin = env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3001";

    // Maak/zoek Stripe customer
    let customerId = ctx.agency.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: ctx.authUser.email ?? undefined,
        name: ctx.agency.displayName,
        metadata: {
          willoe_agency_id: ctx.agency.id,
          willoe_user_id: ctx.authUser.id,
        },
      });
      customerId = customer.id;
      await db
        .update(schema.agencies)
        .set({ stripeCustomerId: customerId })
        .where(eq(schema.agencies.id, ctx.agency.id));
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/portal/settings?upgraded=1`,
      cancel_url: `${origin}/portal/settings?cancelled=1`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          willoe_agency_id: ctx.agency.id,
          willoe_plan: plan,
        },
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
