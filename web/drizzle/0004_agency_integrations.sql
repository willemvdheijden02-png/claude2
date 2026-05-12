-- BYOK: Bring Your Own Keys per agency
-- Elke agency vult eigen API keys in voor variabele kosten services.

CREATE TYPE "integration_provider" AS ENUM (
  'anthropic',
  'gemini',
  'meta',
  'google_ads',
  'stripe',
  'resend'
);

CREATE TYPE "integration_status" AS ENUM ('not_connected', 'connected', 'invalid', 'rate_limited');

CREATE TABLE "agency_integrations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agency_id" uuid NOT NULL REFERENCES "agencies"("id") ON DELETE CASCADE,
  "provider" integration_provider NOT NULL,
  -- Encrypted storage. Supabase encrypts at rest by default.
  -- Multiple keys per provider stored as JSONB: {api_key, app_id, ad_account_id, etc.}
  "credentials" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "status" integration_status NOT NULL DEFAULT 'not_connected',
  "last_verified_at" timestamptz,
  "last_error" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "agency_integrations_unique" UNIQUE ("agency_id", "provider")
);

CREATE INDEX "idx_agency_integrations_agency" ON "agency_integrations"("agency_id");
CREATE INDEX "idx_agency_integrations_provider" ON "agency_integrations"("provider");

-- RLS
ALTER TABLE "agency_integrations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY integrations_agency_scope ON "agency_integrations" FOR ALL USING (
  agency_id = current_agency_id() OR is_operator()
);
