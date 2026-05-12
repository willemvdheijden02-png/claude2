# Willoe — Deploy Guide

Stappenplan om naar `https://willoe.com` te gaan.

## 🛒 1. Domein kopen — willoe.com (5 min, ~€10/jaar)

Aanrader: **Cloudflare Registrar** (geen markup, gratis WHOIS-privacy, makkelijke DNS).

1. [dash.cloudflare.com](https://dash.cloudflare.com) → registreer of login
2. **Registrar** → **Register domains** → zoek `willoe.com`
3. Niet beschikbaar? Probeer alternatieven die we eerder bespraken: `willoe.app`, `willoe.io`, `runwilloe.com`
4. Koop voor €9.51/jaar (.com Cloudflare prijs 2026)

Alternatief: **Namecheap**, **Porkbun** (vergelijkbare prijzen).

## ☁️ 2. Vercel account + project (5 min)

1. [vercel.com](https://vercel.com) → registreer met **GitHub** (anders krijg je later issues met deploys)
2. Verbind je GitHub account
3. We zetten Willoe straks in een GitHub repo en importeren hier

## 📦 3. Code naar GitHub pushen (3 min)

Vanuit `/Users/willem/agency-platform/`:

```bash
cd /Users/willem/agency-platform/web
# Init als nog niet
git init
git add .
git commit -m "Initial Willoe commit"

# Maak op GitHub een NIEUW privé repo: willoe-platform
# Push:
git remote add origin git@github.com:WillemvdHeijden/willoe-platform.git
git branch -M main
git push -u origin main
```

> ⚠️ `.env.local` staat al in `.gitignore` — secrets gaan NIET mee. Goed.

## 🚀 4. Vercel deploy (5 min)

1. Vercel Dashboard → **Add New Project**
2. Import jouw `willoe-platform` repo
3. **Framework Preset**: Next.js (auto-detect)
4. **Root Directory**: `web` (we zitten in een subfolder!)
5. **Environment Variables** — klik **Add** voor elk:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_API_KEY=AIza...
META_APP_ID=1309586971267830
META_ACCESS_TOKEN=EAASnDZCo5kvY...
META_AD_ACCOUNT_BH=act_664527626124737
META_AD_ACCOUNT_KUSSENS=act_1386801278973994
NEXT_PUBLIC_SUPABASE_URL=https://dgauyeleldmdybudwdoa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
DATABASE_URL=postgresql://postgres.dgauyeleldmdybudwdoa:WILloe0099%3F%3F@aws-1-eu-west-2.pooler.supabase.com:6543/postgres
GOOGLE_OAUTH_CLIENT_ID=149073312684-...apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-...
NEXT_PUBLIC_SITE_URL=https://willoe.com
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
GOOGLE_ADS_CUSTOMER_ID=647-850-1947
GOOGLE_ADS_DEVELOPER_TOKEN=IjkKLtOQljS91jANtw9Cig
```

> Tip: kopieer ALLE vars uit `web/.env.local` (skip de comments), maar **wijzig `NEXT_PUBLIC_SITE_URL` naar `https://willoe.com`** (niet localhost).

6. Klik **Deploy** → wacht ~2 min → krijg een `willoe-platform.vercel.app` URL

## 🌐 5. Domein koppelen aan Vercel (5 min)

### In Vercel
1. Project → **Settings** → **Domains**
2. Add `willoe.com` → Add `www.willoe.com`
3. Vercel toont DNS-records die je moet zetten

### In Cloudflare DNS
1. Cloudflare Dashboard → kies `willoe.com` → **DNS** → **Records**
2. Voeg toe (precies zoals Vercel zegt, meestal):
   - Type `A`, Name `@`, Value `76.76.21.21`
   - Type `CNAME`, Name `www`, Value `cname.vercel-dns.com`
3. **Belangrijk**: zet Proxy status op **DNS only** (grijze wolk, niet oranje) — anders breekt Vercel's SSL
4. Save

Wacht 1-5 min → Vercel verifieert automatisch → SSL wordt uitgegeven → `https://willoe.com` werkt 🎉

## 🔐 6. Update externe configs naar productie URL (5 min)

### Supabase
1. Dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: `https://willoe.com`
3. **Redirect URLs**: voeg toe `https://willoe.com/**` (bovenop bestaande localhost)
4. Save

### Google Cloud OAuth (voor Google login)
1. [Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Klik `Willoe Web` OAuth client
3. **Authorized JavaScript origins**: voeg `https://willoe.com` toe
4. **Authorized redirect URIs**: voeg `https://dgauyeleldmdybudwdoa.supabase.co/auth/v1/callback` toe (deze stond er al — check)
5. Save

### Stripe webhook (later)
Pas inrichten als we Stripe webhook handler bouwen. Niet nu nodig.

## 🧪 7. Smoke test op productie (5 min)

Open `https://willoe.com` → check:
- [ ] Landing pagina laadt
- [ ] Login werkt met Google + email
- [ ] Na signup → onboarding wizard → maak agency
- [ ] /portal toont jouw agency-naam
- [ ] /portal/clients → voeg test klant toe
- [ ] /portal/ads → toont Meta data (als klant Meta heeft)
- [ ] /portal/studio → AI chat werkt
- [ ] /portal/billing → maak test factuur

Als één van deze faalt → check Vercel logs (Project → Deployments → klik deployment → Functions tab).

## 📊 8. Setup checklist (na deploy)

- [ ] DNS check: `dig willoe.com` toont `76.76.21.21`
- [ ] SSL valid: `curl -I https://willoe.com` geeft `HTTP/2 200`
- [ ] Sentry / error monitoring (later)
- [ ] Vercel Analytics aanzetten (gratis)
- [ ] Backup van DB (Supabase doet daily auto, maar check)
- [ ] Stripe live mode (pas als eerste echte klant)

---

## 🔁 Toekomstige deploys

Elke `git push` naar `main` triggert automatisch een nieuwe Vercel deploy. Branches krijgen preview-URLs.

```bash
# Maak wijziging in code
git add . && git commit -m "fix: invoice modal" && git push
# → Vercel deployt automatisch in ~2 min
```

---

## 🆘 Veelvoorkomende issues

**"Build failed: Cannot find module @/lib/..."**
→ Check dat `tsconfig.json` paths klopt en Root Directory in Vercel op `web` staat.

**"DATABASE_URL invalid"**
→ Check dat Supabase password URL-encoded is in DATABASE_URL (special chars zoals `?` → `%3F`).

**"Google OAuth: redirect_uri_mismatch"**
→ Voeg `https://willoe.com` toe aan Authorized JavaScript origins én de Supabase callback URL aan redirect URIs.

**"Supabase auth: Invalid email"**
→ Site URL in Supabase moet `https://willoe.com` zijn, niet localhost.

---

## 💰 Verwachte kosten

| Item | Per maand |
|---|---|
| Cloudflare domein | €0,80 (= €9,51/jaar) |
| Vercel Hobby | €0 (tot 100GB bandwidth) |
| Supabase Free | €0 (tot 500MB DB, 1GB storage, 50k MAU) |
| Anthropic API | per gebruik (~€0,02 per Studio chat) |
| Gemini Imagen | per gebruik (~€0,04 per beeld) |
| Meta API | gratis |
| Stripe | 1.4% + €0,25 per transactie (live mode) |
| **Totaal vast** | **€0.80** |

Schaalt naar Pro tiers als je meer dan ~100 agencies hebt.
