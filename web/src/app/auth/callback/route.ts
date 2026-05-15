import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/portal";

  // Gebruik de publieke site URL — niet url.origin, want op Railway is
  // dat de interne host (localhost:8080) in plaats van de publieke URL.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `${url.protocol}//${request.headers.get("x-forwarded-host") || url.host}`;

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

      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${siteUrl}/login?error=callback`);
}
