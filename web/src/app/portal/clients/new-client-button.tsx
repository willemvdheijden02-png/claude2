"use client";

import { useActionState, useState, useEffect } from "react";
import { ArrowRight, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, type ClientResult } from "./actions";

export function NewClientButton({ variant }: { variant?: "large" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "large" ? (
        <Button size="lg" onClick={() => setOpen(true)}>
          <Plus />
          Voeg eerste klant toe
        </Button>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus />
          Nieuwe klant
        </Button>
      )}
      {open && <NewClientModal onClose={() => setOpen(false)} />}
    </>
  );
}

function NewClientModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState<ClientResult | null, FormData>(
    createClient,
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--accent-500)] font-medium mb-1">
              Nieuwe klant
            </div>
            <div className="text-[18px] font-medium tracking-display">Klant toevoegen</div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-md grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            aria-label="Sluiten"
          >
            <X className="size-4" />
          </button>
        </div>
        <form action={formAction}>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Klantnaam *">
                <input
                  type="text"
                  name="displayName"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Bol BH's"
                  autoFocus
                  disabled={isPending}
                  className={input()}
                />
              </Field>
              <Field label="Website URL">
                <input
                  type="url"
                  name="websiteUrl"
                  placeholder="https://bolbhs.nl"
                  disabled={isPending}
                  className={input()}
                />
              </Field>
            </div>

            <Field label="Doelgroep (ICP)">
              <textarea
                name="icpDescription"
                rows={2}
                placeholder="Vrouwen 40-65 met BH-pasvorm problemen na overgang"
                disabled={isPending}
                className={input() + " py-2 h-auto"}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Maandbudget (€)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--text-tertiary)]">
                    €
                  </span>
                  <input
                    type="number"
                    name="budgetMonthly"
                    placeholder="5000"
                    step="100"
                    disabled={isPending}
                    className={input() + " pl-7 tabular"}
                  />
                </div>
              </Field>
              <Field label="Status">
                <select disabled className={input()}>
                  <option>Nieuw (default)</option>
                </select>
              </Field>
            </div>

            <div className="border-t border-[var(--border-default)] pt-4">
              <div className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-3">
                Ad-account koppelingen (optioneel)
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Field
                  label="Meta Ad Account ID"
                  hint="Format: act_1234567890. Geef partner-access aan jouw Meta Business."
                >
                  <input
                    type="text"
                    name="metaAdAccountId"
                    placeholder="act_664527626124737"
                    pattern="act_[0-9]+"
                    disabled={isPending}
                    className={input() + " font-mono"}
                  />
                </Field>
                <Field label="Google Ads Customer ID" hint="Format: 123-456-7890">
                  <input
                    type="text"
                    name="googleAdsCustomerId"
                    placeholder="123-456-7890"
                    disabled={isPending}
                    className={input() + " font-mono"}
                  />
                </Field>
              </div>
            </div>

            <Field
              label="Concurrenten"
              hint="3-5 concurrent URLs, één per regel of komma-gescheiden"
            >
              <textarea
                name="competitors"
                rows={3}
                placeholder={"https://anita.com\nhttps://triumph.com\nhttps://livera.nl"}
                disabled={isPending}
                className={input() + " py-2 h-auto font-mono text-[12px]"}
              />
            </Field>

            {state && "error" in state && (
              <div className="p-2.5 rounded-md bg-[rgb(239_68_68/0.08)] border border-[var(--status-danger)]/30 text-[12px] text-[var(--status-danger)]">
                {state.error}
              </div>
            )}
          </div>
          <div className="p-5 border-t border-[var(--border-default)] flex items-center justify-between">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isPending}>
              Annuleren
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Aanmaken...
                </>
              ) : (
                <>
                  Klant aanmaken
                  <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)]">
          {label}
        </span>
      </div>
      {children}
      {hint && (
        <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-relaxed">{hint}</div>
      )}
    </label>
  );
}

function input() {
  return "w-full h-9 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all disabled:opacity-60";
}
