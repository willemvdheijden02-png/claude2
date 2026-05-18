const { Resend } = require('resend');

const TO = process.env.REPORT_EMAIL || 'willemvdheijden02@gmail.com';

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY niet ingesteld');
  return new Resend(key);
}

async function sendEmail({ subject, html, text }) {
  const client = getClient();
  const { error } = await client.emails.send({
    from: 'Livoa Scheduler <scheduler@livoa.nl>',
    to: TO,
    subject,
    html: html || `<pre style="font-family:monospace;white-space:pre-wrap">${text}</pre>`,
  });
  if (error) throw new Error(`Resend fout: ${error.message}`);
  console.log(`✉️  Email verzonden: ${subject}`);
}

module.exports = { sendEmail, TO };
