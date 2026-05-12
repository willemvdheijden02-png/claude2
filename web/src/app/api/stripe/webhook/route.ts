import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { planFromPriceId, PLANS } from "@/lib/plans";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = env("STRIPE_WEBHOOK_SECRET");
  const body = await req.text();

  if (!sig || !secret) {
    return new Response("Missing signature or secret", { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // ============================================================
      // Subscription events — Willoe's platform billing
      // ============================================================
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const agencyId = sub.metadata?.willoe_agency_id;
        if (!agencyId) break;

        const priceId = sub.items.data[0]?.price.id;
        const plan = priceId ? planFromPriceId(priceId) : null;
        const planDef = plan ? PLANS[plan] : null;

        await db
          .update(schema.agencies)
          .set({
            plan: plan ?? "trial",
            stripeSubscriptionId: sub.id,
            status: sub.status === "active" || sub.status === "trialing" ? "active" : "paused",
            monthlyFeeCents: planDef?.monthlyPriceCents ?? undefined,
            onboardingsQuota: planDef?.onboardingsPerMonth ?? undefined,
            currentPeriodEndsAt: sub.items.data[0]?.current_period_end
              ? new Date(sub.items.data[0].current_period_end * 1000)
              : null,
            updatedAt: new Date(),
          })
          .where(eq(schema.agencies.id, agencyId));
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const agencyId = sub.metadata?.willoe_agency_id;
        if (!agencyId) break;
        await db
          .update(schema.agencies)
          .set({
            plan: "cancelled",
            status: "paused",
            updatedAt: new Date(),
          })
          .where(eq(schema.agencies.id, agencyId));
        break;
      }

      // ============================================================
      // Invoice events — voor agency's eigen facturen aan eindklanten
      // (deze gaat naar de agency's BYOK Stripe, niet Willoe's)
      // ============================================================
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.id) {
          await db
            .update(schema.invoices)
            .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
            .where(eq(schema.invoices.stripeInvoiceId, invoice.id));
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.id) {
          await db
            .update(schema.invoices)
            .set({ status: "overdue", updatedAt: new Date() })
            .where(eq(schema.invoices.stripeInvoiceId, invoice.id));
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook]", err);
    return new Response("DB update failed", { status: 500 });
  }

  return Response.json({ received: true });
}
