#!/usr/bin/env node
// Promote a user to operator + auto-fill their agency_integrations from .env.local.
// Usage: node scripts/setup-operator.mjs <email>
// Default email: willemvdheijden02@gmail.com

import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local", override: true });

const targetEmail = process.argv[2] ?? "willemvdheijden02@gmail.com";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL niet gevonden in .env.local");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });

console.log(`🎯 Setup operator voor: ${targetEmail}\n`);

// 1. Find user
const [user] = await sql`SELECT id, email, role FROM users WHERE email = ${targetEmail}`;
if (!user) {
  console.error(`❌ User '${targetEmail}' niet gevonden. Eerst signup doen op /signup.`);
  await sql.end();
  process.exit(1);
}
console.log(`✓ User gevonden: ${user.id}`);

// 2. Promote to operator
if (user.role !== "operator") {
  await sql`UPDATE users SET role = 'operator' WHERE id = ${user.id}`;
  console.log(`✓ Role gepromoveerd: ${user.role} → operator`);
} else {
  console.log(`✓ Already operator`);
}

// 3. Find agency
const [agency] = await sql`SELECT id, display_name, slug FROM agencies WHERE admin_user_id = ${user.id}`;
if (!agency) {
  console.error(`⚠️  Geen agency gevonden voor deze user. Eerst onboarding doen op /onboarding.`);
  console.log(`   Daarna dit script opnieuw runnen.`);
  await sql.end();
  process.exit(0);
}
console.log(`✓ Agency gevonden: ${agency.display_name} (${agency.slug})`);

// 4. Auto-fill integrations from env vars
const integrations = [
  {
    provider: "anthropic",
    credentials: { api_key: process.env.ANTHROPIC_API_KEY },
    needs: ["api_key"],
  },
  {
    provider: "gemini",
    credentials: { api_key: process.env.GOOGLE_API_KEY },
    needs: ["api_key"],
  },
  {
    provider: "meta",
    credentials: {
      app_id: process.env.META_APP_ID,
      access_token: process.env.META_ACCESS_TOKEN,
    },
    needs: ["app_id", "access_token"],
  },
  {
    provider: "stripe",
    credentials: {
      secret_key: process.env.STRIPE_SECRET_KEY,
      publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
    needs: ["secret_key", "publishable_key"],
  },
  {
    provider: "google_ads",
    credentials: {
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
    },
    needs: ["developer_token", "customer_id"],
  },
];

let filled = 0;
let skipped = 0;
for (const { provider, credentials, needs } of integrations) {
  const missing = needs.filter((k) => !credentials[k]);
  if (missing.length > 0) {
    console.log(`  ⏭️  ${provider}: skipped (missing ${missing.join(", ")} in .env.local)`);
    skipped++;
    continue;
  }
  await sql`
    INSERT INTO agency_integrations (agency_id, provider, credentials, status, last_verified_at)
    VALUES (${agency.id}, ${provider}::integration_provider, ${sql.json(credentials)}, 'connected', now())
    ON CONFLICT (agency_id, provider) DO UPDATE SET
      credentials = EXCLUDED.credentials,
      status = 'connected',
      last_verified_at = now(),
      updated_at = now()
  `;
  console.log(`  ✓ ${provider}: connected`);
  filled++;
}

console.log(`\n🎉 Klaar — ${filled} integraties gekoppeld, ${skipped} skipped.`);
console.log(`\nJij kunt nu:`);
console.log(`  • /portal — als agency-admin voor jouw eigen klanten`);
console.log(`  • /admin  — als operator om andere agencies te managen`);

await sql.end();
