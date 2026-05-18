// Dagelijkse voorraad check — alert bij lage voorraad
const { getInventory } = require('../lib/shopify');
const { sendEmail } = require('../lib/email');

const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD || '10');

module.exports = async function inventoryAlerts() {
  const items = await getInventory();
  const low = items.filter(i => i.inventory !== null && i.inventory <= LOW_STOCK_THRESHOLD && i.inventory >= 0);
  const out = items.filter(i => i.inventory === 0);

  if (low.length === 0 && out.length === 0) {
    console.log('INVENTORY: alle producten op voorraad');
    return;
  }

  const lines = [`🏪 Voorraad Alert — ${new Date().toLocaleDateString('nl-NL')}`, ''];
  if (out.length > 0) {
    lines.push('🔴 UITVERKOCHT:');
    out.forEach(i => lines.push(`  • ${i.product} (${i.sku || 'no sku'}): 0 stuks`));
    lines.push('');
  }
  if (low.length > 0) {
    lines.push(`🟡 LAAG (≤ ${LOW_STOCK_THRESHOLD} stuks):`);
    low.forEach(i => lines.push(`  • ${i.product} (${i.sku || 'no sku'}): ${i.inventory} stuks`));
  }

  await sendEmail({
    subject: `⚠️ Voorraad alert — ${out.length} uitverkocht, ${low.length - out.length} laag`,
    text: lines.join('\n'),
  });
};
