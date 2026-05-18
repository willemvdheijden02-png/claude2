// Dagelijkse Meta Pixel health check
const axios = require('axios');
const { sendEmail } = require('../lib/email');

const TOKEN = process.env.META_ACCESS_TOKEN ||
  'EAASnDZCo5kvYBRTNwzASZAiTzi5ZCt1svkpNF0ZCio1nXAZA9mv5LsoWXLjDFTThTFsNK6TeDtMX1cmKYXooPHDGPbmf6eTuNe8auS2bTZBDbXWgt1b4SlHrvWEI7qnhlI5VZB1Tvfj7wAADb1RFyaJbxQuvmAhRikIH7xdWp1OVy06gue0jiXRVGXjEOrK';
const PIXEL_IDS = (process.env.META_PIXEL_IDS || '').split(',').filter(Boolean);
const ACCOUNT = process.env.META_ACCOUNT_BH || 'act_664527626124737';

module.exports = async function pixelHealth() {
  if (PIXEL_IDS.length === 0) {
    console.log('PIXEL_HEALTH: geen META_PIXEL_IDS ingesteld — skip');
    return;
  }

  const issues = [];
  for (const pixelId of PIXEL_IDS) {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const since = Math.floor(yesterday.setHours(0, 0, 0, 0) / 1000);
      const until = Math.floor(yesterday / 1000) + 86400;

      const { data } = await axios.get(
        `https://graph.facebook.com/v19.0/${pixelId}/stats`,
        { params: { access_token: TOKEN, start_time: since, end_time: until, aggregation: 'event_name' } }
      );

      const events = data.data || [];
      const purchase = events.find(e => e.event === 'Purchase');
      const viewContent = events.find(e => e.event === 'ViewContent');

      if (!purchase || parseInt(purchase.count) < 1) {
        issues.push(`⚠️ Pixel ${pixelId}: 0 Purchase events gisteren`);
      }
      if (!viewContent) {
        issues.push(`⚠️ Pixel ${pixelId}: geen ViewContent events`);
      }
    } catch (err) {
      issues.push(`❌ Pixel ${pixelId}: ${err.message}`);
    }
  }

  if (issues.length > 0) {
    await sendEmail({
      subject: `🚨 Pixel Health Check — ${issues.length} issue(s) gevonden`,
      text: issues.join('\n'),
    });
  } else {
    console.log('PIXEL_HEALTH: alles OK');
  }
};
