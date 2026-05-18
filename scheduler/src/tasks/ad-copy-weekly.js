// Wekelijkse ad copy — 3 varianten voor het beste product van de week
const { ask } = require('../lib/claude');
const { sendEmail } = require('../lib/email');

module.exports = async function adCopyWeekly() {
  // Vraag Claude om beste product van deze week + copy te schrijven
  // (zonder live data — basis op doelgroep kennis en vaste producten)
  const copy = await ask(
    `Schrijf 3 kant-en-klare Facebook advertentievarianten voor Livoa.

Kies het product waarvoor je de sterkste copy kunt schrijven op basis van de doelgroep:
vrouwen 40-65, die slecht slapen (kussen) OF een BH zoeken die past na lichaamsverandering.

Per variant:
Hook: [eerste zin / eerste 3 seconden]
Body: [2-3 zinnen]
Social proof: [1 korte zin met review of bewijs]
CTA: [1 zachte actiezin]
Format advies: [statisch / video / carousel + korte reden]

Regels:
- Hook begint NOOIT met het merk
- Geen 'revolutionair', 'uniek', 'baanbrekend'
- Gebruik: 'eindelijk', 'na jaren', 'ik herkende mezelf'
- Kussens: niet Derila-stijl, geen 70% korting trucjes
- BH: niet seksueel, niet medisch, niet generiek`,
    { maxTokens: 2000 }
  );

  const week = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  await sendEmail({
    subject: `✍️ 3 Ad Varianten — Week van ${week}`,
    text: copy,
  });
};
