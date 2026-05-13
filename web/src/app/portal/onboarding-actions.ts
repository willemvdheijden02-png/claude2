"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";

const DEMO_CLIENTS = [
  {
    displayName: "Bol BH's",
    websiteUrl: "https://bolbhs.nl",
    icpDescription: "Vrouwen 40-65 met BH-pasvorm problemen na overgang",
    budgetMonthlyCents: 800000,
    competitors: ["https://anita.com", "https://triumph.com", "https://livera.nl"],
    status: "active" as const,
  },
  {
    displayName: "Slaapwijs",
    websiteUrl: "https://slaapwijs.nl",
    icpDescription: "Vrouwen 50+ met nekpijn en slaapproblemen",
    budgetMonthlyCents: 1250000,
    competitors: ["https://emma.com", "https://derila.com"],
    status: "active" as const,
  },
  {
    displayName: "Hopper Lingerie",
    websiteUrl: "https://hopper.nl",
    icpDescription: "Premium lingerie voor 35-55, kwaliteits-georiënteerd",
    budgetMonthlyCents: 500000,
    competitors: ["https://livera.nl", "https://yamamay.com"],
    status: "onboarding" as const,
  },
];

export async function seedDemoData(): Promise<{ error?: string; success?: true }> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return { error: "Geen actieve agency." };

  try {
    // Check of er al echte klanten zijn
    const existing = await db
      .select({ id: schema.clients.id })
      .from(schema.clients)
      .where(eq(schema.clients.agencyId, ctx.agency.id))
      .limit(1);

    if (existing.length > 0) {
      return { error: "Je hebt al klanten — demo data wordt overgeslagen." };
    }

    // Maak 3 demo klanten
    const insertedClients = await db
      .insert(schema.clients)
      .values(
        DEMO_CLIENTS.map((c) => ({
          agencyId: ctx.agency!.id,
          displayName: c.displayName,
          websiteUrl: c.websiteUrl,
          icpDescription: c.icpDescription,
          budgetMonthlyCents: c.budgetMonthlyCents,
          competitors: c.competitors,
          status: c.status,
        }))
      )
      .returning({ id: schema.clients.id });

    // Zoek een service om demo requests aan te maken
    const [service] = await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.slug, "meta-ads-audit"))
      .limit(1);

    if (service && insertedClients.length > 0) {
      // Maak 2 demo service requests
      await db.insert(schema.serviceRequests).values([
        {
          agencyId: ctx.agency.id,
          clientId: insertedClients[0].id,
          serviceId: service.id,
          requestedBy: ctx.authUser.id,
          status: "done",
          brief: "Wekelijkse audit — focus op CPA en creative fatigue",
          completedAt: new Date(Date.now() - 86400000),
        },
        {
          agencyId: ctx.agency.id,
          clientId: insertedClients[1].id,
          serviceId: service.id,
          requestedBy: ctx.authUser.id,
          status: "pending",
          brief: "Nieuwe campagne setup voor zomer-actie 60 nachten proef",
        },
      ]);
    }

    revalidatePath("/portal", "layout");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Kon demo data niet maken." };
  }
}
