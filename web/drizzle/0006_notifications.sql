-- In-app notifications + audit log

CREATE TYPE "notification_type" AS ENUM (
  'request_done',
  'request_failed',
  'invoice_paid',
  'invoice_overdue',
  'trial_expiring',
  'meta_token_expiring',
  'client_added',
  'integration_invalid',
  'general'
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agency_id" uuid NOT NULL REFERENCES "agencies"("id") ON DELETE CASCADE,
  "recipient_user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
  "type" notification_type NOT NULL,
  "title" text NOT NULL,
  "body" text,
  "link" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "read_at" timestamptz,
  "email_sent_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_notifications_agency" ON "notifications"("agency_id");
CREATE INDEX "idx_notifications_user_unread" ON "notifications"("recipient_user_id", "read_at") WHERE "read_at" IS NULL;
CREATE INDEX "idx_notifications_created" ON "notifications"("created_at" DESC);

-- RLS
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_agency_scope ON "notifications" FOR ALL USING (
  agency_id = current_agency_id() OR is_operator()
);

-- Notificatie voorkeuren per agency
ALTER TABLE "agencies"
  ADD COLUMN IF NOT EXISTS "notify_email" boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "notify_email_address" text;
