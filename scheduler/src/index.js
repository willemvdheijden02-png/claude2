/**
 * Livoa Scheduler — 24/7 op Railway
 * Alle geautomatiseerde taken zodat de laptop dicht mag.
 */

const express = require('express');
const cron = require('node-cron');

const TZ = 'Europe/Amsterdam';

// ─── Task imports ────────────────────────────────────────────────────────────
const metaSync       = require('./tasks/meta-sync');
const financialDaily = require('./tasks/financial-daily');
const pixelHealth    = require('./tasks/pixel-health');
const inventoryAlerts= require('./tasks/inventory-alerts');
const reviewRequests = require('./tasks/review-requests');
const kpiWeekly      = require('./tasks/kpi-weekly');
const hookGenerator  = require('./tasks/hook-generator');
const adCopyWeekly   = require('./tasks/ad-copy-weekly');
const notionLog      = require('./tasks/notion-log');

// ─── Health check server ─────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()), tasks: TASKS.map(t => t.name) });
});

app.get('/', (req, res) => {
  res.json({ service: 'Livoa Scheduler', tasks: TASKS.length });
});

// ─── Schedule definitie ───────────────────────────────────────────────────────
const TASKS = [
  // ── Dagelijks ─────────────────────────────────────────────────────────────
  { name: 'meta-sync',          cron: '0 7 * * *',   fn: metaSync },
  { name: 'pixel-health',       cron: '7 7 * * *',   fn: pixelHealth },
  { name: 'financial-daily',    cron: '30 7 * * *',  fn: financialDaily },
  { name: 'inventory-alerts',   cron: '0 9 * * *',   fn: inventoryAlerts },
  { name: 'review-requests',    cron: '6 10 * * *',  fn: reviewRequests },
  { name: 'notion-log',         cron: '0 20 * * *',  fn: notionLog },

  // ── Elke maandag ──────────────────────────────────────────────────────────
  { name: 'kpi-weekly',         cron: '2 8 * * 1',   fn: kpiWeekly },
  { name: 'hook-generator',     cron: '8 8 * * 1',   fn: hookGenerator },
  { name: 'ad-copy-weekly',     cron: '23 8 * * 1',  fn: adCopyWeekly },
];

// ─── Scheduler opstarten ──────────────────────────────────────────────────────
function log(name, msg) {
  console.log(`[${new Date().toISOString()}] [${name}] ${msg}`);
}

TASKS.forEach(({ name, cron: schedule, fn }) => {
  cron.schedule(schedule, async () => {
    log(name, 'gestart');
    try {
      await fn();
      log(name, '✅ klaar');
    } catch (err) {
      log(name, `❌ FOUT: ${err.message}`);
      // Stuur fout-email als Resend beschikbaar
      try {
        const { sendEmail } = require('./lib/email');
        await sendEmail({
          subject: `❌ Taak mislukt: ${name}`,
          text: `Fout bij uitvoeren van "${name}":\n\n${err.message}\n\n${err.stack || ''}`,
        });
      } catch { /* email ook kapot — negeer */ }
    }
  }, { timezone: TZ });
  log(name, `ingepland: ${schedule} (${TZ})`);
});

// ─── Server starten ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Livoa Scheduler draait op poort ${PORT}`);
  console.log(`📅 ${TASKS.length} taken ingepland (timezone: ${TZ})`);
  console.log(`🔗 Health check: GET /health\n`);
});
