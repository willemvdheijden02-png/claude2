-- Willoe — Initial schema migration
-- Includes: tables, enums, indexes, RLS policies, triggers

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE "user_role" AS ENUM ('operator', 'agency_admin');
CREATE TYPE "agency_status" AS ENUM ('trial', 'active', 'paused', 'churned');
CREATE TYPE "client_status" AS ENUM ('new', 'onboarding', 'active', 'paused');
CREATE TYPE "service_category" AS ENUM ('audit', 'creative', 'seo', 'strategy', 'onboarding', 'studio');
CREATE TYPE "request_status" AS ENUM ('pending', 'in_progress', 'done', 'failed', 'cancelled');
CREATE TYPE "platform" AS ENUM ('meta', 'google');
CREATE TYPE "invoice_status" AS ENUM ('draft', 'sent', 'paid', 'overdue');
CREATE TYPE "invoice_type" AS ENUM ('monthly_fee', 'service', 'onboarding');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "full_name" text,
  "role" user_role NOT NULL DEFAULT 'agency_admin',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "agencies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "display_name" text NOT NULL,
  "admin_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "logo_url" text,
  "primary_color" text NOT NULL DEFAULT '#10b981',
  "accent_color" text NOT NULL DEFAULT '#059669',
  "status" agency_status NOT NULL DEFAULT 'trial',
  "monthly_fee_cents" integer NOT NULL DEFAULT 29900,
  "onboardings_quota" integer NOT NULL DEFAULT 10,
  "onboardings_used_this_month" integer NOT NULL DEFAULT 0,
  "vat_rate" integer NOT NULL DEFAULT 21,
  "kvk_number" text,
  "vat_number" text,
  "billing_address" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_agencies_admin_user" ON "agencies"("admin_user_id");
CREATE INDEX "idx_agencies_status" ON "agencies"("status");

CREATE TABLE "clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agency_id" uuid NOT NULL REFERENCES "agencies"("id") ON DELETE CASCADE,
  "display_name" text NOT NULL,
  "website_url" text,
  "icp_description" text,
  "budget_monthly_cents" integer,
  "current_creatives_url" text,
  "competitors" jsonb,
  "meta_ad_account_id" text,
  "google_ads_customer_id" text,
  "status" client_status NOT NULL DEFAULT 'new',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_clients_agency_id" ON "clients"("agency_id");

CREATE TABLE "services" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "display_name" text NOT NULL,
  "description" text NOT NULL,
  "icon_name" text NOT NULL,
  "category" service_category NOT NULL,
  "estimated_turnaround_hours" integer NOT NULL DEFAULT 24,
  "price_cents" integer NOT NULL DEFAULT 0,
  "skill_command" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "service_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agency_id" uuid NOT NULL REFERENCES "agencies"("id") ON DELETE CASCADE,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "service_id" uuid NOT NULL REFERENCES "services"("id") ON DELETE RESTRICT,
  "requested_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "status" request_status NOT NULL DEFAULT 'pending',
  "brief" text,
  "input_payload" jsonb,
  "output_report_id" uuid,
  "started_at" timestamptz,
  "completed_at" timestamptz,
  "operator_notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_service_requests_status" ON "service_requests"("status");
CREATE INDEX "idx_service_requests_agency_id" ON "service_requests"("agency_id");
CREATE INDEX "idx_service_requests_client_id" ON "service_requests"("client_id");

CREATE TABLE "reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "service_request_id" uuid NOT NULL REFERENCES "service_requests"("id") ON DELETE CASCADE,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "pdf_url" text,
  "data" jsonb,
  "version" integer NOT NULL DEFAULT 1,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_reports_client_id" ON "reports"("client_id");

CREATE TABLE "kpi_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "platform" platform NOT NULL,
  "spend_cents" bigint NOT NULL DEFAULT 0,
  "impressions" bigint NOT NULL DEFAULT 0,
  "clicks" bigint NOT NULL DEFAULT 0,
  "conversions" integer NOT NULL DEFAULT 0,
  "revenue_cents" bigint NOT NULL DEFAULT 0,
  "roas" numeric(10, 4),
  "raw_data" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "kpi_unique_per_day" UNIQUE ("client_id", "date", "platform")
);

CREATE INDEX "idx_kpi_snapshots_client_date" ON "kpi_snapshots"("client_id", "date");

