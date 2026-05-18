// Dagelijks Notion logboek — schrijft dagelijkse samenvatting naar Notion
const { getOrdersYesterday, yesterday } = require('../lib/shopify');
const { getYesterdaySpend, ACCOUNT_BH, ACCOUNT_KUSSENS } = require('../lib/meta');
const { createPage } = require('../lib/notion');

const NOTION_DB_ID = process.env.NOTION_LOGBOEK_DB_ID;

module.exports = async function notionLog() {
  if (!NOTION_DB_ID) {
    console.log('NOTION_LOG: NOTION_LOGBOEK_DB_ID niet ingesteld — skip');
    return;
  }

  const { date } = yesterday();
  const [orders, spendBh, spendKussens] = await Promise.allSettled([
    getOrdersYesterday(),
    getYesterdaySpend(ACCOUNT_BH),
    getYesterdaySpend(ACCOUNT_KUSSENS),
  ]);

  const orderList = orders.status === 'fulfilled' ? orders.value : [];
  const revenue = orderList.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
  const spend = (spendBh.status === 'fulfilled' ? spendBh.value : 0) +
                (spendKussens.status === 'fulfilled' ? spendKussens.value : 0);
  const roas = spend > 0 ? (revenue / spend).toFixed(2) : '—';

  const content = [
    `📅 ${date}`,
    `💶 Omzet: €${revenue.toFixed(2)}`,
    `📢 Meta spend: €${spend.toFixed(2)}`,
    `📈 ROAS: ${roas}x`,
    `🛒 Orders: ${orderList.length}`,
    ``,
    `Gegenereerd door Livoa Scheduler om ${new Date().toLocaleTimeString('nl-NL')}`,
  ].join('\n');

  await createPage(NOTION_DB_ID, `Dagrapport ${date}`, content);
  console.log(`NOTION_LOG: dagrapport aangemaakt voor ${date}`);
};
