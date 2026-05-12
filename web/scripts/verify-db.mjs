import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`;
console.log("📊 TABELLEN IN PUBLIC:");
tables.forEach((t) => console.log("  ✓", t.tablename));

const services = await sql`SELECT slug, display_name, category, price_cents FROM services ORDER BY category, display_name`;
console.log("\n🛠️  SERVICES CATALOG:");
services.forEach((s) =>
  console.log(`  [${s.category.padEnd(10)}] ${s.display_name.padEnd(32)} €${(s.price_cents / 100).toFixed(0).padStart(3)}`)
);

const policies = await sql`SELECT tablename, COUNT(*)::int as cnt FROM pg_policies WHERE schemaname='public' GROUP BY tablename ORDER BY tablename`;
console.log("\n🔒 RLS POLICIES PER TABEL:");
policies.forEach((p) => console.log(`  ${p.tablename.padEnd(25)} ${p.cnt} policies`));

await sql.end();
