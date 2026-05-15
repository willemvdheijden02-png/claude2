"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, X, Loader2, CheckCircle2, Building2 } from "lucide-react";
import { adminCreateAgency, type CreateAgencyResult } from "./actions";

const PLANS = [
  { value: "trial",   label: "Trial"   },
  { value: "starter", label: "Starter" },
  { value: "pro",     label: "Pro"     },
  { value: "scale",   label: "Scale"   },
];

const COLORS = [
  "#10b981", "#6366f1", "#f59e0b", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

export function NewAgencyButton() {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState("#10b981");
  const dialogRef = useRef<HTMLDivElement>(null);

  const [state, formAction, isPending] = useActionState<CreateAgencyResult | null, FormData>(
    adminCreateAgency,
    null
  );

  // Sluit na succes (500ms zodat de gebruiker de check-mark ziet)
  useEffect(() => {
    if (state && "success" in state) {
      const t = setTimeout(() => {
        setOpen(false);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [state]);

  // Sluit bij klik buiten het modal
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const success = state && "success" in state;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: "var(--accent-500)" }}
      >
        <Plus className="size-3.5" />
        Nieuwe agency
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div
            ref={dialogRef}
            className="relative w-full max-w-md rounded-2xl border border-[var(--border-default)] p-6 shadow-2xl z-10"
            style={{ background: "var(--bg-surface)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg grid place-items-center" style={{ background: color }}>
                  <Building2 className="size-4 text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                    Nieuwe agency toevoegen
                  </h2>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Ze ontvangen een uitnodigingsmail
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="size-7 grid place-items-center rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Success state */}
            {success ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="size-10 text-[var(--status-success)]" />
                <p className="text-[14px] font-medium text-[var(--text-primary)]">
                  Agency aangemaakt!
                </p>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  {(state as { success: true; displayName: string; inviteSent: boolean }).inviteSent
                    ? `Uitnodigingsmail gestuurd naar ${(state as { success: true; displayName: string; inviteSent: boolean }).displayName}.`
                    : "Agency aangemaakt. Stuur handmatig een uitnodiging."}
                </p>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                {/* Hidden color field */}
                <input type="hidden" name="primaryColor" value={color} />

                {/* Agency naam */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">
                    Agency naam
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    required
                    minLength={2}
                    placeholder="Northbeam Agency"
                    autoFocus
                    className="w-full h-10 px-3 rounded-lg text-[13px] outline-none transition-all"
                    style={{
                      background: "var(--bg-surface-2)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent-500)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; }}
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">
                    E-mailadres eigenaar
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="eigenaar@agency.nl"
                    className="w-full h-10 px-3 rounded-lg text-[13px] outline-none transition-all"
                    style={{
                      background: "var(--bg-surface-2)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent-500)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; }}
                  />
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                    Ze ontvangen een uitnodigingslink op dit adres.
                  </p>
                </div>

                {/* Plan */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">
                    Plan
                  </label>
                  <select
                    name="plan"
                    defaultValue="trial"
                    className="w-full h-10 px-3 rounded-lg text-[13px] outline-none transition-all appearance-none cursor-pointer"
                    style={{
                      background: "var(--bg-surface-2)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent-500)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; }}
                  >
                    {PLANS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Kleur */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">
                    Kleur
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="size-7 rounded-full transition-transform hover:scale-110"
                        style={{
                          background: c,
                          outline: color === c ? `2px solid ${c}` : "none",
                          outlineOffset: "2px",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Error */}
                {state && "error" in state && (
                  <div
                    className="p-3 rounded-lg text-[12px]"
                    style={{
                      background: "color-mix(in srgb, var(--status-danger) 8%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--status-danger) 25%, transparent)",
                      color: "var(--status-danger)",
                    }}
                  >
                    {state.error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 h-10 rounded-lg text-[13px] font-medium transition-colors"
                    style={{
                      background: "var(--bg-surface-2)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 h-10 rounded-lg text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                    style={{ background: "var(--accent-500)" }}
                  >
                    {isPending ? (
                      <><Loader2 className="size-4 animate-spin" /> Aanmaken...</>
                    ) : (
                      "Agency aanmaken"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
