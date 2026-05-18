// Stuur review-verzoek 7 dagen na aankoop via Resend
const { getRecentOrders } = require('../lib/shopify');
const { sendEmail } = require('../lib/email');
const { Resend } = require('resend');

module.exports = async function reviewRequests() {
  const orders = await getRecentOrders(8); // orders van 8 dagen geleden
  const today = new Date();

  // Filter: precies 7 dagen geleden besteld
  const targets = orders.filter(o => {
    const days = Math.round((today - new Date(o.created_at)) / 86400000);
    return days === 7 && o.email;
  });

  if (targets.length === 0) {
    console.log('REVIEW_REQUESTS: geen orders van precies 7 dagen geleden');
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log('REVIEW_REQUESTS: geen RESEND_API_KEY — skip klant emails');
    return;
  }

  const client = new Resend(resendKey);
  let sent = 0;

  for (const order of targets) {
    if (!order.email) continue;
    const firstName = order.billing_address?.first_name || 'daar';
    await client.emails.send({
      from: 'Livoa <noreply@livoa.nl>',
      to: order.email,
      subject: 'Hoe bevalt je aankoop? 🌟',
      html: `
        <p>Hoi ${firstName},</p>
        <p>Je bestelling is al een week onderweg — hoe bevalt het?</p>
        <p>We zijn benieuwd naar jouw ervaring. Laat een review achter en help andere vrouwen de juiste keuze maken:</p>
        <p><a href="${process.env.REVIEW_URL || 'https://livoa.nl/reviews'}" style="background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">⭐ Schrijf een review</a></p>
        <p>Fijne dag!<br>Het Livoa team</p>
      `,
    });
    sent++;
  }

  console.log(`REVIEW_REQUESTS: ${sent} review-verzoeken verzonden`);

  // Intern rapport
  if (sent > 0) {
    await sendEmail({
      subject: `⭐ ${sent} review-verzoeken verzonden`,
      text: `Vandaag zijn er ${sent} review-verzoeken verzonden naar klanten die 7 dagen geleden bestelden:\n\n${targets.map(o => `• ${o.email} (order #${o.id})`).join('\n')}`,
    });
  }
};
