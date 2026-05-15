"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export type AuthResult = { error: string } | { success: true };

export async function signInWithPassword(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || "/portal";

  if (!email || !password) {
    return { error: "Vul email en wachtwoord in." };
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  redirect(next);
}

export async function signUpWithPassword(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string)?.trim();

  if (!email || !password) {
    return { error: "Vul email en wachtwoord in." };
  }
  if (password.length < 8) {
    return { error: "Wachtwoord moet minimaal 8 tekens zijn." };
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role: "agency_admin" } },
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  redirect("/login?signup=ok");
}

export async function signInWithGoogle() {
  const supabase = await createSupabaseServer();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=/portal` },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

function friendlyAuthError(msg: string): string {
  if (msg.toLowerCase().includes("invalid login")) return "Onjuiste email of wachtwoord.";
  if (msg.toLowerCase().includes("already registered")) return "Dit email-adres is al geregistreerd.";
  if (msg.toLowerCase().includes("email not confirmed")) return "Bevestig eerst je email via de link die we stuurden.";
  return msg;
}
