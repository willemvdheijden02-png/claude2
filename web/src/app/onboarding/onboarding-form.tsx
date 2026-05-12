"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAgency, type OnboardingResult } from "./actions";

const colorPresets = [
  { hex: "#10b981", label: "Emerald" },
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#8b5cf6", label: "Violet" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#ef4444", label: "Red" },
  { hex: "#ec4899", label: "Pink" },
  { hex: "#06b6d4", label: "Cyan" },
  { hex: "#84cc16", label: "Lime" },
];

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState<OnboardingResult | null, FormData>(
    createAgency,
    null
  );
  const [color, setColor] = useState(colorPresets[0].hex);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="block text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">
          Agency naam
        </span>
        <input
          type="text"
          name="displayName"
          required
          minLength={2}
          maxLength={60}
          autoFocus
          autoComplete="organization"
          placeholder="Bv: Northbeam Agency"
          disabled={isPending}
          className="w-full h-10 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[14px] outline-none focus:border-[var(--accent-500)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all disabled:opacity-60"
        />
      </label>

      <div>
        <div className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-2">
          Accent kleur
        </div>
        <div className="grid grid-cols-8 gap-2">
          {colorPresets.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColor(c.hex)}
              disabled={isPending}
              title={c.label}
              className="aspect-square rounded-md transition-all hover:scale-110"
              style={{
                background: c.hex,
                boxShadow:
                  color === c.hex
                    ? `0 0 0 2px var(--bg-surface), 0 0 0 4px ${c.hex}`
                    : undefined,
              }}
              aria-label={c.label}
            />
          ))}
        </div>
        <input type="hidden" name="primaryColor" value={color} />
      </div>

      {state && "error" in state && (
        <div className="p-2.5 rounded-md bg-[rgb(239_68_68/0.08)] border border-[var(--status-danger)]/30 text-[12px] text-[var(--status-danger)]">
          {state.error}
        </div>
      )}

      <Button type="submit" size="md" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            Bezig met opzetten...
          </>
        ) : (
          <>
            Maak agency aan
            <ArrowRight />
          </>
        )}
      </Button>
    </form>
  );
}
