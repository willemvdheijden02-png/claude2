import Link from "next/link";
import { ArrowRight, Bot, FileText, GaugeCircle, Inbox, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrowserFrame } from "@/components/marketing/browser-frame";
import { QueueMockup } from "@/components/marketing/queue-mockup";
import { PortalMockup } from "@/components/marketing/portal-mockup";
import { StudioMockup } from "@/components/marketing/studio-mockup";
import { LogoCloud } from "@/components/marketing/logo-cloud";

const features = [
  {
    icon: Inbox,
    title: "Service-aanvragen wachtrij",
    description: "Agencies vragen services aan, jij draait skills lokaal in Claude Code, output landt automatisch in het portal.",
  },
  {
    icon: GaugeCircle,
    title: "Live KPI-dashboards",
    description: "Meta + Google Ads data per klant. Spend, ROAS, CPA — dagelijks ververst, geen handmatige rapportages.",
  },
  {
    icon: Sparkles,
    title: "Skill-catalogus",
    description: "Audit, creative, SEO, strategie. Agencies activeren wat ze nodig hebben, jij levert.",
  },
  {
    icon: FileText,
    title: "Rapport-archief",
    description: "Elk geleverd PDF op één plek. Gebrand met logo en kleuren van de agency, niet van Willoe.",
  },
  {
    icon: Layers,
    title: "Strikt gescheiden per agency",
    description: "Postgres Row Level Security. Agencies zien alleen hun eigen klanten — volledig geïsoleerd.",
  },
  {
    icon: Bot,
    title: "Willoe Studio",
    description: "Chat-interface voor ad-beelden, scripts en video-ideeën. Bring your own CapCut — wij maken alles wat erin gaat.",
  },
];

