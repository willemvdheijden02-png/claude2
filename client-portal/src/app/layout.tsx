import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Client Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Client Portal" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
      </head>
      <body>
        {children}

        {/* PWA installeer-banner + service worker */}
        <div
          id="pwa-banner"
          style={{
            display: "none",
            position: "fixed",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1a1a2e",
            border: "1px solid rgba(124,58,237,0.4)",
            borderRadius: "14px",
            padding: "14px 18px",
            zIndex: 9999,
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            maxWidth: "340px",
            width: "calc(100% - 32px)",
          }}
        >
          <img
            src="/icons/icon-72x72.png"
            style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0 }}
            alt=""
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#e2e8f0" }}>Client Portal</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
              Installeer als app op je telefoon
            </div>
          </div>
          <button
            id="pwa-install-btn"
            style={{
              background: "#7c3aed",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Installeer
          </button>
          <button
            id="pwa-close-btn"
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: 1,
              padding: "0 2px",
            }}
          >
            ×
          </button>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  var banner = document.getElementById('pwa-banner');
  var installBtn = document.getElementById('pwa-install-btn');
  var closeBtn = document.getElementById('pwa-close-btn');
  var deferredPrompt = null;
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (isStandalone) return;
  if (localStorage.getItem('pwa-dismissed')) return;

  // Android / Chrome
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(function() { banner.style.display = 'flex'; }, 3000);
  });

  // iOS Safari
  if (isIOS) {
    setTimeout(function() {
      installBtn.textContent = 'Hoe?';
      banner.style.display = 'flex';
    }, 3000);
    installBtn.addEventListener('click', function() {
      alert('Tik op het Deel-icoon onderaan Safari (het vierkantje met pijl omhoog) → "Zet op beginscherm"');
    });
  } else {
    installBtn.addEventListener('click', function() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
        banner.style.display = 'none';
      }
    });
  }

  closeBtn.addEventListener('click', function() {
    banner.style.display = 'none';
    localStorage.setItem('pwa-dismissed', '1');
  });

  // Service Worker registreren
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
})();
            `,
          }}
        />
      </body>
    </html>
  );
}
