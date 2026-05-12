"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  updateAgencyBranding,
  updateAgencyBilling,
  type SettingsResult,
} from "./actions";

const tabs = [
  { id: "branding", label: "Branding" },
  { id: "billing", label: "Bedrijfsgegevens" },
  { id: "account", label: "Account" },
  { id: "team", label: "Team" },
  { id: "subscription", label: "Abonnement" },
];

const colorPresets = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

export function SettingsTabs({
  agency,
  user,
}: {
  agency: {
    displayName: string;
    primaryColor: string;
    logoUrl: string | null;
    kvkNumber: string | null;
    vatNumber: string | null;
    vatRate: number;
    billingAddress: { street?: string; city?: string; postalCode?: string; country?: string };
    status: string;
    slug: string;
  };
  user: { email: string; fullName: string };
}) {
  const [active, setActive] = useState("branding");

  return (
    <>
      <div className="flex items-center gap-1 mb-6 border-b border-[var(--border-default)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "px-3 h-10 text-[13px] border-b-2 -mb-px transition-colors whitespace-nowrap",
              active === t.id
                ? "border-[var(--accent-500)] text-[var(--text-primary)] font-medium"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "branding" && <BrandingForm agency={agency} />}
      {active === "billing" && <BillingForm agency={agency} />}
      {active === "account" && <AccountForm user={user} />}
      {active === "team" && <TeamView />}
      {active === "subscription" && <SubscriptionView agency={agency} />}
    </>
  );
}

function BrandingForm({ agency }: { agency: { displayName: string; primaryColor: string; logoUrl: string | null; slug: string } }) {
  const [color, setColor] = useState(agency.primaryColor);
  const [state, formAction, isPending] = useActionState<SettingsResult | null, FormData>(
    updateAgencyBranding,
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[15px]">White-label branding</CardTitle>
        <CardDescription className="text-[12px] mt-0.5">
          Wijzig naam, kleur en logo. Wordt direct toegepast op je portal en gebrand op alle PDF exports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <Field label="Agency naam">
            <input
              name="displayName"
              defaultValue={agency.displayName}
              required
              minLength={2}
              maxLength={60}
              disabled={isPending}
              className={inputCls()}
            />
          </Field>
          <Field label="Subdomein (read-only)">
            <input value={`${agency.slug}.willoe.com`} disabled readOnly className={inputCls() + " font-mono opacity-60"} />
          </Field>
          <Field label="Logo URL (optioneel)">
            <input
              name="logoUrl"
              type="url"
              defaultValue={agency.logoUrl ?? ""}
              placeholder="https://jouwagency.com/logo.png"
              disabled={isPending}
              className={inputCls()}
            />
          </Field>
          <div>
            <div className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-2">
              Hoofd accent kleur
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    disabled={isPending}
                    className="size-7 rounded-md transition-all hover:scale-110"
                    style={{
                      background: c,
                      boxShadow:
                        color === c
                          ? `0 0 0 2px var(--bg-surface), 0 0 0 4px ${c}`
                          : undefined,
                    }}
                  />
                ))}
              </div>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                pattern="#[0-9a-fA-F]{6}"
                className={inputCls() + " font-mono w-[120px]"}
              />
              <input type="hidden" name="primaryColor" value={color} />
            </div>
          </div>

          {state && "error" in state && (
            <div className="p-2.5 rounded-md bg-[rgb(239_68_68/0.08)] border border-[var(--status-danger)]/30 text-[12px] text-[var(--status-danger)]">
              {state.error}
            </div>
          )}
          {state && "success" in state && (
            <div className="p-2.5 rounded-md bg-[rgb(16_185_129/0.08)] border border-[var(--status-success)]/30 text-[12px] text-[var(--status-success)] flex items-center gap-2">
              <Check className="size-3.5" />
              Opgeslagen. Refresh de pagina om de nieuwe branding overal te zien.
            </div>
          )}

          <Button type="submit" size="md" disabled={isPending}>
            {isPending ? <><Loader2 className="animate-spin" /> Opslaan...</> : "Opslaan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function BillingForm({ agency }: { agency: { kvkNumber: string | null; vatNumber: string | null; vatRate: number; billingAddress: { street?: string; city?: string; postalCode?: string; country?: string } } }) {
  const [state, formAction, isPending] = useActionState<SettingsResult | null, FormData>(
    updateAgencyBilling,
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[15px]">Bedrijfsgegevens</CardTitle>
        <CardDescription className="text-[12px] mt-0.5">
          Komen op je facturen te staan. KvK + BTW-nummer verplicht voor BTW-plichtige ondernemers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="KvK-nummer">
              <input
                name="kvkNumber"
                defaultValue={agency.kvkNumber ?? ""}
                placeholder="12345678"
                disabled={isPending}
                className={inputCls() + " font-mono"}
              />
            </Field>
            <Field label="BTW-nummer">
              <input
                name="vatNumber"
                defaultValue={agency.vatNumber ?? ""}
                placeholder="NL123456789B01"
                disabled={isPending}
                className={inputCls() + " font-mono"}
              />
            </Field>
          </div>
          <Field label="BTW-tarief">
            <select name="vatRate" defaultValue={agency.vatRate} disabled={isPending} className={inputCls()}>
              <option value="21">21% — Standaard</option>
              <option value="9">9% — Laag tarief</option>
              <option value="0">0% — KOR (Kleine Ondernemers Regeling)</option>
            </select>
          </Field>

          <div className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] pt-3 border-t border-[var(--border-default)]">
            Vestigingsadres
          </div>
          <Field label="Straat + huisnummer">
            <input
              name="street"
              defaultValue={agency.billingAddress?.street ?? ""}
              placeholder="Voorbeeldlaan 1"
              disabled={isPending}
              className={inputCls()}
            />
          </Field>
          <div className="grid grid-cols-[100px_1fr_100px] gap-3">
            <Field label="Postcode">
              <input
                name="postalCode"
                defaultValue={agency.billingAddress?.postalCode ?? ""}
                placeholder="1000 AA"
                disabled={isPending}
                className={inputCls()}
              />
            </Field>
            <Field label="Stad">
              <input
                name="city"
                defaultValue={agency.billingAddress?.city ?? ""}
                placeholder="Amsterdam"
                disabled={isPending}
                className={inputCls()}
              />
            </Field>
            <Field label="Land">
              <input
                name="country"
                defaultValue={agency.billingAddress?.country ?? "NL"}
                maxLength={2}
                disabled={isPending}
                className={inputCls() + " font-mono uppercase"}
              />
            </Field>
          </div>

          {state && "error" in state && (
            <div className="p-2.5 rounded-md bg-[rgb(239_68_68/0.08)] border border-[var(--status-danger)]/30 text-[12px] text-[var(--status-danger)]">
              {state.error}
            </div>
          )}
          {state && "success" in state && (
            <div className="p-2.5 rounded-md bg-[rgb(16_185_129/0.08)] border border-[var(--status-success)]/30 text-[12px] text-[var(--status-success)] flex items-center gap-2">
              <Check className="size-3.5" />
              Bedrijfsgegevens opgeslagen.
            </div>
          )}

          <Button type="submit" size="md" disabled={isPending}>
            {isPending ? <><Loader2 className="animate-spin" /> Opslaan...</> : "Opslaan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AccountForm({ user }: { user: { email: string; fullName: string } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[15px]">Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Field label="Email"><input value={user.email} readOnly disabled className={inputCls() + " font-mono opacity-60"} /></Field>
        <Field label="Naam"><input value={user.fullName} readOnly disabled className={inputCls() + " opacity-60"} /></Field>
        <Field label="Wachtwoord">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/forgot-password">Wachtwoord wijzigen</Link>
          </Button>
        </Field>
      </CardContent>
    </Card>
  );
}

