import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

console.log("=== Check trigger bestaat ===");
const triggers = await sql`SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created'`;
console.log(triggers);

console.log("\n=== Check function definition ===");
const funcs = await sql`SELECT pg_get_functiondef(oid) AS def FROM pg_proc WHERE proname = 'handle_new_user'`;
console.log(funcs[0]?.def || "NOT FOUND");

console.log("\n=== Test handmatige insert in public.users ===");
try {
  const testId = "00000000-0000-0000-0000-000000000001";
  await sql`DELETE FROM public.users WHERE id = ${testId}`;
  await sql`INSERT INTO public.users (id, email, full_name, role) VALUES (${testId}, 'test@example.com', 'Test User', 'agency_admin')`;
  console.log("✓ Manual insert werkt");
  await sql`DELETE FROM public.users WHERE id = ${testId}`;
} catch (e) {
  console.log("✗ Manual insert faalt:", e.message);
}

console.log("\n=== Permissions op public.users ===");
const grants = await sql`
  SELECT grantee, privilege_type
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name = 'users'
  ORDER BY grantee, privilege_type
`;
grants.forEach(g => console.log(`  ${g.grantee}: ${g.privilege_type}`));

await sql.end();
