import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Pricing — Willoe" };

const plans = [
  {
    name: "Starter",
    price: "€99",
    period: "per maand",
    description: "Voor 1-2 person agencies die net starten",
    features: [
      "Tot 5 klanten",
      "Live Meta Ads dashboard",
      "AI Studio (Beelden, Scripts, Ideeën)",
      "3 onboardings per maand",
      "Stripe facturen (BYOK)",
      "Email support",
    ],
    cta: "Start 14 dagen gratis",
    href: "/signup?plan=starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "€299",
    period: "per maand",
    description: "Voor groeiende agencies — meest gekozen",
    features: [
      "Onbeperkt klanten",
      "Live Meta + Google Ads",
      "Volledige AI Studio + Rapporten",
      "10 onboardings per maand",
      "White-label PDF + portal",
      "Priority support",
      "Stripe + Resend integratie",
    ],
    cta: "Start 14 dagen gratis",
    href: "/signup?plan=pro",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "€799",
    period: "per maand",
    description: "Voor agencies met team en grote volumes",
    features: [
      "Alles uit Pro",
      "Onbeperkt onboardings",
      "Tot 10 team leden",
      "Custom branded domain",
      "Dedicated success manager",
      "SLA garanties",
    ],
    cta: "Start 14 dagen gratis",
    href: "/signup?plan=scale",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      {/* Topbar */}
      <header className="border-b border-[var(--border-default)] sticky top-0 z-50 backdrop-blur-md bg-[rgb(10_10_10/0.7)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-[var(--accent-500)] grid place-items-center">
              <span className="text-white text-sm font-semibold">W</span>
            </div>
            <span className="font-medium tracking-display">willoe</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild><Link href="/#features">Features</Link></Button>
            <Button variant="ghost" size="sm" asChild><Link href="/pricing">Pricing</Link></Button>
            <Button variant="ghost" size="sm" asChild><Link href="/login">Inloggen</Link></Button>
            <Button size="sm" asChild><Link href="/signup">Aan de slag <ArrowRight /></Link></Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge tone="accent" className="mb-6">
            <span className="size-1.5 rounded-full bg-[var(--accent-500)] mr-1.5" />
            14 dagen gratis · geen credit card nodig
          </Badge>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-medium tracking-display leading-[1.05]">
            Pricing die meegroeit met jouw agency
          </h1>
          <p className="mt-6 text-[var(--text-md)] text-[var(--text-secondary)] leading-relaxed">
            Begin klein, upgrade wanneer je groeit. Geen lock-in, opzeggen wanneer je wilt.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-[var(--radius-xl)] border ${p.highlighted ? "border-[var(--accent-500)]" : "border-[var(--border-default)]"} bg-[var(--bg-surface)] p-6 flex flex-col`}
            >
              {p.highlighted && (
                <Badge tone="accent" className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5">
                  Meest gekozen
                </Badge>
              )}
              <div className="mb-6">
                <h3 className="text-[16px] font-medium tracking-display mb-1">{p.name}</h3>
                <p className="text-[12px] text-[var(--text-secondary)] min-h-[36px]">{p.description}</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[40px] font-medium tracking-display tabular leading-none">{p.price}</span>
                  <span className="text-[13px] text-[var(--text-tertiary)]">/{p.period.replace("per ", "")}</span>
                </div>
              </div>
              <Button
                size="md"
                variant={p.highlighted ? "primary" : "secondary"}
                className="w-full mb-6"
                asChild
              >
                <Link href={p.href}>{p.cta}</Link>
              </Button>
              <div className="space-y-2.5 text-[13px]">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="size-4 text-[var(--accent-500)] mt-0.5 shrink-0" />
                    <span className="text-[var(--text-secondary)]">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-24">
          <h2 className="text-[24px] font-medium tracking-display text-center mb-10">Veelgestelde vragen</h2>
          <div className="space-y-6">
            {[
              { q: "Wat zit in de 14-daagse trial?", a: "Alle features van het Pro plan. Geen credit card nodig. Aan het einde kies je een plan of stopt automatisch." },
              { q: "Kan ik tussen plannen wisselen?", a: "Ja, op elk moment. Upgrades zijn direct, downgrades gaan in bij de volgende factuurperiode." },
              { q: "Wat tellen 'onboardings'?", a: "Eén onboarding = het volledige proces om een nieuwe klant op te zetten in Willoe (brand DNA + audit + actieplan). Routine taken zoals rapporten genereren tellen niet mee." },
              { q: "Welke betaalmethoden?", a: "iDEAL, creditcard (Visa/Mastercard), SEPA-incasso. Allemaal via Stripe — veilig en PCI-compliant." },
              { q: "Wat als ik wil opzeggen?", a: "Opzeggen kan op elk moment in je settings. Geen straffen, geen 'belrondes'. Je houdt toegang tot einde van je factuurperiode." },
              { q: "GDPR-compliant?", a: "Ja. EU-gehoste servers (Frankfurt/London), encrypted opslag, en strikt sub-processor management. Volledig privacybeleid op /privacy." },
            ].map((f) => (
              <div key={f.q} className="border-b border-[var(--border-default)] pb-6">
                <h3 className="text-[15px] font-medium mb-2">{f.q}</h3>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 max-w-2xl mx-auto text-center">
          <h2 className="text-[24px] font-medium tracking-display mb-3">Klaar om te beginnen?</h2>
          <p className="text-[var(--text-secondary)] mb-6">14 dagen gratis. Geen credit card. Cancel wanneer je wilt.</p>
          <Button size="lg" asChild>
            <Link href="/signup">Start trial <ArrowRight /></Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-[var(--border-default)] py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[var(--text-xs)] text-[var(--text-tertiary)]">
          <span>© 2026 Willoe. Gebouwd in Amsterdam.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[var(--text-primary)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)]">Voorwaarden</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
