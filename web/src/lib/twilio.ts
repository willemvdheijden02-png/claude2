/**
 * Twilio WhatsApp — stuurt alerts naar Willem's nummer.
 * Vereiste env vars:
 *   TWILIO_ACCOUNT_SID   — Account SID van console.twilio.com
 *   TWILIO_AUTH_TOKEN    — Auth Token van console.twilio.com
 *   TWILIO_WHATSAPP_FROM — bv "whatsapp:+14155238886" (Twilio sandbox) of jouw eigen nummer
 *   TWILIO_WHATSAPP_TO    — jouw WhatsApp nummer bv "whatsapp:+31646876626"
 */

import { env } from "@/lib/env";

export async function sendWhatsApp(message: string): Promise<void> {
  const accountSid = env("TWILIO_ACCOUNT_SID");
  const authToken  = env("TWILIO_AUTH_TOKEN");
  const from       = env("TWILIO_WHATSAPP_FROM");
  const to         = env("TWILIO_WHATSAPP_TO");

  if (!accountSid || !authToken || !from || !to) {
    // Niet geconfigureerd — log naar console zodat het op Railway zichtbaar is
    console.warn("[Twilio] WhatsApp niet geconfigureerd. Bericht gemist:", message);
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const body = new URLSearchParams({
    From: from,
    To:   to,
    Body: message,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Twilio] WhatsApp versturen mislukt:", res.status, text);
  } else {
    console.log("[Twilio] WhatsApp verzonden:", message.slice(0, 60) + "...");
  }
}
