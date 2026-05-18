const axios = require('axios');

function client() {
  const store = process.env.SHOPIFY_STORE_URL;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!store || !token) throw new Error('SHOPIFY_STORE_URL / SHOPIFY_ACCESS_TOKEN niet ingesteld');
  const base = store.startsWith('http') ? store : `https://${store}`;
  return axios.create({
    baseURL: `${base}/admin/api/2024-04`,
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
  });
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.toISOString().split('T')[0];
  return { start: `${y}T00:00:00+02:00`, end: `${y}T23:59:59+02:00`, date: y };
}

async function getOrdersYesterday() {
  const { start, end } = yesterday();
  const c = client();
  const { data } = await c.get('/orders.json', {
    params: {
      status: 'any',
      financial_status: 'paid',
      created_at_min: start,
      created_at_max: end,
      limit: 250,
    },
  });
  return data.orders || [];
}

async function getInventory() {
  const c = client();
  const { data } = await c.get('/products.json', { params: { limit: 250 } });
  const products = data.products || [];
  const items = [];
  for (const p of products) {
    for (const v of p.variants || []) {
      items.push({ product: p.title, sku: v.sku, inventory: v.inventory_quantity });
    }
  }
  return items;
}

async function getRecentOrders(daysAgo = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysAgo);
  const c = client();
  const { data } = await c.get('/orders.json', {
    params: {
      status: 'any',
      financial_status: 'paid',
      created_at_min: cutoff.toISOString(),
      limit: 250,
      fields: 'id,email,created_at,line_items,total_price',
    },
  });
  return data.orders || [];
}

module.exports = { getOrdersYesterday, getInventory, getRecentOrders, yesterday };
