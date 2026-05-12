"use client";

import Script from "next/script";

/**
 * Crisp chat widget loader. Activeert alleen als NEXT_PUBLIC_CRISP_WEBSITE_ID is gezet.
 * Plaats in layout om widget op elke portal pagina te tonen.
 *
 * Hoe te activeren:
 * 1. Maak gratis account op https://crisp.chat
 * 2. Settings → Website Settings → Website ID kopiëren
 * 3. Plak in .env.local als NEXT_PUBLIC_CRISP_WEBSITE_ID=xxxx-xxxx-xxxx
 * 4. Refresh — widget verschijnt rechtsonder
 */
export function CrispWidget() {
  const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
  if (!websiteId) return null;

  return (
    <Script id="crisp-widget" strategy="afterInteractive">
      {`
        window.$crisp=[];window.CRISP_WEBSITE_ID="${websiteId}";
        (function(){
          var d=document; var s=d.createElement("script");
          s.src="https://client.crisp.chat/l.js"; s.async=1;
          d.getElementsByTagName("head")[0].appendChild(s);
        })();
      `}
    </Script>
  );
}
