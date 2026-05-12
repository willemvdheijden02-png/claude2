"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { deleteClient } from "./actions";

type Client = {
  id: string;
  displayName: string;
  websiteUrl: string | null;
  status: "new" | "onboarding" | "active" | "paused";
  budgetMonthlyCents: number | null;
  metaAdAccountId: string | null;
  googleAdsCustomerId: string | null;
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
      <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-surface)]">
        <div className="grid grid-cols-[1fr_140px_120px_120px_120px_44px] px-5 h-9 bg-[var(--bg-surface-2)] border-b border-[var(--border-default)] items-center text-[10px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium">
          <div>Klant</div>
          <div>Status</div>
          <div>Budget</div>
          <div className="text-right">Meta</div>
          <div className="text-right">Google Ads</div>
          <div></div>
        </div>
        {clients.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[1fr_140px_120px_120px_120px_44px] px-5 h-14 items-center border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors text-[13px]"
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