export default function Home() {
  return (
    <main className="flex-1 relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--accent-glow), transparent 70%)",
          opacity: 0.6,
        }}
      />

      {/* Topbar */}
      <header className="border-b border-[var(--border-default)] sticky top-0 z-50 backdrop-blur-md bg-[rgb(10_10_10/0.7)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-[var(--accent-500)] grid place-items-center">
              <span className="text-white text-sm font-semibold">W</span>
            </div>
            <span className="font-medium tracking-display">willoe</span>
          </div>
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Cockpit</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/portal">Portal</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#features">Features</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/portal">
                Open dashboard
                <ArrowRight />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        <Badge tone="accent" className="mb-6">
          <span className="size-1.5 rounded-full bg-[var(--accent-500)] mr-1.5" />
          Nu in private beta
        </Badge>
        <h1 className="text-[clamp(2.25rem,6vw,4rem)] font-medium tracking-display leading-[1.05] max-w-4xl mx-auto">
          Het besturingssysteem
          <br />
          <span className="text-[var(--text-tertiary)]">voor moderne ad-agencies.</span>
        </h1>
        <p className="mt-6 text-[var(--text-md)] text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
          Onboard klanten binnen 24 uur. Lever gebrande rapporten. Draai AI-skills op aanvraag.
          Gebouwd voor kleine agencies die willen werken als grote.
        </p>
        <div className="mt-9 flex items-center justify-center gap-2">
          <Button size="lg" asChild>
            <Link href="/login">
              Start gratis proefperiode
              <ArrowRight />
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="#preview">Bekijk de preview</Link>
          </Button>
        </div>
      </section>

      {/* Hero product mockup */}
      <section id="preview" className="relative max-w-6xl mx-auto px-6 pb-24">
        <BrowserFrame url="willoe.com/admin/queue">
          <QueueMockup />
        </BrowserFrame>
        <p className="text-center mt-6 text-[var(--text-xs)] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
          Operator cockpit &middot; één plek voor alle agencies en hun klanten
        </p>
      </section>

      {/* Logo cloud */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-[var(--border-default)]">
        <p className="text-center text-[var(--text-xs)] uppercase tracking-[0.12em] text-[var(--text-tertiary)] mb-8">
          Vertrouwd door ambitieuze agencies
        </p>
        <LogoCloud />
      </section>

      {/* Features grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-[var(--border-default)]">
        <div className="max-w-2xl mb-12">
          <Badge>Platform</Badge>
          <h2 className="mt-4 text-[var(--text-2xl)] font-medium tracking-display">
            Alles wat een agency nodig heeft.
            <br />
            <span className="text-[var(--text-tertiary)]">Niets meer.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card key={feat.title} className="group">
                <CardHeader>
                  <div className="size-9 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] grid place-items-center mb-2 group-hover:bg-[var(--accent-glow)] transition-colors">
                    <Icon className="size-[18px] text-[var(--text-secondary)] group-hover:text-[var(--accent-500)] transition-colors" />
                  </div>
                  <CardTitle>{feat.title}</CardTitle>
                  <CardDescription>{feat.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Studio showcase */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-[var(--border-default)]">
        <div className="text-center mb-12">
          <Badge>Willoe Studio</Badge>
          <h2 className="mt-4 text-[var(--text-2xl)] font-medium tracking-display">
            Beelden en scripts in dezelfde chat.
            <br />
            <span className="text-[var(--text-tertiary)]">Bring your own CapCut.</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Eén chat-interface voor ad-beelden, scripts en video-ideeën — getuned op je brand DNA.
            Geen logge video-editor; je gemonteerde edits blijf je in CapCut doen.
          </p>
        </div>
        <BrowserFrame url="willoe.com/portal/studio" className="max-w-5xl mx-auto">
          <StudioMockup />
        </BrowserFrame>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-10">
          {[
            {
              title: "Beelden",
              desc: "Gemini, Imagen of Flux — 4-12 ad-formaten in één run, brand-consistent.",
            },
            {
              title: "Scripts",
              desc: "Hook–Pain–Proof–CTA. Optioneel met TTS voiceover via ElevenLabs.",
            },
            {
              title: "Video-ideeën",
              desc: "Pitch-grade concepten met scènes, props en doelgroep-rationale.",
            },
          ].map((m) => (
            <div key={m.title} className="text-center">
              <div className="font-medium text-[var(--text-primary)] mb-1.5">{m.title}</div>
              <div className="text-[var(--text-sm)] text-[var(--text-secondary)] leading-relaxed">
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Second showcase: Agency portal */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-[var(--border-default)]">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-center">
          <div>
            <Badge>Agency portal</Badge>
            <h2 className="mt-4 text-[var(--text-2xl)] font-medium tracking-display leading-tight">
              Eén skill-catalogus.
              <br />
              <span className="text-[var(--text-tertiary)]">80+ services activeerbaar.</span>
            </h2>
            <p className="mt-4 text-[var(--text-secondary)] leading-relaxed max-w-md">
              Iedere agency krijgt een eigen, gebrand portal. Klanten beheren, services activeren,
              KPIs monitoren en rapporten downloaden — strikt gescheiden van andere agencies.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "Logo en kleuren van de agency, niet van Willoe",
                "Eigen klanten zichtbaar, andere agencies onbereikbaar",
                "Skill-aanvragen direct in de queue van de operator",
                "Rapporten archief blijft levenslang beschikbaar",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-[var(--text-secondary)] text-sm">
                  <div className="size-4 rounded-full bg-[var(--accent-glow)] grid place-items-center mt-0.5 shrink-0">
                    <div className="size-1.5 rounded-full bg-[var(--accent-500)]" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <BrowserFrame url="willoe.com/portal/services" className="lg:scale-[1.02]">
            <PortalMockup />
          </BrowserFrame>
        </div>
      </section>

      {/* Stats strip */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-[var(--border-default)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "80+", label: "AI-skills" },
            { value: "24u", label: "Onboarding turnaround" },
            { value: "10×", label: "Sneller dan handmatig" },
            { value: "100%", label: "White-label" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-[var(--text-3xl)] font-medium tracking-display tabular text-[var(--text-primary)]">
                {s.value}
              </div>
              <div className="text-[var(--text-xs)] uppercase tracking-[0.08em] text-[var(--text-tertiary)] mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-[var(--border-default)]">
        <Card className="p-12 text-center bg-[var(--bg-surface-2)] relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center top, var(--accent-glow), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="text-[var(--text-2xl)] font-medium tracking-display">
              Klaar om een écht agency-bedrijf te bouwen?
            </h2>
            <p className="mt-3 text-[var(--text-secondary)] max-w-md mx-auto">
              Beperkt aantal plekken in private beta. We onboarden 10 agencies dit kwartaal.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/login">
                Vraag toegang aan
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[var(--text-xs)] text-[var(--text-tertiary)]">
          <span>© 2026 Willoe. Gebouwd in Amsterdam.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[var(--text-primary)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)]">Voorwaarden</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
