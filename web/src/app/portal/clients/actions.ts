"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";

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
