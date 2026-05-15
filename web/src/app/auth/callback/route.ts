import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/portal";

  if (code) {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // Maak profiel aan als het nog niet bestaat (Google OAuth + invite flows)
      await db
        .insert(schema.users)
        .values({
          id: user.id,
          email: user.email ?? "",
          fullName:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            null,
          role: (user.user_metadata?.role as "operator" | "agency_admin") ?? "agency_admin",
        })
        .onConflictDoNothing(); // bestaat al → niets doen

      return NextResponse.redirect(`${url.origin}${next}`);
    }
  }

  return NextResponse.redirect(`${url.origin}/login?error=callback`);
}
