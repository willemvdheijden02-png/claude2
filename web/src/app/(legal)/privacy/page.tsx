import Link from "next/link";

export const metadata = { title: "Privacybeleid — Willoe" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <header className="border-b border-[var(--border-default)]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-[var(--accent-500)] grid place-items-center">
              <span className="text-white text-sm font-semibold">W</span>
            </div>
            <span className="font-medium tracking-display">willoe</span>
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-[36px] font-medium tracking-display leading-tight mb-2">Privacybeleid</h1>
        <p className="text-[var(--text-tertiary)] text-[13px] mb-12">Laatst bijgewerkt: 11 mei 2026 · GDPR-conform</p>

        <div className="prose space-y-8 text-[var(--text-secondary)] leading-relaxed">
          <Section title="Wie zijn we">
            <p>Willoe is een SaaS-platform voor ad-agencies. Verwerkingsverantwoordelijke is Willem van der Heijden, Amsterdam, Nederland.</p>
          </Section>

          <Section title="Welke data verzamelen we">
            <p><strong>Accountgegevens:</strong> email, naam, wachtwoord (gehashed).</p>
            <p><strong>Bedrijfsgegevens:</strong> agency-naam, KvK, BTW-nummer, adres, logo.</p>
            <p><strong>Klantdata:</strong> namen en metadata van eindklanten die agencies invoeren.</p>
            <p><strong>Ads-data:</strong> via OAuth tokens halen we anoniem geaggregeerde campagne-performance data op (spend, ROAS, conversies) van Meta en Google Ads.</p>
            <p><strong>Betaaldata:</strong> via Stripe (PCI-compliant) — wij slaan geen kaartgegevens op.</p>
            <p><strong>Logs:</strong> server logs voor debugging (IP-adres, user-agent, request paths, max 30 dagen bewaard).</p>
          </Section>

          <Section title="Waarom we het verzamelen">
            <p>Account- en bedrijfsdata: om de dienst te kunnen leveren en facturen te maken. Klant- en ads-data: om de agency dashboards te tonen en rapporten te genereren. Logs: voor security monitoring en bugs.</p>
          </Section>

          <Section title="Met wie delen we het">
            <p>We delen data alleen met sub-processors die noodzakelijk zijn voor de dienst:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase</strong> (database hosting, EU servers)</li>
              <li><strong>Vercel</strong> (web hosting, EU edge)</li>
              <li><strong>Stripe</strong> (betalingen, PCI-compliant)</li>
              <li><strong>Anthropic + Google</strong> (AI-modellen voor Studio chats — prompts worden niet bewaard voor training door deze partijen)</li>
              <li><strong>Meta + Google Ads</strong> (alleen voor het ophalen van ads-data van klant-accounts die ze zelf hebben gekoppeld)</li>
              <li><strong>Resend</strong> (email versturen, indien geconfigureerd)</li>
            </ul>
            <p>We verkopen geen data en gebruiken het niet voor advertising-doeleinden.</p>
          </Section>

          <Section title="Hoe lang bewaren we het">
            <p>Account- en bedrijfsdata: zolang je een account hebt + 30 dagen daarna (data-recovery window). Logs: 30 dagen. Facturen: 7 jaar (wettelijke verplichting NL).</p>
          </Section>

          <Section title="Jouw rechten (GDPR)">
            <p>Je hebt het recht om:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Een kopie van je data te krijgen (data-export)</li>
              <li>Onjuiste data te corrigeren</li>
              <li>Je data te laten verwijderen (recht op vergetelheid)</li>
              <li>Bezwaar te maken tegen verwerking</li>
              <li>Een klacht in te dienen bij de Autoriteit Persoonsgegevens</li>
            </ul>
            <p>Verzoeken via email naar privacy@willoe.com — beantwoord binnen 30 dagen.</p>
          </Section>

          <Section title="Cookies">
            <p>We gebruiken alleen functionele cookies (sessie-cookies voor login). Geen tracking, geen advertising cookies. Geen consent banner nodig conform ePrivacy + GDPR.</p>
          </Section>

          <Section title="Security">
            <p>Data wordt versleuteld opgeslagen (at rest) en in transit (TLS 1.3). Row Level Security in onze database zorgt dat agencies elkaars data niet kunnen zien. OAuth tokens worden geëncrypteerd opgeslagen.</p>
          </Section>

          <div className="p-4 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[12px] text-[var(--text-tertiary)]">
            <strong>⚠️ Disclaimer:</strong> Deze tekst is een sjabloon. Laat een privacy-jurist deze nakijken voor je betaalde klanten registreert.
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-default)] flex justify-between text-[12px] text-[var(--text-tertiary)]">
          <Link href="/terms" className="hover:text-[var(--text-primary)]">Voorwaarden</Link>
          <Link href="/" className="hover:text-[var(--text-primary)]">← Terug naar Willoe</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[18px] font-medium tracking-display text-[var(--text-primary)] mb-3">{title}</h2>
      <div className="space-y-3 text-[14px]">{children}</div>
    </section>
  );
}
