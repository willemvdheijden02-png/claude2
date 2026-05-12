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
 * - profile uit public.users
 * - agency die de user beheert (admin van) — kan null zijn als onboarding nog niet af is
 */
export const getCurrentContext = cache(async () => {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [profile] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, authUser.id))
    .limit(1);

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
