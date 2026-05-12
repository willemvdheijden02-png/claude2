"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client voor client components.
 * NEXT_PUBLIC_ vars zijn beschikbaar in de browser.
 */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
