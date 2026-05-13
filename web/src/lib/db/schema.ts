// Drizzle schema voor Willoe — multi-tenant ad-agency platform.
// Gegenereerd uit /agency-platform/SCHEMA.md.

import {
  bigint,
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// ENUMS
// ============================================================

export const userRoleEnum = pgEnum("user_role", ["operator", "agency_admin"]);
export const agencyStatusEnum = pgEnum("agency_status", [
  "trial",
  "active",
  "paused",
  "churned",
]);
export const clientStatusEnum = pgEnum("client_status", [
  "new",
  "onboarding",
  "active",
  "paused",
]);
export const serviceCategoryEnum = pgEnum("service_category", [
  "audit",
  "creative",
  "seo",
  "strategy",
  "onboarding",
  "studio",
]);
export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "in_progress",
  "done",
  "failed",
  "cancelled",
]);
export const platformEnum = pgEnum("platform", ["meta", "google"]);
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
]);
export const invoiceTypeEnum = pgEnum("invoice_type", [
  "monthly_fee",
  "service",
  "onboarding",
]);

export const integrationProviderEnum = pgEnum("integration_provider", [
  "anthropic",
  "gemini",
  "meta",
  "google_ads",
  "stripe",
  "resend",
]);

export const integrationStatusEnum = pgEnum("integration_status", [
  "not_connected",
  "connected",
  "invalid",
  "rate_limited",
]);

export const agencyPlanEnum = pgEnum("agency_plan", [
  "trial",
  "starter",
  "pro",
  "scale",
  "cancelled",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "request_done",
  "request_failed",
  "invoice_paid",
  "invoice_overdue",
  "trial_expiring",
  "meta_token_expiring",
  "client_added",
  "integration_invalid",
  "general",
]);

// ============================================================
// USERS — profiel bovenop auth.users (Supabase managed)
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // = auth.users.id
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: userRoleEnum("role").notNull().default("agency_admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// AGENCIES — één rij per agency-klant van Willoe
// ============================================================

export const agencies = pgTable(
  "agencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    displayName: text("display_name").notNull(),
    adminUserId: uuid("admin_user_id").references(() => users.id, { onDelete: "set null" }),
    logoUrl: text("logo_url"),
    primaryColor: text("primary_color").default("#10b981").notNull(),
    accentColor: text("accent_color").default("#059669").notNull(),
    status: agencyStatusEnum("status").default("trial").notNull(),
    monthlyFeeCents: integer("monthly_fee_cents").default(29900).notNull(),
    onboardingsQuota: integer("onboardings_quota").default(10).notNull(),
    onboardingsUsedThisMonth: integer("onboardings_used_this_month").default(0).notNull(),
    // Subscription tracking
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    plan: agencyPlanEnum("plan").default("trial").notNull(),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }).defaultNow().notNull(),
    currentPeriodEndsAt: timestamp("current_period_ends_at", { withTimezone: true }),
    // Notification preferences
    notifyEmail: boolean("notify_email").default(true).notNull(),
    notifyEmailAddress: text("notify_email_address"),
    // BTW + facturatie config
    vatRate: integer("vat_rate").default(21).notNull(), // % — 0 voor KOR
    kvkNumber: text("kvk_number"),
    vatNumber: text("vat_number"),
    billingAddress: jsonb("billing_address"), // { street, city, postalCode, country }
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_agencies_admin_user").on(t.adminUserId),
    index("idx_agencies_status").on(t.status),
  ]
);

// ============================================================
// CLIENTS — eindklanten van een agency
// ============================================================

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agencyId: uuid("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    websiteUrl: text("website_url"),
    icpDescription: text("icp_description"),
    budgetMonthlyCents: integer("budget_monthly_cents"),
    currentCreativesUrl: text("current_creatives_url"),
    competitors: jsonb("competitors").$type<string[]>(), // array van URLs
    metaAdAccountId: text("meta_ad_account_id"),
    googleAdsCustomerId: text("google_ads_customer_id"),
    status: clientStatusEnum("status").default("new").notNull(),
    portalEnabled: boolean("portal_enabled").default(false).notNull(),
    portalToken: text("portal_token").unique(),
    portalEmail: text("portal_email"),
    portalLastViewedAt: timestamp("portal_last_viewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_clients_agency_id").on(t.agencyId)]
);

// ============================================================
// SERVICES — catalog van skills die agencies kunnen aanvragen
// ============================================================

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
  category: serviceCategoryEnum("category").notNull(),
  estimatedTurnaroundHours: integer("estimated_turnaround_hours").default(24).notNull(),
  priceCents: integer("price_cents").default(0).notNull(),
  skillCommand: text("skill_command").notNull(), // bv "/ads-meta"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// SERVICE REQUESTS — de queue
// ============================================================

export const serviceRequests = pgTable(
  "service_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agencyId: uuid("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: "restrict" }),
    requestedBy: uuid("requested_by").references(() => users.id, { onDelete: "set null" }),
    status: requestStatusEnum("status").default("pending").notNull(),
    brief: text("brief"),
    inputPayload: jsonb("input_payload"),
    outputReportId: uuid("output_report_id"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    operatorNotes: text("operator_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_service_requests_status").on(t.status),
    index("idx_service_requests_agency_id").on(t.agencyId),
    index("idx_service_requests_client_id").on(t.clientId),
  ]
);

