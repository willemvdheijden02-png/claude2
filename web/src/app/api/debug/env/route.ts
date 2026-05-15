export const runtime = "nodejs";

export async function GET() {
  let dbOk = false;
  let dbError = "";
  let supabaseOk = false;

  try {
    const { db, schema } = await import("@/lib/db");
    await db.select({ id: schema.agencies.id }).from(schema.agencies).limit(1);
    dbOk = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  try {
    const { createSupabaseServer } = await import("@/lib/supabase/server");
    const sb = await createSupabaseServer();
    await sb.auth.getUser();
    supabaseOk = true;
  } catch (e) {
    supabaseOk = false;
  }

  return Response.json({
    cwd: process.cwd(),
    node_env: process.env.NODE_ENV,
    has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_database_url: !!process.env.DATABASE_URL,
    has_site_url: !!process.env.NEXT_PUBLIC_SITE_URL,
    site_url: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    supabase_ok: supabaseOk,
    db_ok: dbOk,
    db_error: dbError || null,
  });
}
