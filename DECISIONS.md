# Architectuur Beslissingen — AgencyHQ

Vastgelegd zodat we niet halverwege heen-en-weer schakelen.

## 1. Producttype

**SaaS webapp**, multi-tenant. Twee user-rollen:
- `operator` — Willem (en eventueel toekomstig team)
- `agency_admin` — beheerder van een agency, krijgt een agency-scoped portal

## 2. Skill-launcher model — Request Queue (A)

Agencies klikken op "Run Service" in het portal. Dat maakt een `service_request` aan in de database. Willem ziet de request in zijn cockpit, draait de skill in **Claude Code op zijn eigen Mac**, output gaat terug naar de webapp (storage + DB-update). Agency krijgt notificatie + download.

**SLA naar agency:** 24 uur turnaround voor v1. Later kunnen we naar realtime (model B) doorgroeien.

## 3. Tech Stack

| Laag | Keuze | Reden |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Industriestandaard, snel, full-stack in 1 codebase |
| **Styling** | Tailwind CSS 4 | Snel itereren, design tokens via CSS vars |
| **UI Components** | shadcn/ui | Premium look out-of-the-box, volledig custom-baar |
| **Database** | Postgres via Supabase | Auth + DB + Storage + RLS in één |
| **ORM** | Drizzle | Type-safe, geen overhead |
| **Auth** | Supabase Auth | Google OAuth + email/wachtwoord native ondersteund |
| **Hosting** | Vercel | Zero-config Next.js deploys |
| **File Storage** | Supabase Storage | PDF-rapporten, agency logo's |
| **Email** | Resend | Notificaties bij request done |
| **Billing (later)** | Stripe | Maandfee per agency |
| **Monitoring** | Vercel Analytics + Sentry | Errors + performance |

**Geen:** GraphQL, microservices, Redis (nog niet nodig), Kubernetes.

## 4. Auth

- **Login methodes:** Google OAuth + email/wachtwoord (beide via Supabase)
- **Multi-tenancy:** Row Level Security (RLS) in Postgres — een agency-user kan alleen z'n eigen rijen zien
- **Operator-rol:** apart gevlagd in `users.role = 'operator'` — bypasst RLS via service-role key

## 5. White-label branding

Per agency in `agencies`-tabel opgeslagen:
- `logo_url` (geüpload naar Storage)
- `primary_color` (hex)
- `accent_color` (hex)
- `display_name`

Wordt op runtime opgehaald en toegepast op:
- Het portal van die agency (CSS vars worden runtime gezet)
- PDF-rapporten (template krijgt deze waarden injected)

## 6. Visuele richting

**Premium referentie:** Linear + Vercel hybride.
- Donker default (light optioneel)
- Monochroom met **1 accentkleur** (default: emerald-500, per-agency overschreven)
- Inter font (Vercel-stijl) of Geist
- Veel ruimte (generous padding)
- Subtiele borders (1px met 8% opacity)
- Geen schaduwen, wel glow/blur op hover

Volledige tokens: zie `DESIGN.md`.

## 7. Claude Code integratie (skill-runner)

Op Willem's Mac draait een **lokale watcher** (Node.js script of cron):
- Polt elke 60s de `service_requests` tabel op `status = pending`
- Wanneer er een nieuwe request is → notificatie naar Willem (macOS) + opent Claude Code met de juiste skill-prompt voorgeladen
- Willem reviewt + draait
- Output (PDF / data) wordt geüpload naar Supabase Storage
- Status update naar `done` → agency krijgt email

Dit hoeft NIET geautomatiseerd te zijn voor v1 — Willem mag het ook handmatig doen vanuit een dashboard-link "Open in Claude Code".

## 8. Wat we expliciet NIET bouwen in v1

- Realtime skill execution (cloud agent)
- Mobile app
- Team-based agency users (alleen 1 admin per agency)
- White-label domein per agency (alle agencies onder hetzelfde domein, gewoon scoped path: `/portal/[agency-slug]`)
- API voor third-party integraties
- Complete skill catalog — beginnen met 5-7 kernservices

## 9. Domein & Brand

**Domein: `willoe.com`** (locked in).

Brand-naam: **Willoe**. Abstracte merknaam afgeleid van "Willem". Past bij Linear/Vercel/Stripe-rijtje. Werkende product-naam binnen Willoe = **Willoe Agency** (de SaaS voor agencies).

Toekomstig: Willoe wordt eventueel een paraplu-merk met meerdere producten (Agency platform + ander AI dashboard dat later wordt geïntegreerd). Voor v1 = puur agency dashboard.

Werken voorlopig op `localhost` + Vercel preview-URLs tot het domein gekocht is.
