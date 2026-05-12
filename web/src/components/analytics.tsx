"use client";

import Script from "next/script";

/**
 * Privacy-friendly analytics. Activeert alleen als NEXT_PUBLIC_PLAUSIBLE_DOMAIN is gezet.
 *
 * Setup:
 * 1. plausible.io → Sign up → Add site → kies willoe.com
 * 2. Plak in .env.local: NEXT_PUBLIC_PLAUSIBLE_DOMAIN=willoe.com
 * 3. Refresh — automatisch tracking, GDPR-compliant, geen cookies nodig
 *
 * Alternatief: gebruik PostHog door deze file aan te passen.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
