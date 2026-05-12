# Database Schema — AgencyHQ

Postgres via Supabase. Alle tabellen krijgen `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz`.

## Diagram

```
auth.users (Supabase managed)
    │
    └── public.users (profile + role)
              │
              ├── (operator) ─── ziet alles
              │
              └── (agency_admin) ─── agencies.admin_user_id
                                          │
                                          ├── clients (klanten van agency)
                                          │       │
                                          │       ├── service_requests
                                          │       │       │
                                          │       │       └── reports / outputs
                                          │       │
                                          │       └── kpi_snapshots (Meta + Google)
                                          │
                                          └── invoices (facturatie)

services (catalog) ─── refererd door service_requests
```

## Tabellen

### `users`
Profile bovenop `auth.users`.

| Kolom | Type | Notitie |
|---|---|---|
| id | uuid | = `auth.users.id` |
| email | text | unique |
| full_name | text | |
| role | enum | `operator` \| `agency_admin` |
| created_at | timestamptz | |

### `agencies`
Eén rij per agency-klant van Willem.

| Kolom | Type | Notitie |
|---|---|---|
| id | uuid | |
| slug | text unique | gebruikt in URL `/portal/[slug]` |
| display_name | text | "Acme Marketing" |
| admin_user_id | uuid | FK → users.id |
| logo_url | text | Supabase Storage path |
| primary_color | text | hex, default `#10b981` |
| accent_color | text | hex |
| status | enum | `trial` \| `active` \| `paused` \| `churned` |
| monthly_fee_cents | int | bv 29900 = €299 |
| onboardings_quota | int | per maand |
| onboardings_used_this_month | int | reset elke maand |
| created_at | timestamptz | |

### `clients`
Eindklanten van een agency. Wat de agency in z'n portal beheert.

| Kolom | Type | Notitie |
|---|---|---|
| id | uuid | |
| agency_id | uuid | FK → agencies.id |
| display_name | text | "Bol BH's" |
| website_url | text | |
| icp_description | text | doelgroep-omschrijving |
| budget_monthly_cents | int | ad budget |
| current_creatives_url | text | Drive/Notion link |
| competitors | jsonb | array van 3 concurrent-URLs |
| meta_ad_account_id | text | act_xxx |
| google_ads_customer_id | text | xxx-xxx-xxxx |
| status | enum | `new` \| `onboarding` \| `active` \| `paused` |
| created_at | timestamptz | |

### `services`
Catalogus van alle skills die agencies kunnen aanvragen. Beheerd door operator.

| Kolom | Type | Notitie |
|---|---|---|
| id | uuid | |
| slug | text unique | bv `ads-meta-audit` |
| display_name | text | "Meta Ads Audit" |
| description | text | wat het doet |
| icon_name | text | lucide-icon naam |
| category | enum | `audit` \| `creative` \| `seo` \| `strategy` \| `onboarding` |
| estimated_turnaround_hours | int | |
| price_cents | int | extra fee bovenop basis-fee, 0 = inbegrepen |
| skill_command | text | `/ads-meta`, `/static-remix` etc — voor Willem's queue |
| is_active | bool | toon/hide in catalog |

### `service_requests`
De queue. Hier draait de hele "skill launcher" om.

| Kolom | Type | Notitie |
|---|---|---|
| id | uuid | |
| agency_id | uuid | FK |
| client_id | uuid | FK |
| service_id | uuid | FK |
| requested_by | uuid | FK → users.id |
| status | enum | `pending` \| `in_progress` \| `done` \| `failed` \| `cancelled` |
| brief | text | extra context vanuit agency |
| input_payload | jsonb | URLs, files, etc. |
| output_report_id | uuid | FK → reports.id (nullable) |
| started_at | timestamptz | |
| completed_at | timestamptz | |
| operator_notes | text | Willem's notities |
| created_at | timestamptz | |

### `reports`
Output van een service request — PDF, data-blob, of allebei.

| Kolom | Type | Notitie |
|---|---|---|
| id | uuid | |
| service_request_id | uuid | FK |
| client_id | uuid | FK (handig voor archief-view) |
| pdf_url | text | Supabase Storage path |
| data | jsonb | gestructureerde data (KPIs, findings) |
| version | int | bij iteraties |
| created_at | timestamptz | |

### `kpi_snapshots`
Dagelijkse snapshot van Meta + Google KPIs per klant. Gevuld door cron-job.

| Kolom | Type | Notitie |
|---|---|---|
| id | uuid | |
| client_id | uuid | FK |
| date | date | |
| platform | enum | `meta` \| `google` |
| spend_cents | bigint | |
| impressions | bigint | |
| clicks | bigint | |
| conversions | int | |
| revenue_cents | bigint | |
| roas | numeric | |
| raw_data | jsonb | volledige API-response |

### `invoices`
Maandelijkse facturatie per agency. Stripe sync (later).

| Kolom | Type | Notitie |
|---|---|---|
| id | uuid | |
| agency_id | uuid | FK |
| period_start | date | |
| period_end | date | |
| amount_cents | int | |
| status | enum | `draft` \| `sent` \| `paid` \| `overdue` |
| stripe_invoice_id | text | nullable |
| created_at | timestamptz | |

## Row Level Security (RLS) — kritiek voor multi-tenant veiligheid

```sql
-- agency_admins zien alleen hun eigen agency-data
CREATE POLICY agency_isolation ON clients
  FOR ALL USING (
    agency_id IN (
      SELECT id FROM agencies WHERE admin_user_id = auth.uid()
    )
  );

-- operator (Willem) bypasst alles via service-role key in server actions
-- (geen client-side queries vanuit operator cockpit)
```

Wordt voor élke tabel met `agency_id` toegepast.

## Indexen

```sql
CREATE INDEX idx_clients_agency_id ON clients(agency_id);
CREATE INDEX idx_service_requests_status ON service_requests(status) WHERE status IN ('pending', 'in_progress');
CREATE INDEX idx_service_requests_agency_id ON service_requests(agency_id);
CREATE INDEX idx_kpi_snapshots_client_date ON kpi_snapshots(client_id, date DESC);
CREATE INDEX idx_reports_client_id ON reports(client_id);
```
