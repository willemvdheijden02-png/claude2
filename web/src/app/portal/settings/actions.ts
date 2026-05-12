"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";

export type SettingsResult = { error: string } | { success: true };

export async function updateAgencyBranding(
  _prev: SettingsResult | null,
  formData: FormData
): Promise<SettingsResult> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return { error: "Geen actieve agency." };

  const displayName = (formData.get("displayName") as string)?.trim();
  const primaryColor = (formData.get("primaryColor") as string)?.trim();
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;

  if (!displayName || displayName.length < 2) {
    return { error: "Naam moet minimaal 2 tekens zijn." };
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
    return { error: "Kleur moet een geldige hex zijn (bv #10b981)." };
  }

  try {
    await db
      .update(schema.agencies)
      .set({
        displayName,
        primaryColor,
        accentColor: primaryColor,
        logoUrl,
        updatedAt: new Date(),
      })
      .where(eq(schema.agencies.id, ctx.agency.id));
    revalidatePath("/portal", "layout");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update faalde." };
  }
}

export async function updateAgencyBilling(
  _prev: SettingsResult | null,
  formData: FormData
): Promise<SettingsResult> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return { error: "Geen actieve agency." };

  const kvkNumber = (formData.get("kvkNumber") as string)?.trim() || null;
  const vatNumber = (formData.get("vatNumber") as string)?.trim() || null;
  const vatRate = parseInt((formData.get("vatRate") as string) || "21", 10);
  const street = (formData.get("street") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const postalCode = (formData.get("postalCode") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || "NL";

  if (![0, 9, 21].includes(vatRate)) {
    return { error: "BTW moet 0, 9 of 21 zijn." };
  }

  try {
    await db
      .update(schema.agencies)
      .set({
        kvkNumber,
        vatNumber,
        vatRate,
        billingAddress: { street, city, postalCode, country },
        updatedAt: new Date(),
      })
      .where(eq(schema.agencies.id, ctx.agency.id));
    revalidatePath("/portal/settings");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update faalde." };
  }
}
