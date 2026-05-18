const axios = require('axios');

const TOKEN = process.env.META_ACCESS_TOKEN ||
  'EAASnDZCo5kvYBRTNwzASZAiTzi5ZCt1svkpNF0ZCio1nXAZA9mv5LsoWXLjDFTThTFsNK6TeDtMX1cmKYXooPHDGPbmf6eTuNe8auS2bTZBDbXWgt1b4SlHrvWEI7qnhlI5VZB1Tvfj7wAADb1RFyaJbxQuvmAhRikIH7xdWp1OVy06gue0jiXRVGXjEOrK';

const ACCOUNT_BH  = process.env.META_ACCOUNT_BH  || 'act_664527626124737';
const ACCOUNT_KUSSENS = process.env.META_ACCOUNT_KUSSENS || 'act_1386801278973994';
const BASE = 'https://graph.facebook.com/v19.0';

async function getInsights(accountId, params = {}) {
  try {
    const { data } = await axios.get(`${BASE}/${accountId}/insights`, {
      params: { access_token: TOKEN, ...params },
    });
    return data.data || [];
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    if (msg.includes('190') || msg.toLowerCase().includes('expired')) {
      throw new Error('⚠️ Meta token verlopen — ga naar developers.facebook.com/tools/explorer');
    }
    throw new Error(`Meta API: ${msg}`);
  }
}

// Spend van gisteren op account-niveau
async function getYesterdaySpend(accountId) {
  const rows = await getInsights(accountId, {
    fields: 'spend',
    date_preset: 'yesterday',
    level: 'account',
  });
  return parseFloat(rows[0]?.spend || '0');
}

// Spend van gisteren per campagne
async function getYesterdaySpendByCampaign(accountId) {
  const rows = await getInsights(accountId, {
    fields: 'campaign_name,spend,actions,action_values,impressions,clicks',
    date_preset: 'yesterday',
    level: 'campaign',
    time_increment: 1,
  });
  return rows.map(r => ({
    campaign: r.campaign_name,
    spend: parseFloat(r.spend || '0'),
    impressions: parseInt(r.impressions || '0'),
    clicks: parseInt(r.clicks || '0'),
    purchases: (r.actions || []).find(a => a.action_type === 'purchase')?.value || 0,
    revenue: parseFloat((r.action_values || []).find(a => a.action_type === 'purchase')?.value || '0'),
  }));
}

// Pixel event health check
async function getPixelHealth(pixelId) {
  try {
    const { data } = await axios.get(`${BASE}/${pixelId}/stats`, {
      params: { access_token: TOKEN, start_time: Math.floor((Date.now() - 86400000) / 1000) },
    });
    return data;
  } catch {
    return null;
  }
}

module.exports = { getYesterdaySpend, getYesterdaySpendByCampaign, getPixelHealth, ACCOUNT_BH, ACCOUNT_KUSSENS };
