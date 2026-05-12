-- Platform subscription velden op agencies tabel.

CREATE TYPE "agency_plan" AS ENUM ('trial', 'starter', 'pro', 'scale', 'cancelled');

ALTER TABLE "agencies"
  ADD COLUMN IF NOT EXISTS "stripe_customer_id" text,
  ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text,
  ADD COLUMN IF NOT EXISTS "plan" agency_plan NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS "trial_ends_at" timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  ADD COLUMN IF NOT EXISTS "current_period_ends_at" timestamptz;

CREATE INDEX IF NOT EXISTS "idx_agencies_stripe_customer" ON "agencies"("stripe_customer_id");
CREATE INDEX IF NOT EXISTS "idx_agencies_stripe_subscription" ON "agencies"("stripe_subscription_id");
