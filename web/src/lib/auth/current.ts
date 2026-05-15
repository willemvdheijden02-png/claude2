import { cache } from "react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export type CurrentAgency = typeof schema.agencies.$inferSelect;
export type CurrentUserProfile = typeof schema.users.$inferSelect;

/**
 * Haalt de ingelogde Supabase auth-user op. Returns null als niet ingelogd.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

/**
 * Haalt de complete context op voor de huidige user:
 * - auth user
 * - profile uit public.users (wordt aangemaakt als het nog niet bestaat)
 * - agency die de user beheert (admin van) — kan null zijn als onboarding nog niet af is
 */
export const getCurrentContext = cache(async () => {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  // Upsert: maak profiel aan bij eerste inlog (Google OAuth, email/pw, invite)
  const [profile] = await db
    .insert(schema.users)
    .values({
      id: authUser.id,
      email: authUser.email ?? "",
      fullName:
        authUser.user_metadata?.full_name ??
        authUser.user_metadata?.name ??
        null,
      role:
        (authUser.user_metadata?.role as "operator" | "agency_admin") ??
        "agency_admin",
    })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        // Update e-mail als die veranderd is (bv. na Google re-auth)
        email: authUser.email ?? "",
        updatedAt: new Date(),
      },
    })
    .returning();

  const [agency] = await db
    .select()
    .from(schema.agencies)
    .where(eq(schema.agencies.adminUserId, authUser.id))
    .limit(1);

  return {
    authUser,
    profile: profile ?? null,
    agency: agency ?? null,
  };
});
