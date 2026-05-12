-- Team-leden ondersteuning per agency.

CREATE TYPE "invite_status" AS ENUM ('pending', 'accepted', 'expired', 'revoked');

CREATE TABLE "agency_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agency_id" uuid NOT NULL REFERENCES "agencies"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" text NOT NULL DEFAULT 'member',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "agency_members_unique" UNIQUE ("agency_id", "user_id")
);

CREATE INDEX "idx_agency_members_agency" ON "agency_members"("agency_id");
CREATE INDEX "idx_agency_members_user" ON "agency_members"("user_id");

CREATE TABLE "agency_invites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agency_id" uuid NOT NULL REFERENCES "agencies"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "role" text NOT NULL DEFAULT 'member',
  "token" text NOT NULL UNIQUE,
  "status" invite_status NOT NULL DEFAULT 'pending',
  "invited_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "expires_at" timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  "accepted_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_agency_invites_agency" ON "agency_invites"("agency_id");
CREATE INDEX "idx_agency_invites_token" ON "agency_invites"("token");
CREATE INDEX "idx_agency_invites_email" ON "agency_invites"("email");

-- RLS
ALTER TABLE "agency_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agency_invites" ENABLE ROW LEVEL SECURITY;

CREATE POLICY members_agency_scope ON "agency_members" FOR ALL USING (
  agency_id = current_agency_id() OR is_operator()
);
CREATE POLICY invites_agency_scope ON "agency_invites" FOR ALL USING (
  agency_id = current_agency_id() OR is_operator()
);
