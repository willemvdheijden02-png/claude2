"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";

interface Props {
  token: string;
  initial: {
    metaAdAccountId: string;
    googleAdsCustomerId: string;
    websiteUrl: string;
  };
}

export function InstellingenForm({ token, initial }: Props) {
  const [meta, setMeta] = useState(initial.metaAdAccountId);
  const [google, setGoogle] = useState(initial.googleAdsCustomerId);
  const [website, setWebsite] = useState(initial.websiteUrl);
  const [saving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(false);
    setError(null);
    startSaving(async () => {
      const res = await fetch("/api/client/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          metaAdAccountId: meta,
          googleAdsCustomerId: google,
          websiteUrl: website,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Opslaan mislukt.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Meta */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="size-8 rounded-lg bg-[#1877F2] grid place-items-center shrink-0">
            <span className="text-white text-[12px] font-bold">f</span>
          </div>
          <div>
            <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
              Meta Ads
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Facebook &amp; Instagram advertenties
            </p>
          </div>
          {meta && (
            <span
              className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--accent-500) 12%, transparent)",
                color: "var(--accent-500)",
              }}
            >
              VERBONDEN
            </span>
          )}
        </div>
        <label className="block">
          <span
            className="block text-[11px] uppercase tracking-[0.06em] font-medium mb-1.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Ad Account ID
          </span>
          <input
            type="text"
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            placeholder="act_123456789"
            className="w-full h-10 px-3 rounded-lg text-[13px] outline-none transition-all"
            style={{
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent-500)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-default)";
            }}
          />
          <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Vind je account ID in Meta Business Manager → Advertentieaccounts
          </p>
        </label>
      </div>

      {/* Google Ads */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="size-8 rounded-lg bg-white grid place-items-center border shrink-0"
            style={{ borderColor: "var(--border-default)" }}>
            <svg viewBox="0 0 24 24" className="size-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
              Google Ads
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Google zoekmachine advertenties
            </p>
          </div>
          {google && (
            <span
              className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--accent-500) 12%, transparent)",
                color: "var(--accent-500)",
              }}
            >
              VERBONDEN
            </span>
          )}
        </div>
        <label className="block">
          <span
            className="block text-[11px] uppercase tracking-[0.06em] font-medium mb-1.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Customer ID
          </span>
          <input
            type="text"
            value={google}
            onChange={(e) => setGoogle(e.target.value)}
            placeholder="123-456-7890"
            className="w-full h-10 px-3 rounded-lg text-[13px] outline-none transition-all"
            style={{
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent-500)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; }}
          />
          <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Vind je Customer ID rechtsboven in Google Ads
          </p>
        </label>
      </div>

      {/* Website */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <label className="block">
          <span
            className="block text-[13px] font-medium mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Website URL
          </span>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://jouwbedrijf.nl"
            className="w-full h-10 px-3 rounded-lg text-[13px] outline-none transition-all"
            style={{
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent-500)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; }}
          />
        </label>
      </div>

      {error && (
        <p className="text-[12px] text-red-400">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-10 rounded-lg text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
        style={{ background: "var(--accent-500)" }}
      >
        {saving ? (
          <><Loader2 className="size-4 animate-spin" /> Opslaan...</>
        ) : saved ? (
          <><Check className="size-4" /> Opgeslagen!</>
        ) : (
          "Instellingen opslaan"
        )}
      </button>
    </div>
  );
}