// ============================================================
// REPORTS — output van een service request
// ============================================================

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceRequestId: uuid("service_request_id").notNull().references(() => serviceRequests.id, {
      onDelete: "cascade",
    }),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
    pdfUrl: text("pdf_url"),
    data: jsonb("data"),
    version: integer("version").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_reports_client_id").on(t.clientId)]
);

// ============================================================
// KPI SNAPSHOTS — dagelijkse spend/revenue/etc per platform per klant
// ============================================================

export const kpiSnapshots = pgTable(
  "kpi_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    platform: platformEnum("platform").notNull(),
    spendCents: bigint("spend_cents", { mode: "number" }).default(0).notNull(),
    impressions: bigint("impressions", { mode: "number" }).default(0).notNull(),
    clicks: bigint("clicks", { mode: "number" }).default(0).notNull(),
    conversions: integer("conversions").default(0).notNull(),
    revenueCents: bigint("revenue_cents", { mode: "number" }).default(0).notNull(),
    roas: numeric("roas", { precision: 10, scale: 4 }),
    rawData: jsonb("raw_data"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_kpi_snapshots_client_date").on(t.clientId, t.date),
    unique("kpi_unique_per_day").on(t.clientId, t.date, t.platform),
  ]
);

// ============================================================
// OAUTH CONNECTIONS — encrypted tokens per platform per agency/client
// ============================================================

export const oauthConnections = pgTable(
  "oauth_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
    agencyId: uuid("agency_id").references(() => agencies.id, { onDelete: "cascade" }),
    platform: platformEnum("platform").notNull(),
    accessToken: text("access_token").notNull(), // encrypted at rest in production
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    accountId: text("account_id"), // bv act_xxx voor Meta, customer_id voor Google
    accountName: text("account_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_oauth_client_platform").on(t.clientId, t.platform),
    index("idx_oauth_agency_platform").on(t.agencyId, t.platform),
  ]
);

// ============================================================
// INVOICES — facturatie
// ============================================================

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agencyId: uuid("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
    invoiceNumber: text("invoice_number"), // genereerd: 2026-0142
    type: invoiceTypeEnum("type").notNull(),
    status: invoiceStatusEnum("status").default("draft").notNull(),
    issueDate: date("issue_date"),
    dueDate: date("due_date"),
    subtotalCents: integer("subtotal_cents").notNull(),
    vatRate: integer("vat_rate").default(21).notNull(),
    vatCents: integer("vat_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    description: text("description"),
    pdfUrl: text("pdf_url"),
    stripeInvoiceId: text("stripe_invoice_id"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_invoices_agency_id").on(t.agencyId),
    index("idx_invoices_status").on(t.status),
  ]
);

// ============================================================
// NOTIFICATIONS
// ============================================================

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agencyId: uuid("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
    recipientUserId: uuid("recipient_user_id").references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    metadata: jsonb("metadata").default({}),
    readAt: timestamp("read_at", { withTimezone: true }),
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_notifications_agency").on(t.agencyId),
  ]
);

export type Notification = typeof notifications.$inferSelect;

// ============================================================
// AGENCY INTEGRATIONS — BYOK (Bring Your Own Keys)
// ============================================================

export const agencyIntegrations = pgTable(
  "agency_integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agencyId: uuid("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
    provider: integrationProviderEnum("provider").notNull(),
    credentials: jsonb("credentials").$type<Record<string, string>>().default({}).notNull(),
    status: integrationStatusEnum("status").default("not_connected").notNull(),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_agency_integrations_agency").on(t.agencyId),
    unique("agency_integrations_unique").on(t.agencyId, t.provider),
  ]
);

export type AgencyIntegration = typeof agencyIntegrations.$inferSelect;
export type NewAgencyIntegration = typeof agencyIntegrations.$inferInsert;

// ============================================================
// RELATIONS
// ============================================================

export const agenciesRelations = relations(agencies, ({ one, many }) => ({
  admin: one(users, { fields: [agencies.adminUserId], references: [users.id] }),
  clients: many(clients),
  invoices: many(invoices),
  oauthConnections: many(oauthConnections),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  agency: one(agencies, { fields: [clients.agencyId], references: [agencies.id] }),
  serviceRequests: many(serviceRequests),
  reports: many(reports),
  kpiSnapshots: many(kpiSnapshots),
  oauthConnections: many(oauthConnections),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one, many }) => ({
  agency: one(agencies, { fields: [serviceRequests.agencyId], references: [agencies.id] }),
  client: one(clients, { fields: [serviceRequests.clientId], references: [clients.id] }),
  service: one(services, { fields: [serviceRequests.serviceId], references: [services.id] }),
  reports: many(reports),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  serviceRequest: one(serviceRequests, {
    fields: [reports.serviceRequestId],
    references: [serviceRequests.id],
  }),
  client: one(clients, { fields: [reports.clientId], references: [clients.id] }),
}));

// ============================================================
// TYPE EXPORTS
// ============================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Agency = typeof agencies.$inferSelect;
export type NewAgency = typeof agencies.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Service = typeof services.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type KpiSnapshot = typeof kpiSnapshots.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type OauthConnection = typeof oauthConnections.$inferSelect;
