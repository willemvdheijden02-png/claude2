"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X, Sparkles } from "lucide-react";

const STORAGE_KEY = "willoe.tour.dismissed";

const steps = [
  {
    title: "Welkom bij Willoe 👋",
    body: "Je agency is opgezet. Tijd om je eerste klant toe te voegen.",
    cta: { label: "Voeg klant toe", href: "/portal/clients" },
  },
  {
    title: "Koppel Meta Ads",
    body: "Bij het toevoegen van een klant kun je z'n Meta Ad Account ID invullen — dan zie je live data op het Ads dashboard.",
    cta: { label: "Naar Ads Manager", href: "/portal/ads" },
  },
  {
    title: "Probeer de AI Studio",
    body: "Genereer ad-beelden, scripts, video-ideeën en wekelijkse rapporten met Claude + Gemini. Getuned op jouw brand DNA.",
    cta: { label: "Open Studio", href: "/portal/studio" },
  },
  {
    title: "Maak je eerste factuur",
    body: "Klant betaald? Stuur 'm een Stripe factuur met iDEAL link in 30 seconden.",
    cta: { label: "Naar Facturatie", href: "/portal/billing" },
  },
];

export function FirstRunTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  const current = steps[step];

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[340px] bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent-500)] font-medium">
            <Sparkles className="size-3" />
            Stap {step + 1} van {steps.length}
          </div>
          <button
            onClick={dismiss}
            className="size-6 rounded grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            aria-label="Sluit tour"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <h3 className="text-[15px] font-medium tracking-display mb-1">{current.title}</h3>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">{current.body}</p>
        <div className="flex items-center justify-between gap-2">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-2 h-7 text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Vorige
            </button>
          ) : (
            <button onClick={dismiss} className="px-2 h-7 text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              Skip
            </button>
          )}
          <div className="flex items-center gap-2">
            <Link
              href={current.cta.href}
              onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md bg-[var(--accent-500)] text-white text-[12px] font-medium hover:bg-[var(--accent-600)] transition-colors"
            >
              {current.cta.label}
              <ArrowRight className="size-3.5" />
            </Link>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-3 h-8 text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Volgende
              </button>
            ) : (
              <button
                onClick={dismiss}
                className="px-3 h-8 text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Klaar
              </button>
            )}
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1 rounded-full transition-all ${i === step ? "w-6 bg-[var(--accent-500)]" : "w-1.5 bg-[var(--border-strong)]"}`}
              aria-label={`Ga naar stap ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
