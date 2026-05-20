"use server";

import { getAuthUser } from "@/lib/auth/current";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { seedPlatformIntegrations } from "@/lib/platform-seed";

export type OnboardingResult =
  | { error: string; success?: never; agencyId?: never }
  | { success: true; agencyId: string; error?: never };

export type SimpleResult =
  | { error: string; success?: never }
  | { success: true; error?: never };

export type ServiceCategory = typeof schema.services.$inferInsert["category"];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

/**
 * Step 1 — agency aanmaken.
 * Geeft agencyId terug zodat de wizard door kan gaan naar stap 2.
 * (Redirect naar /portal zit in de wizard zelf, bij step 5.)
 */
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

  // Idempotent: als user al een agency heeft, stuur ze gewoon naar die agency
  const [existingForUser] = await db
    .select()
    .from(schema.agencies)
    .where(eq(schema.agencies.adminUserId, user.id))
    .limit(1);
  if (existingForUser) {
    return { success: true, agencyId: existingForUser.id };
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
    const [agency] = await db
      .insert(schema.agencies)
      .values({
        slug,
        displayName,
        adminUserId: user.id,
        primaryColor,
        accentColor: primaryColor,
        status: "trial",
      })
      .returning({ id: schema.agencies.id });

    if (!agency) return { error: "Kon agency niet aanmaken." };

    // Pre-vul platform integrations — agency draait direct op Willem's keys
    await seedPlatformIntegrations(agency.id).catch((err) =>
      console.error("[onboarding] seedPlatformIntegrations mislukt:", err)
    );

    return { success: true, agencyId: agency.id };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Kon agency niet aanmaken.",
    };
  }
}

/**
 * Step 2 — logo URL opslaan (na upload via /api/upload/logo).
 */
export async function updateAgencyLogo(
  agencyId: string,
  logoUrl: string
): Promise<SimpleResult> {
  const user = await getAuthUser();
  if (!user) return { error: "Niet ingelogd." };

  if (!logoUrl) return { error: "Geen logo URL opgegeven." };

  try {
    await db
      .update(schema.agencies)
      .set({ logoUrl, updatedAt: new Date() })
      .where(eq(schema.agencies.id, agencyId));

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Logo opslaan mislukt." };
  }
}

/**
 * Step 3 — API koppeling opslaan (Meta, Google Ads, etc.).
 */
export async function saveOnboardingIntegration(
  agencyId: string,
  provider: typeof schema.agencyIntegrations.$inferInsert["provider"],
  credentials: Record<string, string>
): Promise<SimpleResult> {
  const user = await getAuthUser();
  if (!user) return { error: "Niet ingelogd." };

  if (!agencyId || !provider || !credentials) return { error: "Ongeldige invoer." };

  try {
    await db
      .insert(schema.agencyIntegrations)
      .values({
        agencyId,
        provider,
        credentials,
        status: "connected",
      })
      .onConflictDoUpdate({
        target: [schema.agencyIntegrations.agencyId, schema.agencyIntegrations.provider],
        set: {
          credentials,
          status: "connected",
          lastVerifiedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Koppeling opslaan mislukt." };
  }
}

/**
 * Step 4 — eerste dienst aanmaken.
 */
export async function createOnboardingService(
  agencyId: string,
  data: {
    name: string;
    category: ServiceCategory;
    priceEur: string;
    description: string;
  }
): Promise<SimpleResult> {
  const user = await getAuthUser();
  if (!user) return { error: "Niet ingelogd." };

  const displayName = data.name.trim();
  if (!displayName) return { error: "Vul een dienstnaam in." };

  const priceRaw = parseFloat(data.priceEur || "0");
  const priceCents = isNaN(priceRaw) ? 0 : Math.round(priceRaw * 100);

  const baseSlug = slugify(displayName);
  const slug = `${baseSlug}-${agencyId.slice(0, 8)}`;

  try {
    await db.insert(schema.services).values({
      slug,
      displayName,
      description: data.description.trim() || displayName,
      iconName: "sparkles",
      category: data.category,
      priceCents,
      skillCommand: "",
      isActive: true,
      agencyId,
    });

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Dienst aanmaken mislukt." };
  }
}
