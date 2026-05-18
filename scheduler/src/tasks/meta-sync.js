// Dagelijkse Meta spend sync + COGS — stuurt een samenvattingsemail
const { getYesterdaySpendByCampaign, ACCOUNT_BH, ACCOUNT_KUSSENS } = require('../lib/meta');
const { getOrdersYesterday, yesterday } = require('../lib/shopify');
const { sendEmail } = require('../lib/email');

module.exports = async function metaSync() {
  const { date } = yesterday();

  const [campaignsBh, campaignsKussens, orders] = await Promise.all([
    getYesterdaySpendByCampaign(ACCOUNT_BH),
    getYesterdaySpendByCampaign(ACCOUNT_KUSSENS),
    getOrdersYesterday(),
  ]);

  const allCampaigns = [
    ...campaignsBh.map(c => ({ ...c, account: 'BH/Lingerie' })),
    ...campaignsKussens.map(c => ({ ...c, account: 'Kussens' })),
  ].sort((a, b) => b.spend - a.spend);

  const totalSpend = allCampaigns.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
  const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '—';

  const lines = [
    `📊 Meta Ads Dagrapport — ${date}`,
    ``,
    `💶 Totaal spend: €${totalSpend.toFixed(2)}`,
    `💰 Shopify omzet: €${totalRevenue.toFixed(2)}`,
    `📈 ROAS: ${roas}x`,
    `🛒 Orders: ${orders.length}`,
    ``,
    `TOP CAMPAGNES:`,
    ...allCampaigns.slice(0, 10).map(c =>
      `  [${c.account}] ${c.campaign}: €${c.spend.toFixed(2)} spend | ${c.purchases} aankopen | €${c.revenue.toFixed(2)} omzet`
    ),
  ];

  await sendEmail({
    subject: `📊 Meta Ads ${date} — €${totalSpend.toFixed(0)} spend | ROAS ${roas}x`,
    text: lines.join('\n'),
  });
};
