"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { markRequestDone, markRequestFailed } from "./actions";

export function QueueRowActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showFailModal, setShowFailModal] = useState(false);
  const [failReason, setFailReason] = useState("");

  function handleDone() {
    if (!confirm("Markeren als geleverd? De klant krijgt een notificatie + email.")) return;
    startTransition(async () => {
      await markRequestDone(requestId);
      router.refresh();
    });
  }

  function handleFail() {
    if (!failReason.trim()) return;
    startTransition(async () => {
      await markRequestFailed(requestId, failReason.trim());
      setShowFailModal(false);
      setFailReason("");
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center gap-1 justify-end">
        <button
          onClick={handleDone}
          disabled={pending}
          className="size-7 rounded grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--status-success)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50"
          title="Markeer als geleverd"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
        </button>
        <button
          onClick={() => setShowFailModal(true)}
          disabled={pending}
          className="size-7 rounded grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--status-danger)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50"
          title="Markeer als mislukt"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {showFailModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setShowFailModal(false)}
        >
          <div
            className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[15px] font-medium mb-1">Aanvraag markeren als mislukt</h2>
            <p className="text-[12px] text-[var(--text-tertiary)] mb-4">
              De klant krijgt deze reden in de notificatie + email.
            </p>
            <textarea
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              rows={3}
              placeholder="Bv: Meta API gaf een rate-limit error, probeer morgen opnieuw."
              className="w-full px-3 py-2 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)] resize-none"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setShowFailModal(false)}
                className="h-9 px-3 rounded-md text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
              >
                Annuleren
              </button>
              <button
                onClick={handleFail}
                disabled={pending || !failReason.trim()}
                className="h-9 px-4 rounded-md bg-[var(--status-danger)] text-white text-[13px] disabled:opacity-50"
              >
                {pending ? "Versturen..." : "Markeer mislukt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
