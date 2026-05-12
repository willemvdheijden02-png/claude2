# Willoe — Go Live Checklist

Volgorde van stappen voor de eerste echte betalende klant.

## ✅ Pre-launch (vóór je verkoopt)

- [ ] **Domein actief**: `willoe.com` (of jouw eigen) live op Vercel met SSL
- [ ] **Supabase Site URL** → `https://willoe.com` (niet localhost)
- [ ] **Google OAuth redirect** → bevat `https://willoe.com` als origin
- [ ] **Terms + Privacy** → laat NL-jurist nakijken (concept staat al op /terms en /privacy)
- [ ] **Email-verification** test met echte email — link werkt vanuit Supabase email template
- [ ] **Pricing page** copy is finaal — geen lorem ipsum, geen typo's
- [ ] **First-run tour** is geprobeerd door iemand die nog nooit Willoe heeft gezien
- [ ] **Refund policy** is bepaald (bv "14 dagen, no questions asked")

## 💳 Stripe live mode aanzetten

1. [dashboard.stripe.com](https://dashboard.stripe.com) → toggle rechtsboven van **Test** naar **Live**
2. **Activate account** — vereist:
   - KvK-nummer
   - IBAN voor payouts
   - ID-verificatie (kopie van ID + selfie)
   - Bedrijfsadres
   - Beschrijving wat je verkoopt
3. Wacht 1-3 werkdagen voor approval
4. Eenmaal approved:
   - [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) (NIET /test/)
   - Kopieer **Live publishable** + **Live secret** keys
   - Update in Vercel env vars:
     - `STRIPE_SECRET_KEY=sk_live_...`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - Vercel → Redeploy

## 🔔 Stripe webhook in live mode

1. [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) → **+ Add endpoint**
2. URL: `https://willoe.com/api/stripe/webhook`
3. Events: `invoice.paid`, `invoice.payment_failed`, `invoice.voided`, `invoice.sent`
4. Add endpoint → kopieer **Signing secret** (`whsec_...`)
5. Vercel env vars → `STRIPE_WEBHOOK_SECRET=whsec_...`
6. Redeploy
7. Test: maak een test invoice → Stripe dashboard → markeer als betaald → check of webhook is binnengekomen + DB updated

## 📧 Email-verzending live krijgen

**Voor: factuur emails + welkomstmail + password reset**

1. [resend.com](https://resend.com) → Sign up → API key
2. **Domains** → Add `willoe.com`
3. Voeg DNS records toe in Cloudflare:
   - SPF, DKIM, DMARC records die Resend genereert
4. Verifieer domein (5-30 min)
5. Vercel env vars:
   - `RESEND_API_KEY=re_...`
   - `RESEND_FROM_EMAIL=hello@willoe.com`
6. Test: maak invoice → email aankomst checken (test in plaats van Stripe inbox)

## 🔐 Security checks

- [ ] **Service role key** is alleen server-side gebruikt (geen `NEXT_PUBLIC_` prefix)
- [ ] **RLS policies** zijn aan op alle agency-scoped tabellen — verifieer met `node scripts/verify-db.mjs`
- [ ] **Rate limiting** op auth endpoints (Supabase doet dit standaard, verify in Auth settings)
- [ ] **CORS** — alleen jouw domein mag API endpoints aanroepen (Next.js doet dit standaard)
- [ ] **Backup** — Supabase Pro plan (€25/maand) voor PITR (point-in-time recovery) als je meer dan 5 klanten hebt

## 📊 Monitoring

- [ ] **Vercel Analytics** aan: Project Settings → Analytics → Enable (gratis tot 100k events)
- [ ] **Plausible** of **PostHog** voor user behavior (zie `src/components/analytics.tsx`)
- [ ] **Sentry** voor error tracking (optioneel maar aanrader):
  ```bash
  npx @sentry/wizard@latest -i nextjs
  ```
- [ ] **Uptime monitoring**: gebruik **Better Uptime** of **Uptime Robot** (gratis) — pingt elke 5 min

## 💰 Eerste paar dagen

- [ ] Maak een **test-invoice op jezelf** met klein bedrag (€1) — betaal met echte iDEAL
- [ ] Verifieer dat geld op je Stripe balance staat
- [ ] Verifieer dat het invoice-status in Willoe naar "paid" springt (webhook werkt)
- [ ] Verifieer dat de payout binnen 7 dagen op je bankrekening verschijnt
- [ ] Dan: pas pricing live zetten en eerste klant uitnodigen

## 🎯 Pricing strategie tips

- **Founding agency offer**: eerste 10 klanten 50% korting voor leven → lock-in + sociale proof
- **14 dagen gratis trial** — geen credit card vooraf (verlaagt friction)
- **Geen jaar-contract** — maandelijks opzegbaar (lager risico voor klant)
- **Annual discount**: -20% bij jaarbetaling (cashflow voor jou)

## 📞 Customer success

Voor de eerste 5 klanten:
- [ ] Doe een 30-min onboarding call (zelf) — leer hun gebruik kennen
- [ ] Maak een Loom-video over de top features → stuur in welkomstmail
- [ ] Vraag na 7 dagen om feedback per email
- [ ] Vraag na 30 dagen om een testimonial (use it als sociale proof)

---

## 🚨 Wat NIET vergeten

- **Backup strategy**: weet wat je doet als de Supabase DB crasht (recovery flow getest?)
- **Disaster recovery**: weet wat je doet als willoe.com offline is voor 2 uur (email-update naar klanten?)
- **Privacy data verzoeken**: heb een proces voor GDPR data-export verzoeken (binnen 30 dagen wettelijk verplicht)
- **Boekhouding**: facturen automatisch downloaden + naar boekhouder sturen
