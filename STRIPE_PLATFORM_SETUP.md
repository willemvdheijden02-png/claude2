# Stripe Platform Subscriptions — Setup

Eenmalig in Stripe Dashboard om je 3 plannen + webhook te configureren.

**Tijd:** ~15 minuten in test mode, daarna kopiëren naar live mode bij go-live.

---

## 1. Maak 3 Products + Prices (5 min)

[dashboard.stripe.com/test/products](https://dashboard.stripe.com/test/products) → **+ Add product**

Voor elk plan:

### Product: Willoe Starter
- Name: `Willoe Starter`
- Description: `Voor 1-2 person agencies — 5 klanten, 3 onboardings/maand`
- Pricing: **Recurring** · €99,00 EUR · Monthly · **No trial** (we handle trial in code)
- Tax behavior: **Exclusive**
- Save → kopieer de **Price ID** (`price_xxx`)

### Product: Willoe Pro
- Name: `Willoe Pro`
- Description: `Onbeperkt klanten, 10 onboardings/maand, white-label`
- Pricing: Recurring · €299,00 · Monthly
- Save → kopieer Price ID

### Product: Willoe Scale
- Name: `Willoe Scale`
- Description: `Onbeperkt onboardings, team van 10`
- Pricing: Recurring · €799,00 · Monthly
- Save → kopieer Price ID

## 2. Voeg Price IDs toe aan .env.local

```bash
# Stripe Platform Plans (test mode)
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_SCALE=price_...
```

Op productie (Vercel): voeg deze toe in Project Settings → Environment Variables.

## 3. Activate Customer Portal (2 min)

[dashboard.stripe.com/test/settings/billing/portal](https://dashboard.stripe.com/test/settings/billing/portal)

- **Activate** → klik **Activate test link**
- **Default settings**:
  - ☑️ Customers can switch plans
  - ☑️ Customers can update payment method
  - ☑️ Customers can cancel subscriptions
  - ☑️ Customers can view invoice history
- **Products** → voeg je 3 Willoe products toe zodat ze kunnen wisselen
- Save

## 4. Setup webhook endpoint (3 min — pas na deploy)

**Vóór deploy:** test lokaal met Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3001/api/stripe/webhook
```
→ Het toont een `whsec_xxx` signing secret. Plak in `.env.local` als `STRIPE_WEBHOOK_SECRET`.

**Na deploy naar willoe.com:**
1. [dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks) → **+ Add endpoint**
2. URL: `https://willoe.com/api/stripe/webhook`
3. Events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Add endpoint → kopieer **Signing secret** (`whsec_xxx`)
5. Vercel → Project → Settings → Environment Variables → `STRIPE_WEBHOOK_SECRET=whsec_xxx`
6. Redeploy

## 5. Test end-to-end (3 min)

1. Open je deployed willoe.com
2. Maak nieuwe account met andere email
3. Maak een agency aan in onboarding
4. Ga naar `/portal/settings` → tab **Abonnement**
5. Klik **Kies Pro** → krijgt Stripe Checkout
6. Vul Stripe test kaart `4242 4242 4242 4242` (vervaldatum elke toekomst, CVC 123)
7. Submit → wordt teruggebracht naar `/portal/settings?upgraded=1`
8. Check in DB: `agency.plan = 'pro'`, `agency.status = 'active'`
9. Trial banner verdwijnt

## 6. Naar Live Mode (later)

Wanneer je echte klanten gaat aannemen:
1. Voltooi Stripe Activate Account (KvK, IBAN, ID verificatie)
2. Repeat stappen 1-4 in **live** mode (`dashboard.stripe.com/products` zonder `/test/`)
3. Update env vars naar `sk_live_...` + `pk_live_...` + nieuwe live `whsec_...`
4. Update `STRIPE_PRICE_*` met live Price IDs

---

## 💰 Pricing strategie tips

- **14-dagen trial** (default, in code) — geen credit card upfront = lagere drempel
- **Annual discount** later: maak nieuwe Price met yearly billing -20%
- **Founding customers**: gebruik **promo codes** in Customer Portal (al ondersteund — `allow_promotion_codes: true` staat aan in checkout)

---

## 🆘 Veelvoorkomende issues

**"No such price"** in Stripe error
→ Price ID is van test mode maar je gebruikt live keys (of vice versa). Check dat je in juiste mode zit.

**Webhook niet ontvangen**
→ Webhook URL moet HTTPS zijn — werkt niet op localhost zonder Stripe CLI tunnel.

**Trial banner verschijnt nog na upgrade**
→ Hard refresh — Next.js cache. Of check of webhook `customer.subscription.updated` is binnengekomen in Stripe Dashboard.
