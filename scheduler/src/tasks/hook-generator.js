// Wekelijkse hook generator — 10 nieuwe ad hooks voor kussens en BH
const { ask } = require('../lib/claude');
const { sendEmail } = require('../lib/email');

module.exports = async function hookGenerator() {
  const week = getWeekNumber();
  const hooks = await ask(
    `Genereer 10 nieuwe Facebook/Instagram ad hooks voor Livoa. 5 voor ergonomische slaapkussens, 5 voor BH's.

Doelgroep: vrouwen 40-65 jaar, actief op Facebook/Instagram.

Regels:
- Begin NOOIT met het merk
- Begin ALTIJD met een pijnpunt, herkenbare situatie of vraag
- Max 2 zinnen per hook
- Gebruik hun taalgebruik: 'eindelijk', 'na jaren', 'ik herkende mezelf'
- Geen overdreven claims
- Kussens: focus op nekpijn, niet uitgerust wakker worden, al van alles geprobeerd
- BH's: focus op knellen, niet passen na lichaamsverandering, gevoel niet aangesproken worden

Lever af in dit exact format:

KUSSENS:
1. [hook]
2. [hook]
3. [hook]
4. [hook]
5. [hook]

BH/LINGERIE:
6. [hook]
7. [hook]
8. [hook]
9. [hook]
10. [hook]`,
    { maxTokens: 1500 }
  );

  await sendEmail({
    subject: `🎣 10 Nieuwe Hooks — Week ${week}`,
    text: hooks,
  });
};

function getWeekNumber() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
