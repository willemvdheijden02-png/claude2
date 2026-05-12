import Link from "next/link";

export const metadata = { title: "Voorwaarden — Willoe" };

export default function TermsPage() {
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
        <h1 className="text-[36px] font-medium tracking-display leading-tight mb-2">Algemene voorwaarden</h1>
        <p className="text-[var(--text-tertiary)] text-[13px] mb-12">Laatst bijgewerkt: 11 mei 2026</p>

        <div className="prose space-y-8 text-[var(--text-secondary)] leading-relaxed">
          <Section title="1. Definities">
            <p><strong>Willoe</strong>: het SaaS-platform aangeboden via willoe.com.</p>
            <p><strong>Agency</strong>: de betalende gebruiker die het platform gebruikt om diensten aan eindklanten te leveren.</p>
            <p><strong>Eindklant</strong>: een klant van een agency wiens data via Willoe wordt verwerkt.</p>
          </Section>

          <Section title="2. Toegang & gebruik">
            <p>De agency krijgt na registratie en betaling toegang tot het platform. Toegang is persoonlijk en niet overdraagbaar. Misbruik (spam, illegale activiteiten, schending van auteursrechten) leidt tot directe opschorting.</p>
          </Section>

          <Section title="3. Betaling & abonnement">
            <p>Abonnementen worden maandelijks of jaarlijks vooraf gefactureerd. Bij wanbetaling wordt toegang opgeschort na 14 dagen. Opzeggen kan op elk moment per einde van de huidige factuurperiode.</p>
          </Section>

          <Section title="4. Data & eigendom">
            <p>Alle data die de agency in het platform invoert (klantgegevens, campagnedata, rapporten) blijft eigendom van de agency. Willoe gebruikt deze data uitsluitend om de dienst te leveren. Bij opzegging kan de agency een data-export aanvragen binnen 30 dagen.</p>
          </Section>

          <Section title="5. Beschikbaarheid">
            <p>Willoe streeft naar 99% uptime maar geeft geen garanties voor 100%. Geplande onderhoudsmomenten worden minimaal 48 uur vooraf aangekondigd.</p>
          </Section>

          <Section title="6. Aansprakelijkheid">
            <p>De aansprakelijkheid van Willoe is beperkt tot het bedrag dat de agency in de afgelopen 6 maanden heeft betaald. Willoe is niet aansprakelijk voor indirecte schade, gederfde winst, of schade aan derden (eindklanten van de agency).</p>
          </Section>

          <Section title="7. Wijzigingen">
            <p>Willoe kan deze voorwaarden wijzigen. Wijzigingen worden 30 dagen vooraf gecommuniceerd per email. Bij ingrijpende wijzigingen mag de agency direct opzeggen zonder kosten.</p>
          </Section>

          <Section title="8. Toepasselijk recht">
            <p>Op deze overeenkomst is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Amsterdam.</p>
          </Section>

          <div className="p-4 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[12px] text-[var(--text-tertiary)]">
            <strong>⚠️ Disclaimer:</strong> Deze tekst is een sjabloon. Laat een Nederlandse jurist deze nakijken voor je betaalde klanten registreert.
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-default)] flex justify-between text-[12px] text-[var(--text-tertiary)]">
          <Link href="/privacy" className="hover:text-[var(--text-primary)]">Privacy</Link>
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
