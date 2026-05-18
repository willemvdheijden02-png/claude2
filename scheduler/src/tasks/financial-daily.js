// Dagelijks financieel rapport: omzet - ad spend - COGS = netto marge + ROAS
const { getOrdersYesterday, yesterday } = require('../lib/shopify');
const { getYesterdaySpend, ACCOUNT_BH, ACCOUNT_KUSSENS } = require('../lib/meta');
const { sendEmail } = require('../lib/email');

// COGS per product (inkoopprijs bij 1 stuk, fallback)
const COGS_MAP = {
  'naadloze gel beha': 8.99, 'comfort draadloze gel beha': 8.40, 'jelly beha': 8.40,
  'push-up bh': 9.90, 'comfortabele push-up': 6.90, 'draadloze vormgevende bh': 8.05,
  'beugel balconette': 10.35, 'rug-corrigerende bh': 9.78, 'sofène jelly bh': 17.91,
  'corrigerende bodysuit': 13.80, 'dagelijkse essentiële bh': 18.27,
  'alledaagse comfortslip': 3.40, 'eindelijk comfortabel': 0,
};

function findCogs(title) {
  const t = title.toLowerCase();
  for (const [key, val] of Object.entries(COGS_MAP)) {
    if (t.includes(key)) return val;
  }
  return null;
}

module.exports = async function financialDaily() {
  const { date } = yesterday();
  const orders = await getOrdersYesterday();

  let revenue = 0, cogs = 0, cogsNotes = [];
  for (const order of orders) {
    revenue += parseFloat(order.total_price || '0');
    for (const item of order.line_items || []) {
      const unitCogs = findCogs(item.title);
      if (unitCogs === null) {
        cogsNotes.push(`⚠️ COGS onbekend: ${item.title}`);
      } else {
        cogs += unitCogs * item.quantity;
      }
    }
  }

  // Meta spend (beide accounts)
  let metaSpend = 0;
  try {
    const [spendBh, spendKussens] = await Promise.all([
      getYesterdaySpend(ACCOUNT_BH),
      getYesterdaySpend(ACCOUNT_KUSSENS),
    ]);
    metaSpend = spendBh + spendKussens;
  } catch (err) {
    cogsNotes.push(`⚠️ Meta spend ophalen mislukt: ${err.message}`);
  }

  const nettomarge = revenue - metaSpend - cogs;
  const roas = metaSpend > 0 ? (revenue / metaSpend).toFixed(2) : '—';
  const nettoRoas = metaSpend > 0 ? (nettomarge / metaSpend).toFixed(2) : '—';
  const margePerc = revenue > 0 ? ((nettomarge / revenue) * 100).toFixed(1) : '—';

  const subject = `💰 ${date} — €${nettomarge.toFixed(0)} netto | ROAS ${roas}x`;
  const lines = [
    `📅 Datum: ${date}`,
    ``,
    `💶 Omzet:      €${revenue.toFixed(2)}`,
    `📢 Meta spend: €${metaSpend.toFixed(2)}`,
    `📦 COGS:       €${cogs.toFixed(2)}`,
    ``,
    `✅ Netto marge:   €${nettomarge.toFixed(2)} (${margePerc}%)`,
    `📊 ROAS:          ${roas}x`,
    `📊 Netto ROAS:    ${nettoRoas}x`,
    `🛒 Orders:        ${orders.length}`,
    ``,
    ...cogsNotes,
  ];

  await sendEmail({ subject, text: lines.join('\n') });
};
