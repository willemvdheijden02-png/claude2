"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetPassword, type AuthResult } from "./actions";

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    resetPassword,
    null
  );

  return (
    <div className="min-h-screen grid place-items-center px-6 py-12 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--accent-glow), transparent 70%)",
          opacity: 0.5,
        }}
      />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="size-8 rounded-md bg-[var(--accent-500)] grid place-items-center">
            <span className="text-white font-semibold">W</span>
          </div>
          <span className="font-medium tracking-display text-[18px]">willoe</span>
        </Link>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-medium tracking-display mb-1">
              Nieuw wachtwoord
            </h1>
            <p className="text-[var(--text-secondary)] text-[13px]">
              Kies een nieuw, sterk wachtwoord
            </p>
          </div>
          <form action={formAction} className="space-y-3">
            <label className="block">
              <span className="block text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">
                Nieuw wachtwoord
              </span>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={isPending}
                className="w-full h-10 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all disabled:opacity-60"
              />
            </label>

            {state && "error" in state && (
              <div className="p-2.5 rounded-md bg-[rgb(239_68_68/0.08)] border border-[var(--status-danger)]/30 text-[12px] text-[var(--status-danger)]">
                {state.error}
              </div>
            )}

            <Button type="submit" size="md" className="w-full" disabled={isPending}>
              {isPending ? <><Loader2 className="animate-spin" /> Bijwerken...</> : <>Wachtwoord wijzigen <ArrowRight /></>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
