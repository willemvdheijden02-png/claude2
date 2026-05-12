import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { getCurrentContext } from "@/lib/auth/current";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Stripe Customer Portal voor self-service abonnement beheer.
 * Klanten kunnen daar upgrade/downgrade/cancel doen + facturen bekijken.
 */
export async function POST(req: NextRequest) {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return Response.json({ error: "Niet ingelogd." }, { status: 401 });

  if (!ctx.agency.stripeCustomerId) {
    return Response.json({ error: "Nog geen abonnement. Start eerst een abonnement via Upgrade." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const origin = env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3001";

    const session = await stripe.billingPortal.sessions.create({
      customer: ctx.agency.stripeCustomerId,
      return_url: `${origin}/portal/settings`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
