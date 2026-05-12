# Willoe — Install Instructions for Claude Code

**For Claude Code agents:** when the user asks you to install Willoe, follow these steps EXACTLY. Stop and ask the user for missing info; never invent values.

---

## Goal

Set up the Willoe agency platform locally so the user can run `npm run dev` and see the dashboard at `http://localhost:3001`.

## Required from the user (ask one by one as needed)

| # | Service | What to ask for | Where they get it |
|---|---|---|---|
| 1 | **Anthropic** | API key starting with `sk-ant-api03-...` | console.anthropic.com → API Keys |
| 2 | **Google AI Studio** | API key starting with `AIzaSy...` | aistudio.google.com → Get API key |
| 3 | **Supabase project** | URL + publishable key + secret key + DB password | supabase.com/dashboard → New project (region: eu-west-2) |
| 4 | **Google Cloud OAuth** | Client ID `xxx.apps.googleusercontent.com` + Secret `GOCSPX-...` | console.cloud.google.com → APIs & Services → Credentials |
| 5 | **Meta Business** | App ID + long-lived access token + Ad Account ID(s) | developers.facebook.com → My Apps + Graph API Explorer |
| 6 | **Stripe** | Test publishable `pk_test_...` + secret `sk_test_...` | dashboard.stripe.com/test/apikeys |

Optional (skip if user doesn't have them):
- Google Ads developer token + MCC customer ID
- Resend API key

## Step-by-step install procedure

### 1. Verify prerequisites

```bash
node --version    # must be 22+
git --version
npm --version
```

If any missing, point user to nodejs.org/en/download and git-scm.com/downloads.

### 2. Clone the repo

Ask the user where they want it. Default: `~/willoe-platform`.

```bash
git clone https://github.com/[REPO_OWNER]/willoe-platform.git ~/willoe-platform
cd ~/willoe-platform/web
```

If they don't have a repo URL yet, ask them. (For Willem's personal version, the repo lives at `/Users/willem/agency-platform/web` — no clone needed.)

### 3. Install dependencies

```bash
npm install
```

Wait until it finishes. Show output to user if errors.

### 4. Create `.env.local`

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in values **one section at a time**, asking the user for each missing key. Don't ask for all keys at once — walk through them grouped by service.

**Order of asking:**
1. Anthropic (smallest, fastest to get)
2. Google AI Studio (gemini)
3. Supabase (4 values: URL + 2 keys + DATABASE_URL)
   - For DATABASE_URL: ask for Supabase project ref + region + DB password. Construct: `postgresql://postgres.{ref}:{password_url_encoded}@aws-1-{region}.pooler.supabase.com:6543/postgres`
   - Remember to URL-encode special chars in password: `?` → `%3F`, `/` → `%2F`, `+` → `%2B`, `=` → `%3D`
4. Google OAuth (Client ID + Secret) — explain they need to set Supabase callback URL `https://{ref}.supabase.co/auth/v1/callback` as Authorized redirect URI in Google Cloud
5. Meta (App ID + token + Ad Account ID)
6. Stripe (both keys)

After each section, show what you wrote and ask "next service?" before moving on.

### 5. Apply database migrations

```bash
npm run db:apply-sql
```

This creates 9 tables, RLS policies, auth triggers, and seeds 12 services. If it fails on first try with "Tenant or user not found", the region in DATABASE_URL is wrong — re-ask user for their Supabase region.

### 6. Verify DB setup

```bash
node scripts/verify-db.mjs
```

Must show 9 tables + 12 services + RLS policies. If not, escalate to user.

### 7. Configure Supabase Auth (manual user actions — guide them)

Tell the user:
- Open Supabase Dashboard → Authentication → Providers → Google → enable + paste Google OAuth credentials → Save
- Open Supabase Dashboard → Authentication → URL Configuration → Site URL: `http://localhost:3001` → Redirect URLs: `http://localhost:3001/**` → Save

### 8. Start dev server

```bash
npm run dev
```

Wait for "Ready in Xms" message. Tell user to open http://localhost:3001 and:
1. Sign up at `/signup` with email or Google
2. Complete onboarding wizard to create their first agency
3. Add a client at `/portal/clients`
4. Check `/portal/ads` works (if they added a Meta Ad Account ID)

### 9. Done — what to tell the user

Confirm everything works. Point them to:
- `/Users/willem/agency-platform/Willoe-Setup-Guide.pdf` for full reference
- `DEPLOY_GUIDE.md` in the repo for production deploy steps later

---

## Common issues & fixes

**`ANTHROPIC_API_KEY not set` even though it's in .env.local**
The user's shell might be exporting an empty `ANTHROPIC_API_KEY`. The codebase's `lib/env.ts` handles this — but if it still fails, restart dev server with `unset ANTHROPIC_API_KEY && npm run dev`.

**Meta API: "Session has expired"**
Their long-lived token is dead. Walk them through Graph API Explorer + Access Token debugger to extend (see PDF section 2.5).

**Google OAuth: "redirect_uri_mismatch"**
The Supabase callback URL is missing from their Google Cloud OAuth client. Tell them to add `https://{their-supabase-ref}.supabase.co/auth/v1/callback` to Authorized redirect URIs.

**DATABASE_URL: "Tenant or user not found"**
Wrong pooler region. Modern Supabase uses `aws-1-{region}` (not `aws-0`). Verify the exact hostname in Supabase Project Settings → Database → Connection string.

**DATABASE_URL: "password authentication failed"**
Special chars in password not URL-encoded. Re-encode and retry.

---

## What NOT to do

- Don't commit `.env.local` (it's gitignored, leave it that way)
- Don't paste API keys into the chat or terminal logs visible to the user — only into `.env.local`
- Don't skip the Supabase Auth Providers config step (Google OAuth won't work without it)
- Don't run `npm run dev` before migrations are applied
- Don't tell the user to manually edit `package.json` or `tsconfig.json` — those are fine as-is
