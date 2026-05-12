// Plan tiers en hun limits. Stripe Price IDs komen uit env.

import { env } from "@/lib/env";

export type PlanId = "trial" | "starter" | "pro" | "scale" | "cancelled";

export type Plan = {
  id: PlanId;
  name: string;
  monthlyPriceCents: number;
  onboardingsPerMonth: number;
  maxClients: number; // -1 = unlimited
  features: string[];
  stripePriceIdEnvKey?: string;
};

export const PLANS: Record<Exclude<PlanId, "cancelled">, Plan> = {
  trial: {
    id: "trial",
    name: "Trial (14 dagen)",
    monthlyPriceCents: 0,
    onboardingsPerMonth: 1,
    maxClients: 3,
    features: ["Volledige Pro features", "14 dagen gratis", "Daarna kies een plan"],
  },
  starter: {
    id: "starter",
    name: "Starter",
    monthlyPriceCents: 9900,
    onboardingsPerMonth: 3,
    maxClients: 5,
    features: [
      "Tot 5 klanten",
      "Live Meta Ads dashboard",
      "AI Studio (Beelden, Scripts, Ideeën)",
      "3 onboardings per maand",
      "Stripe facturen",
      "Email support",
    ],
    stripePriceIdEnvKey: "STRIPE_PRICE_STARTER",
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPriceCents: 29900,
    onboardingsPerMonth: 10,
    maxClients: -1,
    features: [
      "Onbeperkt klanten",
      "Live Meta + Google Ads",
      "Volledige AI Studio + Rapporten",
      "10 onboardings per maand",
      "White-label PDF + portal",
      "Priority support",
      "Stripe + Resend integratie",
    ],
    stripePriceIdEnvKey: "STRIPE_PRICE_PRO",
  },
  scale: {
    id: "scale",
    name: "Scale",
    monthlyPriceCents: 79900,
    onboardingsPerMonth: -1,
    maxClients: -1,
    features: [
      "Alles uit Pro",
      "Onbeperkt onboardings",
      "Tot 10 team leden",
      "Custom branded domain",
      "Dedicated success manager",
      "SLA garanties",
    ],
    stripePriceIdEnvKey: "STRIPE_PRICE_SCALE",
  },
};

export function getStripePriceId(plan: Exclude<PlanId, "trial" | "cancelled">): string {
  const def = PLANS[plan];
  const key = def.stripePriceIdEnvKey;
  if (!key) throw new Error(`No Stripe price for plan ${plan}`);
  const id = env(key);
  if (!id) throw new Error(`${key} missing in .env.local — set in Stripe Dashboard first`);
  return id;
}

export function planFromPriceId(priceId: string): Exclude<PlanId, "trial" | "cancelled"> | null {
  for (const planId of ["starter", "pro", "scale"] as const) {
    try {
      if (getStripePriceId(planId) === priceId) return planId;
    } catch {
      continue;
    }
  }
  return null;
}

export function isTrialActive(trialEndsAt: Date): boolean {
  return new Date(trialEndsAt) > new Date();
}

export function daysLeftInTrial(trialEndsAt: Date): number {
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function isFeaturesEnabled(plan: PlanId, trialEndsAt: Date): boolean {
  if (plan === "starter" || plan === "pro" || plan === "scale") return true;
  if (plan === "trial") return isTrialActive(trialEndsAt);
  return false; // cancelled
}