function TeamView() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-[15px]">Team</CardTitle>
          <CardDescription className="text-[12px] mt-0.5">1 lid — multi-user komt in Pro plan</CardDescription>
        </div>
        <Button size="sm" variant="secondary" disabled>+ Lid toevoegen</Button>
      </CardHeader>
      <CardContent>
        <div className="p-3 rounded-md border border-dashed border-[var(--border-default)] text-[12px] text-[var(--text-tertiary)] text-center">
          Team-leden worden binnenkort ondersteund. Upgrade naar Pro+ wanneer beschikbaar.
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionView({ agency }: { agency: { status: string } }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function checkout(plan: "starter" | "pro" | "scale") {
    setBusy(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Kon checkout niet starten");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Fout");
    } finally {
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Kon portal niet openen");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Fout");
    } finally {
      setBusy(null);
    }
  }

  const plans = [
    { id: "starter" as const, name: "Starter", price: "€99", features: ["5 klanten", "3 onboardings / mnd"] },
    { id: "pro" as const, name: "Pro", price: "€299", features: ["Onbeperkt klanten", "10 onboardings / mnd"], featured: true },
    { id: "scale" as const, name: "Scale", price: "€799", features: ["Onbeperkt onboardings", "Team van 10"] },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[15px]">Huidig abonnement</CardTitle>
            <CardDescription className="text-[12px] mt-0.5">
              Beheer plan, betaalmethode of opzeggen via Stripe.
            </CardDescription>
          </div>
          <Badge tone={agency.status === "active" ? "success" : "warning"}>{agency.status.toUpperCase()}</Badge>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" size="md" onClick={openPortal} disabled={busy !== null}>
            {busy === "portal" ? <><Loader2 className="animate-spin" /> Bezig...</> : "Beheer in Stripe"}
          </Button>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
            Opent het Stripe Customer Portal voor betaalmethode, facturen, upgraden en opzeggen.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[15px]">Upgrade naar een plan</CardTitle>
          <CardDescription className="text-[12px] mt-0.5">
            Maandelijks opzegbaar · iDEAL/kaart · BTW automatisch berekend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`rounded-md border p-4 ${p.featured ? "border-[var(--accent-500)]" : "border-[var(--border-default)]"} bg-[var(--bg-surface-2)]`}
              >
                <div className="text-[14px] font-medium mb-1">{p.name}</div>
                <div className="text-[24px] font-medium tracking-display tabular mb-2">
                  {p.price}<span className="text-[12px] text-[var(--text-tertiary)] ml-0.5">/mnd</span>
                </div>
                <ul className="space-y-1 mb-4">
                  {p.features.map((f) => (
                    <li key={f} className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Check className="size-3 text-[var(--accent-500)]" />{f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant={p.featured ? "primary" : "secondary"}
                  className="w-full"
                  onClick={() => checkout(p.id)}
                  disabled={busy !== null}
                >
                  {busy === p.id ? <><Loader2 className="animate-spin" /> Bezig...</> : `Kies ${p.name}`}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">
        {label}
      </div>
      {children}
    </label>
  );
}

function inputCls() {
  return "w-full h-9 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all disabled:opacity-60";
}
