import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Supabase client voor server-actions, route handlers en server components.
 * Gebruikt de anon key + de gebruiker's session cookies.
 */
export async function createSupabaseServer() {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !anonKey) {
    throw new Error("Supabase env vars missing in .env.local");
  }
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) => {
        try {
          cookies.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // server component: cookies.set is read-only — ignore
        }
      },
    },
  });
}

/**
 * Supabase admin client met service_role key — bypassed RLS.
 * ALLEEN op de server gebruiken (nooit in client components).
 */
export function createSupabaseAdmin() {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Supabase admin env vars missing in .env.local");
  }
  return createServerClient(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
