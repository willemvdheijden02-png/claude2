-- Client portal: laat agencies een read-only view delen met hun eindklant via magic link

ALTER TABLE "clients"
  ADD COLUMN IF NOT EXISTS "portal_enabled" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "portal_token" text UNIQUE,
  ADD COLUMN IF NOT EXISTS "portal_email" text,
  ADD COLUMN IF NOT EXISTS "portal_last_viewed_at" timestamptz;

CREATE INDEX IF NOT EXISTS "idx_clients_portal_token" ON "clients"("portal_token") WHERE "portal_token" IS NOT NULL;
