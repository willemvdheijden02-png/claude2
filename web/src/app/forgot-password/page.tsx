"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendPasswordReset, type AuthResult } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    sendPasswordReset,
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
          {state && "success" in state ? (
            <div className="text-center py-2">
              <div className="size-12 rounded-full bg-[rgb(16_185_129/0.12)] grid place-items-center mx-auto mb-4">
                <Check className="size-6 text-[var(--status-success)]" />
              </div>
              <h1 className="text-[18px] font-medium tracking-display mb-2">
                Check je mail
              </h1>
              <p className="text-[var(--text-secondary)] text-[13px] mb-6">
                We hebben je een link gestuurd om je wachtwoord opnieuw in te stellen. Werkt 60 minuten.
              </p>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/login">Terug naar inloggen</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-[20px] font-medium tracking-display mb-1">
                  Wachtwoord vergeten?
                </h1>
                <p className="text-[var(--text-secondary)] text-[13px]">
                  Vul je email in. We sturen je een reset-link.
                </p>
              </div>
              <form action={formAction} className="space-y-3">
                <label className="block">
                  <span className="block text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="jij@agency.nl"
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
                  {isPending ? <><Loader2 className="animate-spin" /> Versturen...</> : <>Stuur reset link <ArrowRight /></>}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[13px] text-[var(--text-secondary)] mt-6">
          <Link href="/login" className="text-[var(--accent-500)] hover:underline font-medium">
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
