-- ============================================================
-- 0009: Usage tracking + platform-key fallback support
-- ============================================================

-- Usage logs: elke AI call, Meta call, scheduler run bijhouden
CREATE TABLE IF NOT EXISTS "usage_logs" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agency_id"   uuid NOT NULL REFERENCES "agencies"("id") ON DELETE CASCADE,
  "type"        text NOT NULL CHECK ("type" IN ('anthropic','meta','scheduler')),
  "count"       integer NOT NULL DEFAULT 1,
  "metadata"    jsonb DEFAULT '{}',
  "created_at"  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_usage_logs_agency_type" ON "usage_logs"("agency_id", "type");
CREATE INDEX IF NOT EXISTS "idx_usage_logs_created_at"  ON "usage_logs"("agency_id", "created_at");

-- Monthly counters op agencies (snel opvragen zonder aggregatie)
ALTER TABLE "agencies"
  ADD COLUMN IF NOT EXISTS "ai_calls_this_month"        integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "meta_calls_this_month"      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "scheduler_runs_this_month"  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "usage_reset_at"             timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "usage_alert_80_sent"        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "usage_alert_100_sent"       boolean NOT NULL DEFAULT false;

-- Notification types uitbreiden
ALTER TYPE "notification_type"
  ADD VALUE IF NOT EXISTS 'usage_limit_80';
ALTER TYPE "notification_type"
  ADD VALUE IF NOT EXISTS 'usage_limit_100';
