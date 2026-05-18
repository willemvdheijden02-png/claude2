// Wekelijks KPI dashboard — Meta + Shopify → Claude analyse → email
const { getYesterdaySpendByCampaign, ACCOUNT_BH, ACCOUNT_KUSSENS } = require('../lib/meta');
const { ask } = require('../lib/claude');
const { sendEmail } = require('../lib/email');
const axios = require('axios');

module.exports = async function kpiWeekly() {
  const TOKEN = process.env.META_ACCESS_TOKEN ||
    'EAASnDZCo5kvYBRTNwzASZAiTzi5ZCt1svkpNF0ZCio1nXAZA9mv5LsoWXLjDFTThTFsNK6TeDtMX1cmKYXooPHDGPbmf6eTuNe8auS2bTZBDbXWgt1b4SlHrvWEI7qnhlI5VZB1Tvfj7wAADb1RFyaJbxQuvmAhRikIH7xdWp1OVy06gue0jiXRVGXjEOrK';

  // Haal afgelopen 7 dagen op
  async function getWeekInsights(accountId) {
    const { data } = await axios.get(
      `https://graph.facebook.com/v19.0/${accountId}/insights`,
      {
        params: {
          access_token: TOKEN,
          fields: 'campaign_name,spend,impressions,clicks,actions,action_values',
          date_preset: 'last_7d',
          level: 'campaign',
        },
      }
    );
    return data.data || [];
  }

  const [bhCampaigns, kussensCampaigns] = await Promise.all([
    getWeekInsights(ACCOUNT_BH),
    getWeekInsights(ACCOUNT_KUSSENS),
  ]);

  const toSummary = (rows, name) => {
    const totalSpend = rows.reduce((s, r) => s + parseFloat(r.spend || 0), 0);
    const totalPurchases = rows.reduce((s, r) => {
      const p = (r.actions || []).find(a => a.action_type === 'purchase');
      return s + parseFloat(p?.value || 0);
    }, 0);
    const totalRevenue = rows.reduce((s, r) => {
      const p = (r.action_values || []).find(a => a.action_type === 'purchase');
      return s + parseFloat(p?.value || 0);
    }, 0);
    return { name, totalSpend, totalPurchases, totalRevenue, roas: totalSpend > 0 ? totalRevenue / totalSpend : 0 };
  };

  const bh = toSummary(bhCampaigns, 'BH/Lingerie');
  const kussens = toSummary(kussensCampaigns, 'Kussens');

  const dataText = `
AFGELOPEN 7 DAGEN META ADS RESULTATEN:

${bh.name}:
- Ad spend: €${bh.totalSpend.toFixed(2)}
- Aankopen: ${bh.totalPurchases}
- Omzet: €${bh.totalRevenue.toFixed(2)}
- ROAS: ${bh.roas.toFixed(2)}x

${kussens.name}:
- Ad spend: €${kussens.totalSpend.toFixed(2)}
- Aankopen: ${kussens.totalPurchases}
- Omzet: €${kussens.totalRevenue.toFixed(2)}
- ROAS: ${kussens.roas.toFixed(2)}x

Top BH campagnes:
${bhCampaigns.slice(0, 5).map(c => `- ${c.campaign_name}: €${parseFloat(c.spend).toFixed(2)} spend`).join('\n')}

Top Kussen campagnes:
${kussensCampaigns.slice(0, 5).map(c => `- ${c.campaign_name}: €${parseFloat(c.spend).toFixed(2)} spend`).join('\n')}
`.trim();

  const analyse = await ask(dataText, {
    system: `Je bent een directe marketing analyst voor Livoa (BH's en kussens, doelgroep vrouwen 40-65+).
Analyseer de Meta Ads data van afgelopen week. Geef:
1. 3-5 bullets met wat goed gaat
2. 3-5 bullets met wat beter kan
3. Exact 1 prioriteit voor deze week
4. Budget advies (verhogen/verlagen/gelijk)
Wees direct en concreet. Geen fluff. Max 300 woorden.`,
    maxTokens: 1000,
  });

  await sendEmail({
    subject: `📊 Wekelijks KPI — ROAS BH ${bh.roas.toFixed(1)}x | Kussens ${kussens.roas.toFixed(1)}x`,
    text: `${dataText}\n\n---\nANALYSE:\n${analyse}`,
  });
};