CREATE TABLE "oauth_connections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" uuid REFERENCES "clients"("id") ON DELETE CASCADE,
  "agency_id" uuid REFERENCES "agencies"("id") ON DELETE CASCADE,
  "platform" platform NOT NULL,
  "access_token" text NOT NULL,
  "refresh_token" text,
  "token_expires_at" timestamptz,
  "scope" text,
  "account_id" text,
  "account_name" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_oauth_client_platform" ON "oauth_connections"("client_id", "platform");
CREATE INDEX "idx_oauth_agency_platform" ON "oauth_connections"("agency_id", "platform");

CREATE TABLE "invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agency_id" uuid NOT NULL REFERENCES "agencies"("id") ON DELETE CASCADE,
  "client_id" uuid REFERENCES "clients"("id") ON DELETE SET NULL,
  "invoice_number" text,
  "type" invoice_type NOT NULL,
  "status" invoice_status NOT NULL DEFAULT 'draft',
  "issue_date" date,
  "due_date" date,
  "subtotal_cents" integer NOT NULL,
  "vat_rate" integer NOT NULL DEFAULT 21,
  "vat_cents" integer NOT NULL,
  "total_cents" integer NOT NULL,
  "description" text,
  "pdf_url" text,
  "stripe_invoice_id" text,
  "paid_at" timestamptz,
  "sent_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_invoices_agency_id" ON "invoices"("agency_id");
CREATE INDEX "idx_invoices_status" ON "invoices"("status");

-- ============================================================
-- AUTO-CREATE PROFILE BIJ AUTH SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'agency_admin')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY — multi-tenant isolation
-- ============================================================

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agencies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kpi_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "oauth_connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;

-- Helper: is huidige user een operator?
CREATE OR REPLACE FUNCTION is_operator() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'operator'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: agency_id van huidige user (NULL als operator of unauthenticated)
CREATE OR REPLACE FUNCTION current_agency_id() RETURNS uuid AS $$
  SELECT id FROM public.agencies WHERE admin_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS: ieder ziet alleen z'n eigen profiel, operator ziet alles
CREATE POLICY users_self_select ON "users" FOR SELECT USING (
  id = auth.uid() OR is_operator()
);
CREATE POLICY users_self_update ON "users" FOR UPDATE USING (id = auth.uid());

-- AGENCIES: agency_admin ziet alleen eigen agency
CREATE POLICY agencies_isolation ON "agencies" FOR SELECT USING (
  admin_user_id = auth.uid() OR is_operator()
);
CREATE POLICY agencies_operator_all ON "agencies" FOR ALL USING (is_operator());

-- CLIENTS: scoped to agency_id
CREATE POLICY clients_isolation ON "clients" FOR ALL USING (
  agency_id = current_agency_id() OR is_operator()
);

-- SERVICES: iedereen mag lezen (catalog is publiek), alleen operator schrijft
CREATE POLICY services_read_all ON "services" FOR SELECT USING (true);
CREATE POLICY services_operator_write ON "services" FOR ALL USING (is_operator());

-- SERVICE_REQUESTS: scoped to agency
CREATE POLICY service_requests_isolation ON "service_requests" FOR ALL USING (
  agency_id = current_agency_id() OR is_operator()
);

-- REPORTS: scoped via service_request → agency
CREATE POLICY reports_isolation ON "reports" FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM service_requests sr
    WHERE sr.id = reports.service_request_id
    AND (sr.agency_id = current_agency_id() OR is_operator())
  )
);

-- KPI_SNAPSHOTS: scoped via client → agency
CREATE POLICY kpi_isolation ON "kpi_snapshots" FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = kpi_snapshots.client_id
    AND (c.agency_id = current_agency_id() OR is_operator())
  )
);

-- OAUTH_CONNECTIONS: scoped via agency_id of via client → agency
CREATE POLICY oauth_isolation ON "oauth_connections" FOR ALL USING (
  agency_id = current_agency_id()
  OR EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = oauth_connections.client_id AND c.agency_id = current_agency_id()
  )
  OR is_operator()
);

-- INVOICES: scoped to agency
CREATE POLICY invoices_isolation ON "invoices" FOR ALL USING (
  agency_id = current_agency_id() OR is_operator()
);
