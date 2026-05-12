# Willoe — White-Label Agency Platform

> SaaS platform voor ad-agencies. Multi-tenant met Row Level Security, BYOK (Bring Your Own Keys), Stripe subscriptions, AI Studio (Claude + Gemini), live Meta Ads dashboard.

## ✨ Wat is dit?

Een complete white-label SaaS waarmee kleine ad-agencies hun klanten kunnen onboarden, ads-data zien, AI-creative laten maken en facturen versturen — alles in één dashboard.

**Tech:** Next.js 16 · React 19 · Tailwind 4 · Supabase · Drizzle ORM · shadcn/ui · Anthropic Claude · Gemini Imagen · Stripe · Meta Marketing API · Google Ads API

## 📦 Features

- **Multi-tenant** met Postgres Row Level Security
- **Auth** — email/wachtwoord + Google OAuth
- **Live Meta Ads dashboard** met per-klant switcher
- **AI Studio** (4 tabs: Beelden, Scripts, Video-ideeën, Rapporten)
- **BYOK integraties** — elke agency vult eigen API keys in
- **Stripe subscriptions** — 14-dagen trial → 3 plan tiers (€99/€299/€799)
- **Stripe facturen** — agencies factureren hun eigen klanten (BYOK)
- **Gebrande PDF exports** (rapporten + facturen)
- **Operator cockpit** — beheer alle agencies vanuit één dashboard
- **Impersonation** — operator kan meekijken als een agency

## 🚀 Quickstart

### Voor end users (agencies)
Bezoek **[willoe.com](https://willoe.com)** → start 14-dagen gratis trial.

### Voor developers (zelf installeren)

1. **Volg de Setup Guide** — [`Willoe-Setup-Guide.pdf`](./Willoe-Setup-Guide.pdf) doorloopt alle 6 API services met video tutorials
2. **Of laat Claude Code het doen** — open Claude Code in deze repo en zeg: *"Installeer Willoe voor mij volgens INSTALL.md"*

```bash
git clone https://github.com/willemvdheijden/willoe-platform.git
cd willoe-platform/web
npm install
cp .env.local.example .env.local
# Vul .env.local met je API keys (zie Setup Guide)
npm run db:apply-sql
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## 📚 Documentatie

| Document | Doel |
|---|---|
| [`Willoe-Setup-Guide.pdf`](./Willoe-Setup-Guide.pdf) | Stap-voor-stap installatie met video tutorials |
| [`INSTALL.md`](./INSTALL.md) | Instructies voor Claude Code om installatie te automatiseren |
| [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md) | Vercel deploy + DNS + Supabase config |
| [`STRIPE_PLATFORM_SETUP.md`](./STRIPE_PLATFORM_SETUP.md) | Stripe Products + webhook setup |
| [`GO_LIVE_CHECKLIST.md`](./GO_LIVE_CHECKLIST.md) | Pre-launch checklist voor eerste betalende klant |
| [`DECISIONS.md`](./DECISIONS.md) | Architectuur keuzes |
| [`SCHEMA.md`](./SCHEMA.md) | Database schema |
| [`DESIGN.md`](./DESIGN.md) | Design tokens + visuele richtlijnen |
| [`PAGES.md`](./PAGES.md) | Sitemap + componenten per pagina |

## 🏗️ Architectuur

```
┌─────────────────────────────────────────────────────────┐
│ Marketing landing      │ Pricing      │ Auth + Onboarding│
├──────────────┬─────────┴──────────────┴─────────────────┤
│ AGENCY PORTAL                  │ OPERATOR COCKPIT       │
│ /portal/clients                │ /admin/queue           │
│ /portal/ads (live Meta)        │ /admin (overzicht)     │
│ /portal/studio (AI 4 tabs)     │ Impersonation          │
│ /portal/services + /requests   │                        │
│ /portal/integrations (BYOK)    │                        │
│ /portal/billing (Stripe)       │                        │
│ /portal/settings (branding)    │                        │
└────────────────┬──────────────────────────┬────────────┘
                 │                          │
                 ▼                          ▼
        ┌─────────────────────────────────────┐
        │ Postgres (Supabase) — multi-tenant  │
        │ users, agencies, clients, services, │
        │ service_requests, reports, invoices,│
        │ agency_integrations (BYOK), team... │
        └─────────────┬───────────────────────┘
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
   Anthropic      Gemini         Meta Ads
   (per agency) (per agency)  (per agency)
```

## 📁 Folder structuur

```
willoe-platform/
├── README.md                    ← dit bestand
├── Willoe-Setup-Guide.pdf       ← deelbare PDF voor end users
├── INSTALL.md                   ← voor Claude Code installer
├── DEPLOY_GUIDE.md              ← production deploy stappen
├── STRIPE_PLATFORM_SETUP.md     ← Stripe Products + webhooks
├── GO_LIVE_CHECKLIST.md         ← pre-launch checklist
├── DECISIONS.md / SCHEMA.md / DESIGN.md / PAGES.md  ← architectuur docs
├── .claude/agents/              ← QA agents voor Claude Code
└── web/                         ← Next.js app
    ├── src/
    │   ├── app/                 ← pages + API routes
    │   ├── components/          ← UI componenten
    │   └── lib/                 ← helpers, db, supabase, stripe, meta, pdf
    ├── drizzle/                 ← SQL migrations (5 files)
    ├── scripts/                 ← setup-operator, verify-db, etc.
    └── package.json
```

## 🔐 Security

- Row Level Security (RLS) op alle agency-scoped tabellen
- Encrypted token storage in `agency_integrations`
- BYOK = elke agency gebruikt eigen API keys (variabele kosten op hun account)
- Stripe webhook signature verification
- No secrets in code — alles via `.env.local` of `agency_integrations` DB

## 📜 License

Proprietary. Contact [willem](mailto:willem@willoe.com) voor licentie.

## 🤝 Credits

Gebouwd met [Claude Code](https://claude.com/claude-code) door Willem van der Heijden, mei 2026.
