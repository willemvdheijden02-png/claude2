"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Link as LinkIcon, Trash2, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  deleteClient,
  enableClientPortal,
  disableClientPortal,
  resendPortalMagicLink,
} from "./actions";

type Client = {
  id: string;
  displayName: string;
  websiteUrl: string | null;
  status: "new" | "onboarding" | "active" | "paused";
  budgetMonthlyCents: number | null;
  metaAdAccountId: string | null;
  googleAdsCustomerId: string | null;
  portalEnabled: boolean;
  portalToken: string | null;
  portalEmail: string | null;
};

const statusToTone = {
  new: "info",
  onboarding: "warning",
  active: "success",
  paused: "neutral",
} as const;

const statusToLabel = {
  new: "NIEUW",
  onboarding: "ONBOARDING",
  active: "ACTIEF",
  paused: "GEPAUZEERD",
} as const;

function eur(cents: number | null) {
  if (cents === null) return "—";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function ClientsTable({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [portalClient, setPortalClient] = useState<Client | null>(null);

  async function handleDelete(id: string) {
    setDeleting(true);
    const res = await deleteClient(id);
    setDeleting(false);
    if (res.error) {
      alert(res.error);
    } else {
      setConfirmDelete(null);
      router.refresh();
    }
  }

  return (
    <>
      <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-x-auto bg-[var(--bg-surface)]">
        <div className="min-w-[720px]">
        <div className="grid grid-cols-[1fr_120px_110px_70px_90px_90px_44px] px-5 h-9 bg-[var(--bg-surface-2)] border-b border-[var(--border-default)] items-center text-[10px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium">
          <div>Klant</div>
          <div>Status</div>
          <div>Budget</div>
          <div className="text-right">Meta</div>
          <div className="text-right">Google</div>
          <div className="text-right">Portaal</div>
          <div></div>
        </div>
        {clients.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[1fr_120px_110px_70px_90px_90px_44px] px-5 h-14 items-center border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors text-[13px]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-8 rounded-md bg-[var(--bg-surface-2)] grid place-items-center text-[12px] font-medium text-[var(--text-secondary)] shrink-0">
                {c.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[var(--text-primary)] truncate">{c.displayName}</div>
                {c.websiteUrl && (
                  <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1 truncate">
                    {c.websiteUrl.replace(/^https?:\/\//, "")}
                    <ExternalLink className="size-3 shrink-0" />
                  </div>
                )}
              </div>
            </div>
            <Badge tone={statusToTone[c.status]} className="h-[18px] px-1.5 text-[9px] w-fit">
              {statusToLabel[c.status]}
            </Badge>
            <div className="text-[var(--text-secondary)] text-[12px] tabular">
              {c.budgetMonthlyCents !== null ? `${eur(c.budgetMonthlyCents)}/mnd` : "—"}
            </div>
            <div className="text-right text-[12px]">
              {c.metaAdAccountId ? (
                <span className="text-[var(--status-success)]">✓</span>
              ) : (
                <span className="text-[var(--text-tertiary)]">—</span>
              )}
            </div>
            <div className="text-right text-[12px]">
              {c.googleAdsCustomerId ? (
                <span className="text-[var(--status-success)]">✓</span>
              ) : (
                <span className="text-[var(--text-tertiary)]">—</span>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setPortalClient(c); }}
              className="text-[11px] font-medium px-2 h-6 rounded justify-self-end transition-colors flex items-center gap-1"
              style={
                c.portalEnabled
                  ? { background: "var(--accent-glow)", color: "var(--accent-500)" }
                  : { color: "var(--text-tertiary)" }
              }
              title={c.portalEnabled ? "Portaal beheren" : "Portaal inschakelen"}
            >
              <LinkIcon className="size-3" />
              {c.portalEnabled ? "Actief" : "Uit"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(c); }}
              className="size-7 rounded grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--status-danger)] hover:bg-[var(--bg-surface-2)] transition-colors justify-self-end"
              aria-label="Verwijder klant"
              title="Verwijder klant"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        </div>
      </div>

      {portalClient && (
        <PortalDialog
          client={portalClient}
          onClose={() => {
            setPortalClient(null);
            router.refresh();
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[16px] font-medium tracking-display mb-2">Verwijder {confirmDelete.displayName}?</h2>
            <p className="text-[13px] text-[var(--text-secondary)] mb-6">
              Deze actie verwijdert ook alle aanvragen, rapporten en KPI-data van deze klant. Onomkeerbaar.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-3 h-9 rounded-md text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors" disabled={deleting}>
                Annuleren
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deleting}
                className="px-3 h-9 rounded-md bg-[var(--status-danger)] text-white text-[13px] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {deleting ? "Verwijderen..." : "Definitief verwijderen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PortalDialog({ client, onClose }: { client: Client; onClose: () => void }) {
  const [email, setEmail] = useState(client.portalEmail ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalUrl, setPortalUrl] = useState<string | null>(
    client.portalEnabled && client.portalToken
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/c/${client.portalToken}`
      : null
  );
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleEnable(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await enableClientPortal(client.id, email);
    setBusy(false);
    if (res.error) {
      setError(res.error);
    } else {
      setPortalUrl(res.portalUrl ?? null);
      setEmailSent(res.emailSent ?? false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    await disableClientPortal(client.id);
    setBusy(false);
    onClose();
  }

  async function handleResend() {
    setBusy(true);
    const res = await resendPortalMagicLink(client.id);
    setBusy(false);
    setEmailSent(res.emailSent ?? false);
  }

  async function handleCopy() {
    if (!portalUrl) return;
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[16px] font-medium tracking-display mb-1">
          Klantportaal voor {client.displayName}
        </h2>
        <p className="text-[12px] text-[var(--text-tertiary)] mb-5">
          Geef je klant read-only toegang tot rapporten en facturen via een magic-link URL.
        </p>

        {portalUrl ? (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium block mb-1.5">
                Portaal URL
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={portalUrl}
                  className="flex-1 h-9 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[12px] font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="h-9 px-3 rounded-md border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] flex items-center gap-1.5 text-[12px]"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Gekopieerd" : "Kopieer"}
                </button>
              </div>
            </div>

            {emailSent === true && (
              <div className="text-[12px] text-[var(--status-success)]">
                ✓ Magic link gemaild naar {client.portalEmail}
              </div>
            )}
            {emailSent === false && (
              <div className="text-[12px] text-[var(--status-warning)]">
                Email verzenden mislukt. Kopieer de link en stuur 'm zelf.
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
              <button
                onClick={handleDisable}
                disabled={busy}
                className="text-[12px] text-[var(--status-danger)] hover:underline disabled:opacity-50"
              >
                Portaal uitschakelen
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleResend}
                  disabled={busy}
                  className="h-8 px-3 rounded-md border border-[var(--border-default)] text-[12px] hover:bg-[var(--bg-surface-hover)] disabled:opacity-50"
                >
                  Email opnieuw
                </button>
                <button
                  onClick={onClose}
                  className="h-8 px-3 rounded-md bg-[var(--accent-500)] text-white text-[12px]"
                >
                  Klaar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEnable} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium block mb-1.5">
                Email klant
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="klant@bedrijf.nl"
                className="w-full h-9 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] focus:border-[var(--accent-500)] outline-none"
              />
            </div>
            {error && (
              <div className="text-[12px] text-[var(--status-danger)]">{error}</div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-3 rounded-md text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={busy}
                className="h-9 px-4 rounded-md bg-[var(--accent-500)] text-white text-[13px] disabled:opacity-50"
              >
                {busy ? "Activeren..." : "Activeer portaal"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
