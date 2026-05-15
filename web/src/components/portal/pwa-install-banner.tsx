"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [visible, setVisible] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsIOS(ios);
    setIsStandalone(standalone);

    if (standalone) return; // already installed
    if (localStorage.getItem("pwa-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS doesn't fire beforeinstallprompt — show manually after delay
    if (ios) {
      setTimeout(() => setVisible(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem("pwa-dismissed", "1");
  }

  async function install() {
    if (isIOS) {
      setIosGuide(true);
      return;
    }
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setInstallEvent(null);
  }

  if (!visible || isStandalone) return null;
  if (!isIOS && !installEvent) return null;

  return (
    <>
      {/* Install banner */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
          maxWidth: "min(360px, calc(100vw - 32px))",
          width: "100%",
          backdropFilter: "blur(12px)",
        }}
      >
        <img
          src="/icons/icon-72x72.png"
          alt="App icon"
          style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
            Agency Dashboard
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">
            Installeer als app op je telefoon
          </div>
        </div>
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-[12px] font-semibold text-white shrink-0"
          style={{ background: "#2563eb" }}
        >
          {isIOS ? <Share className="size-3.5" /> : <Download className="size-3.5" />}
          Installeer
        </button>
        <button
          onClick={dismiss}
          className="size-7 rounded-md grid place-items-center text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-hover)] shrink-0"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* iOS guide modal */}
      {iosGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/70 grid place-items-end pb-8"
          onClick={() => setIosGuide(false)}
        >
          <div
            className="mx-4 p-5 rounded-2xl w-full max-w-sm"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-semibold text-[var(--text-primary)]">
                Installeer op iPhone / iPad
              </span>
              <button onClick={() => setIosGuide(false)} className="text-[var(--text-tertiary)]">
                <X className="size-5" />
              </button>
            </div>
            <ol className="space-y-3">
              {[
                { step: "1", text: "Tik op het Deel-icoon (vak met pijltje omhoog) onder in Safari" },
                { step: "2", text: `Scroll naar beneden en tik op “Zet op beginscherm”` },
                { step: "3", text: `Tik op “Voeg toe” — klaar! De app staat nu op je beginscherm.` },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <span
                    className="size-6 rounded-full text-[11px] font-bold grid place-items-center shrink-0 text-white"
                    style={{ background: "#2563eb" }}
                  >
                    {step}
                  </span>
                  <span className="text-[13px] text-[var(--text-secondary)] leading-snug">{text}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 pt-4 border-t border-[var(--border-default)] text-[11px] text-[var(--text-tertiary)]">
              Werkt alleen in Safari. Niet in Chrome of Firefox.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
