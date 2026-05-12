"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export type AuthResult = { error: string } | { success: true };

export async function sendPasswordReset(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "Vul een email in." };

  const supabase = await createSupabaseServer();
  const origin = env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3001";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    // Bewust geen reveal of email bestaat — security
    if (error.message.toLowerCase().includes("rate limit")) {
      return { error: "Te veel pogingen. Wacht 5 minuten en probeer opnieuw." };
    }
  }

  return { success: true };
}
