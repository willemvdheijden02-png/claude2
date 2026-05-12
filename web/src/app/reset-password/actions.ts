"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export type AuthResult = { error: string } | { success: true };

export async function resetPassword(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const password = formData.get("password") as string;
  if (!password || password.length < 8) return { error: "Wachtwoord moet minimaal 8 tekens zijn." };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/portal");
}
