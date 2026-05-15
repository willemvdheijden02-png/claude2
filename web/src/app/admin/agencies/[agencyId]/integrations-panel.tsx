"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, ChevronUp, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { adminSaveIntegration, adminDeleteIntegration } from "./actions";
import type { IntegrationProvider } from "@/lib/agency-keys";

type IntegrationRow = {
  provider: string;
  status: string;
  lastVerifiedAt: Date | null;
  lastError: string | null;
  credentials: Record<string, string>;
};

// Welke velden heeft elke provider?
const PROVIDER_FIELDS: Record<IntegrationProvider, { key: string; label: string; placeholder: string; secret?: boolean }[]> = {
  meta: [
    { key: "access_token", label: "Access Token", placeholder: "EAAxxxxx...", secret: true },
  ],
  google_ads: [
    { key: "developer_token", label: "Developer Token", placeholder: "abc123...", secret: true },
    { key: "customer_id", label: "Customer ID (optioneel)", placeholder: "123-456-7890" },
  ],
  anthropic: [
    { key: "api_key", label: "API Key", placeholder: "sk-ant-...", secret: true },
  ],
  gemini: [
    { key: "api_key", label: "API Key", placeholder: "AIzaSy...", secret: true },
  ],
  stripe: [
    { key: "secret_key", label: "Secret Key", placeholder: "sk_live_...", secret: true },
  ],
  resend: [
    { key: "api_key", label: "API Key", placeholder: "re_...", secret: true },
  ],
};

const PROVIDER_LABELS: Record<IntegrationProvider, string> = {
  meta: "Meta Ads",
  google_ads: "Google Ads",
  anthropic: "Anthropic (Claude)",
  gemini: "Google Gemini",
  stripe: "Stripe",
  resend: "Resend (e-mail)",
};

const ALL_PROVIDERS = Object.keys(PROVIDER_FIELDS) as IntegrationProvider[];

export function IntegrationsPanel({
  agencyId,
  initial,
}: {
  agencyId: string;
  initial: IntegrationRow[];
}) {
  const [rows, setRows] = useState<IntegrationRow[]>(initial);
  const [expanded, setExpanded] = useState<IntegrationProvider | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [feedback, setFeedback] = useState<{ provider: string; ok: boolean; msg: string } | null>(null);

  function getRow(p: IntegrationProvider) {
    return rows.find((r) => r.provider === p);
  }

  function toggle(p: IntegrationProvider) {
    if (expanded === p) {
      setExpanded(null);
      setFields({});
    } else {
      setExpanded(p);
      // Pre-fill non-secret fields
      const existing = getRow(p);
      const prefill: Record<string, string> = {};
      for (const f of PROVIDER_FIELDS[p]) {
        if (!f.secret) prefill[f.key] = existing?.credentials?.[f.key] ?? "";
      }
      setFields(prefill);
      setFeedback(null);
    }
  }

  function handleSave(p: IntegrationProvider) {
    setFeedback(null);
    startSave(async () => {
      const res = await adminSaveIntegration(agencyId, p, fields);
      if (res.error) {
        setFeedback({ provider: p, ok: false, msg: res.error });
      } else {
        setFeedback({ provider: p, ok: true, msg: "Opgeslagen & geverifieerd." });
        setRows((prev) => {
          const existing = prev.find((r) => r.provider === p);
          if (existing) {
            return prev.map((r) =>
              r.provider === p ? { ...r, status: "connected", lastError: null } : r
            );
          }
          return [...prev, { provider: p, status: "connected", lastVerifiedAt: new Date(), lastError: null, credentials: fields }];
        });
        setExpanded(null);
      }
    });
  }

  function handleDelete(p: IntegrationProvider) {
    startDelete(async () => {
      await adminDeleteIntegration(agencyId, p);
      setRows((prev) => prev.filter((r) => r.provider !== p));
      if (expanded === p) setExpanded(null);
    });
  }

  return (
    <div className="space-y-2">
      {ALL_PROVIDERS.map((p) => {
        const row = getRow(p);
        const isOpen = expanded === p;
        const isConnected = row?.status === "connected";
        const isInvalid = row?.status === "invalid";

        return (
          <div
            key={p}
            className={cn(
              "rounded-lg border transition-colors",
              isOpen
                ? "border-[var(--accent-500)]/40 bg-[var(--bg-surface-2)]"
                : "border-[var(--border-default)] bg-[var(--bg-surface-2)]"
            )}
          >
            {/* Header row */}
            <button
              type="button"
              onClick={() => toggle(p)}
              className="w-full flex items-center gap-3 px-4 h-12 text-left"
            >
              <span className="text-[13px] font-medium text-[var(--text-primary)] flex-1">
                {PROVIDER_LABELS[p]}
              </span>
              {row ? (
                <Badge
                  tone={isConnected ? "success" : isInvalid ? "danger" : "neutral"}
                  className="h-[18px] px-1.5 text-[9px]"
                >
                  {isConnected ? "VERBONDEN" : isInvalid ? "ONGELDIG" : "NIET VERBONDEN"}
                </Badge>
              ) : (
                <Badge tone="neutral" className="h-[18px] px-1.5 text-[9px]">
                  NIET INGESTELD
                </Badge>
              )}
              {isOpen ? (
                <ChevronUp className="size-4 text-[var(--text-tertiary)] shrink-0" />
              ) : (
                <ChevronDown className="size-4 text-[var(--text-tertiary)] shrink-0" />
              )}
            </button>

            {/* Expanded form */}
            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-default)]">
                <p className="text-[11px] text-[var(--text-tertiary)] pt-3">
                  {isConnected
                    ? "Vul nieuwe waarden in om de koppeling bij te werken. Laat velden leeg om ze te bewaren."
                    : "Vul de API-gegevens in voor deze agency."}
                </p>

                {PROVIDER_FIELDS[p].map((f) => (
                  <label key={f.key} className="block">
                    <span className="block text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1">
                      {f.label}
                    </span>
                    <input
                      type={f.secret ? "password" : "text"}
                      value={fields[f.key] ?? ""}
                      onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.secret && isConnected ? "••••••••• (laat leeg om te bewaren)" : f.placeholder}
                      className="w-full h-9 px-3 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)] transition-all"
                      autoComplete="off"
                    />
                  </label>
                ))}

                {feedback?.provider === p && (
                  <div
                    className={cn(
                      "p-2.5 rounded-md text-[12px] flex items-center gap-2",
                      feedback.ok
                        ? "bg-[var(--status-success)]/10 text-[var(--status-success)]"
                        : "bg-[var(--status-danger)]/10 text-[var(--status-danger)]"
                    )}
                  >
                    {feedback.ok && <Check className="size-3.5 shrink-0" />}
                    {feedback.msg}
                  </div>
                )}

                {row?.lastError && (
                  <p className="text-[11px] text-[var(--status-danger)]">
                    Laatste fout: {row.lastError}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSave(p)}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="size-3.5 animate-spin" /> : "Opslaan & verifiëren"}
                  </Button>
                  {row && (
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(p)}
                      disabled={deleting}
                    >
                      {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => { setExpanded(null); setFields({}); }}
                  >
                    Annuleren
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
