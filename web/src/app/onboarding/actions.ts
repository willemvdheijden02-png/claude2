"use server";

import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/current";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export type OnboardingResult = { error: string } | { success: true };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export async function createAgency(
  _prev: OnboardingResult | null,
  formData: FormData
): Promise<OnboardingResult> {
  const user = await getAuthUser();
  if (!user) return { error: "Niet ingelogd." };

  const displayName = (formData.get("displayName") as string)?.trim();
  const primaryColor = (formData.get("primaryColor") as string) || "#10b981";

  if (!displayName) return { error: "Vul een agency-naam in." };
  if (displayName.length < 2) return { error: "Naam moet minimaal 2 tekens zijn." };

  // Idempotent: als user al een agency heeft, ga gewoon naar portal
  const [existingForUser] = await db
    .select()
    .from(schema.agencies)
    .where(eq(schema.agencies.adminUserId, user.id))
    .limit(1);
  if (existingForUser) {
    redirect("/portal");
  }

  // Unieke slug genereren
  const baseSlug = slugify(displayName);
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const [existing] = await db
      .select()
      .from(schema.agencies)
      .where(eq(schema.agencies.slug, slug))
      .limit(1);
    if (!existing) break;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
    if (counter > 99) return { error: "Te veel agencies met deze naam. Kies een andere." };
  }

  try {
    await db.insert(schema.agencies).values({
      slug,
      displayName,
      adminUserId: user.id,
      primaryColor,
      accentColor: primaryColor,
      status: "trial",
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Kon agency niet aanmaken.",
    };
  }

  redirect("/portal");
}
