"use client";

import { useEffect, useState } from "react";
import { Download, Share, X, Monitor } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "chrome-desktop" | "safari-desktop" | "other";

export function PwaInstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [visible, setVisible] = useState(false);
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const win = window as Window & { MSStream?: unknown };
    const nav = navigator as Navigator & { standalone?: boolean };

    const ios = /iPad|iPhone|iPod/.test(ua) && !win.MSStream;
    const android = /Android/.test(ua);
    const isChrome = /Chrome/.test(ua) && !/Edg|OPR/.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;

    setIsStandalone(standalone);
    if (standalone) return; // al geïnstalleerd
    if (localStorage.getItem("pwa-dismissed")) return;

    let detected: Platform;
    if (ios) detected = "ios";
    else if (android) detected = "android";
    else if (isChrome) detected = "chrome-desktop";
    else if (isSafari) detected = "safari-desktop";
    else detected = "other";

    setPlatform(detected);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Toon na 3 seconden op elk apparaat
    const t = setTimeout(() => setVisible(true), 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(t);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem("pwa-dismissed", "1");
  }

  async function install() {
    if (installEvent) {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === "accepted") setVisible(false);
      setInstallEvent(null);
      return;
    }
    setGuide(true);
  }

  if (!visible || isStandalone || !platform) return null;

  const subtitle =
    platform === "ios" || platform === "android"
      ? "Installeer als app op je telefoon"
      : "Installeer als app op je computer";

  const btnIcon =
    platform === "ios" ? <Share className="size-3.5" /> :
    installEvent ? <Download className="size-3.5" /> :
    <Monitor className="size-3.5" />;

  const btnLabel = installEvent ? "Installeer" : "Hoe?";

  const guideSteps: Record<Platform, { title: string; steps: string[]; note: string }> = {
    ios: {
      title: "Installeer op iPhone / iPad",
      steps: [
        "Open de pagina in Safari (niet Chrome)",
        `Tik op het Deel-icoon (vak met pijltje omhoog) onderin`,
        `Tik op "Zet op beginscherm" en dan op "Voeg toe"`,
      ],
      note: "Werkt alleen in Safari op iOS.",
    },
    android: {
      title: "Installeer op Android",
      steps: [
        "Open de pagina in Chrome",
        `Tik op de drie puntjes (⋮) rechtsboven`,
        `Tik op "Toevoegen aan startscherm" → "Toevoegen"`,
      ],
      note: "Werkt in Chrome, Edge en Samsung Internet.",
    },
    "chrome-desktop": {
      title: "Installeer in Chrome",
      steps: [
        "Klik op het installeer-icoon (⊕) helemaal rechts in de adresbalk",
        `Klik op "App installeren" in het popup-venster`,
        "De app opent nu als los venster — klaar!",
      ],
      note: "Zie je het icoon niet? Kijk dan rechts naast de adresbalk.",
    },
    "safari-desktop": {
      title: "Installeer in Safari (Mac)",
      steps: [
        "Klik op het Deel-icoon in de menubalk van Safari (vak met pijltje omhoog)",
        `Klik op "Voeg toe aan Dock"`,
        "De app staat nu in je Dock — klaar!",
      ],
      note: "Vereist macOS Sonoma (2023) of nieuwer.",
    },
    other: {
      title: "Installeer als app",
      steps: [
        "Open de pagina in Chrome of Edge",
        "Klik op het installeer-icoon rechts in de adresbalk",
        `Klik op "App installeren" — klaar!`,
      ],
      note: "Beste ervaring in Chrome of Edge.",
    },
  };

  const currentGuide = guideSteps[platform];

  return (
    <>
      {/* Banner */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
          maxWidth: "min(380px, calc(100vw - 32px))",
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
          <div className="text-[11px] text-[var(--text-secondary)]">{subtitle}</div>
        </div>
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-[12px] font-semibold text-white shrink-0"
          style={{ background: "#2563eb" }}
        >
          {btnIcon}
          {btnLabel}
        </button>
        <button
          onClick={dismiss}
          className="size-7 rounded-md grid place-items-center text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-hover)] shrink-0"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Handleiding modal */}
      {guide && (
        <div
          className="fixed inset-0 z-50 bg-black/70 grid place-items-end pb-8 px-4"
          onClick={() => setGuide(false)}
        >
          <div
            className="p-5 rounded-2xl w-full max-w-sm"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-semibold text-[var(--text-primary)]">
                {currentGuide.title}
              </span>
              <button onClick={() => setGuide(false)} className="text-[var(--text-tertiary)]">
                <X className="size-5" />
              </button>
            </div>
            <ol className="space-y-3">
              {currentGuide.steps.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="size-6 rounded-full text-[11px] font-bold grid place-items-center shrink-0 text-white"
                    style={{ background: "#2563eb" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[13px] text-[var(--text-secondary)] leading-snug">{text}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 pt-4 border-t border-[var(--border-default)] text-[11px] text-[var(--text-tertiary)]">
              {currentGuide.note}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
