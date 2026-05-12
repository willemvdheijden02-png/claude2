# Sitemap & Pagina-spec — AgencyHQ

Per pagina: route, doel, key componenten, data dependencies.

## Routes overzicht

```
/                                 ← marketing landing (later, fase 7)
/login                            ← shared login (operator + agency)
/signup                           ← agency self-signup (later)

# Operator cockpit (only role=operator)
/admin                            ← overview dashboard
/admin/agencies                   ← list + new
/admin/agencies/[slug]            ← agency detail + branding
/admin/clients                    ← all clients across agencies
/admin/queue                      ← service request inbox
/admin/queue/[id]                 ← request detail + run skill
/admin/services                   ← skill catalog beheer
/admin/reports                    ← all reports archief
/admin/billing                    ← invoices + fee status

# Agency portal (only role=agency_admin, scoped to their agency)
/portal                           ← agency overview
/portal/clients                   ← list + new
/portal/clients/[id]              ← klant detail + KPIs
/portal/services                  ← skill catalog (request services)
/portal/services/[slug]           ← service detail + "Run for client"
/portal/requests                  ← active requests + history
/portal/requests/[id]             ← request status + output
/portal/reports                   ← rapport-archief
/portal/settings                  ← branding + account
```

---

## OPERATOR COCKPIT — pagina's

### `/admin` — Overview

**Doel:** Eén-blik op de business.

**Sectie 1 — KPI cards (4 stuks bovenaan):**
- Active Agencies (count + ↑↓ vs vorige maand)
- MRR (sum van active agency fees)
- Pending Requests (badge: hoeveel wachten er)
- Reports This Month

**Sectie 2 — Queue preview** — laatste 5 pending requests, "Open Queue" link
**Sectie 3 — Recent activity feed** — laatste 10 events (request created, completed, agency signed up)
**Sectie 4 — Revenue chart** — line chart MRR laatste 6 maanden

### `/admin/agencies` — Agency list

**Tabel kolommen:** Display Name, Status, Plan, MRR, Clients (count), Onboardings used / quota, Last Activity, [actions]

**Header:** "+ New Agency" button (opent modal)

### `/admin/agencies/[slug]` — Agency detail

**Tabs:** Overview · Clients · Branding · Billing · Activity

**Branding tab:** logo upload, primary color picker, accent color picker, display_name edit. Live preview rechts.

### `/admin/queue` — Service request inbox

**Het meest gebruikte scherm voor jou.**

**Filters bovenaan:** Status (pending / in_progress / done / failed) · Agency · Service · Datumrange
**Lijst:** elke rij = 1 request, met:
- Status pill
- Service name + icon
- Agency name + Client name
- Created at (relative time)
- "Run" button (status=pending) of "View" (overig)

**Sortering default:** pending eerst, dan oudst eerst.

### `/admin/queue/[id]` — Request detail

**Linker kolom:**
- Service info
- Klant info + URL
- Brief (van agency)
- Input payload (JSON viewer)

**Rechter kolom:**
- Status timeline
- "Open in Claude Code" button — kopieert skill-command + context naar clipboard, opent Claude Code via deeplink
- Output upload-zone (drag PDF / JSON)
- Operator notes textarea
- "Mark as Done" button

### `/admin/services` — Service catalog beheer

**Tabel:** Service Name, Slug, Category, Active, Price, Skill Command. Edit per rij.

### `/admin/reports`, `/admin/billing` — straightforward archief + tabel views.

---

## AGENCY PORTAL — pagina's

### `/portal` — Overview

**Hero strip:** Welcome back, [agency name]. Quota gauge: "3 of 10 onboardings used this month."

**KPI cards:**
- Active Clients
- Pending Requests
- Reports Delivered (this month)
- Avg Turnaround (hours)

**Sectie:** "Pinned services" — 4 grootste service-cards (Meta Audit, SEO Audit, Static Remix, Onboarding) met "Run" button.

**Sectie:** "Recent Reports" — laatste 5, download-knoppen.

### `/portal/clients` — Klantenbeheer

**Tabel:** Display Name, Website, Status, Last Service, Active Requests, [actions]
**+ New Client** button → modal met form: name, URL, ICP, budget, 3 competitors, current creatives URL, Meta + Google account IDs.

### `/portal/clients/[id]` — Klant detail

**Tabs:** Overview · KPIs · Requests · Reports · Settings

**KPIs tab:** Live Meta + Google data. Spend, ROAS, CPA per platform, last 30/90 days. Charts (line, bar). Source van data: `kpi_snapshots`.

### `/portal/services` — Service catalog (de "skill launcher")

**Layout:** Grid van service-cards (3 cols desktop). Categorieën als filter-tabs bovenaan: All · Audit · Creative · SEO · Strategy.

**Card content:**
- Lucide icon (uit `services.icon_name`)
- Display name
- 1-line description
- Estimated turnaround (e.g. "~24h")
- Price badge (if extra fee, anders "Included")
- "Request" button → opens modal: pick client, write brief, submit

**Bij submit:** maakt `service_request` aan, status=pending. Toast: "Request submitted — we'll notify you when ready."

### `/portal/services/[slug]` — Service detail

**Wat doet deze service?** Lange description, voorbeeld-output (image/PDF preview), wat heb je nodig (input requirements), gemiddelde turnaround.

**CTA:** "Request for a client" — same modal als hierboven.

### `/portal/requests` — Active + history

**Twee secties:**
- **Active:** rijen met status=pending of in_progress, met progress indicator + ETA
- **History:** completed/failed/cancelled

### `/portal/requests/[id]` — Request status

Timeline (Submitted → In Progress → Done), output download als status=done. Operator notes (alleen success-relevant deel zichtbaar voor agency).

### `/portal/reports` — Archief

Tabel: Report name, Client, Service, Date, [Download PDF].

### `/portal/settings` — Branding + account

**Branding tab:** alleen voor v1 lezen, niet bewerkbaar (operator beheert dit). Preview hoe portal eruit ziet.
**Account tab:** email, wachtwoord, sign out.

---

## Komponenten library (shadcn/ui base + custom)

| Component | Standaard shadcn | Custom variant |
|---|---|---|
| Button | ✓ | accent-glow hover variant |
| Card | ✓ | hover-lift variant |
| Table | ✓ | dense variant met tabular-nums |
| Dialog | ✓ | |
| Toast | ✓ | rechts-onder positie |
| Tabs | ✓ | underline variant (Linear-stijl) |
| Badge | ✓ | status-pill variant |
| StatCard | — | custom: KPI value + delta + sparkline |
| ServiceCard | — | custom: voor catalog grid |
| EmptyState | — | custom: icon + text + CTA |
| Skeleton | ✓ | |
| CommandPalette | shadcn cmdk | Cmd+K trigger globally |

---

## Routing & layout files (Next.js App Router)

```
app/
├── layout.tsx                    ← root, dark mode, Geist font
├── (marketing)/
│   └── page.tsx                  ← landing (later)
├── login/page.tsx
├── (operator)/
│   ├── layout.tsx                ← operator chrome (sidebar)
│   └── admin/
│       ├── page.tsx              ← /admin overview
│       ├── agencies/
│       ├── clients/
│       ├── queue/
│       ├── services/
│       ├── reports/
│       └── billing/
└── (agency)/
    ├── layout.tsx                ← agency chrome (sidebar + dynamic branding)
    └── portal/
        ├── page.tsx
        ├── clients/
        ├── services/
        ├── requests/
        ├── reports/
        └── settings/
```

Auth-redirects in middleware.ts: operator → /admin, agency_admin → /portal.
