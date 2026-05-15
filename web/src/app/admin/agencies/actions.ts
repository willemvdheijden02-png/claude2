"use server";

import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export type CreateAgencyResult =
  | { success: true; agencyId: string; displayName: string; inviteSent: boolean }
  | { error: string };

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function uniqueSlug(base: string) {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export async function adminCreateAgency(
  _prev: CreateAgencyResult | null,
  formData: FormData
): Promise<CreateAgencyResult> {
  const ctx = await getCurrentContext();
  if (ctx?.profile?.role !== "operator") return { error: "Geen toegang." };

  const displayName = (formData.get("displayName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const plan = (formData.get("plan") as string) || "trial";
  const primaryColor = (formData.get("primaryColor") as string) || "#10b981";

  if (!displayName || displayName.length < 2)
    return { error: "Vul een agency-naam in (minimaal 2 tekens)." };
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { error: "Vul een geldig e-mailadres in." };

  const supabaseAdmin = createSupabaseAdmin();

  // 1. Nodig de gebruiker uit via Supabase (stuurt een magic-link email)
  const { data: inviteData, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: displayName, role: "agency_admin" },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"}/auth/callback?next=/portal`,
    });

  if (inviteError && !inviteError.message.includes("already been registered")) {
    return { error: `Kon uitnodiging niet versturen: ${inviteError.message}` };
  }

  const authUserId = inviteData?.user?.id ?? null;
  const inviteSent = !inviteError;

  // 2. Maak profiel aan als het nog niet bestaat
  if (authUserId) {
    await db
      .insert(schema.users)
      .values({
        id: authUserId,
        email,
        fullName: displayName,
        role: "agency_admin",
      })
      .onConflictDoNothing();
  }

  // 3. Maak de agency aan
  const baseSlug = slugify(displayName) || "agency";
  const slug = uniqueSlug(baseSlug);

  const [agency] = await db
    .insert(schema.agencies)
    .values({
      slug,
      displayName,
      primaryColor,
      accentColor: primaryColor,
      adminUserId: authUserId,
      status: plan === "trial" ? "trial" : "active",
      plan: plan as typeof schema.agencies.$inferInsert["plan"],
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dagen
    })
    .returning({ id: schema.agencies.id });

  revalidatePath("/admin/agencies");
  revalidatePath("/admin");

  return {
    success: true,
    agencyId: agency.id,
    displayName,
    inviteSent,
  };
}
