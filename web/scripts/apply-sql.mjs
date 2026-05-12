#!/usr/bin/env node
// Apply één of meerdere SQL files tegen de Supabase Postgres DB.
// Gebruikt DATABASE_URL uit .env.local.
// Usage: node scripts/apply-sql.mjs [path1.sql] [path2.sql]
//        Geen args → apply drizzle/0000_init.sql + drizzle/0001_seed.sql

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL niet gevonden in .env.local");
  process.exit(1);
}

const files =
  process.argv.length > 2
    ? process.argv.slice(2)
    : ["drizzle/0000_init.sql", "drizzle/0001_seed.sql"];

const sql = postgres(url, { max: 1, prepare: false });

for (const file of files) {
  const abs = path.resolve(process.cwd(), file);
  if (!fs.existsSync(abs)) {
    console.error(`❌ File niet gevonden: ${file}`);
    process.exit(1);
  }
  const content = fs.readFileSync(abs, "utf8");
  console.log(`📥 Apply: ${file} (${content.length} chars)`);
  try {
    await sql.unsafe(content);
    console.log(`✅ Klaar: ${file}`);
  } catch (err) {
    console.error(`❌ Error in ${file}:`, err.message);
    await sql.end();
    process.exit(1);
  }
}

console.log("\n🎉 Alle migrations toegepast.");
await sql.end();
