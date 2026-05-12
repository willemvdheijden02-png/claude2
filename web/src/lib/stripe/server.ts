import Stripe from "stripe";
import { env } from "@/lib/env";
import { getAgencyKey, IntegrationNotConnectedError } from "@/lib/agency-keys";
import { getCurrentContext } from "@/lib/auth/current";

/**
 * Operator helper — eigen platform Stripe.
 */
export function getStripe(): Stripe {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY missing in .env.local");
  return new Stripe(key, {
    typescript: true,
    appInfo: { name: "Willoe", version: "0.1.0" },
  });
}

/**
 * Agency-specifieke Stripe client — gebruikt agency's BYO key.
 * Operator fallback voor Willem zelf.
 */
export async function getStripeForCurrentAgency(): Promise<Stripe> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) throw new IntegrationNotConnectedError("stripe");

  if (ctx.profile?.role === "operator") {
    const envKey = env("STRIPE_SECRET_KEY");
    if (envKey) {
      return new Stripe(envKey, { typescript: true, appInfo: { name: "Willoe", version: "0.1.0" } });
    }
  }

  const secretKey = await getAgencyKey(ctx.agency.id, "stripe", "secret_key");
  return new Stripe(secretKey, { typescript: true, appInfo: { name: "Willoe", version: "0.1.0" } });
}

export function isStripeLiveMode(): boolean {
  const key = env("STRIPE_SECRET_KEY") ?? "";
  return key.startsWith("sk_live_");
}
