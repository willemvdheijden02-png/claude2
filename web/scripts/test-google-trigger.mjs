import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

console.log("=== Zijn er al users in auth.users? ===");
const authUsers = await sql`SELECT id, email, raw_user_meta_data, raw_app_meta_data FROM auth.users ORDER BY created_at DESC LIMIT 5`;
console.log(authUsers);

console.log("\n=== Zijn er al users in public.users? ===");
const publicUsers = await sql`SELECT id, email, full_name, role FROM public.users LIMIT 5`;
console.log(publicUsers);

console.log("\n=== Simuleer wat Google stuurt — test of trigger werkt ===");
try {
  const testId = "11111111-1111-1111-1111-111111111111";
  await sql`DELETE FROM public.users WHERE id = ${testId}`;
  // Simuleer wat Google stuurt voor de trigger
  await sql`INSERT INTO public.users (id, email, full_name, role)
    VALUES (${testId}, 'willem.test@gmail.com', NULL, 'agency_admin')`;
  console.log("✓ Insert met NULL full_name werkt");
  await sql`DELETE FROM public.users WHERE id = ${testId}`;
} catch (e) {
  console.log("✗", e.message);
}

console.log("\n=== Check constraints op public.users ===");
const constraints = await sql`
  SELECT conname, pg_get_constraintdef(oid) AS def
  FROM pg_constraint
  WHERE conrelid = 'public.users'::regclass
`;
constraints.forEach(c => console.log(`  ${c.conname}: ${c.def}`));

await sql.end();
