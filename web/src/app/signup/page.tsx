"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signUpWithPassword, type AuthResult } from "../login/actions";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    signUpWithPassword,
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
              Start je agency
            </h1>
            <p className="text-[var(--text-secondary)] text-[13px]">
              Maak een Willoe-account aan in 30 seconden
            </p>
          </div>

          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full h-10 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-hover)] transition-colors flex items-center justify-center gap-2 text-[13px] font-medium"
            >
              <GoogleLogo />
              Aanmelden met Google
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--border-default)]" />
            <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
              of
            </span>
            <div className="flex-1 h-px bg-[var(--border-default)]" />
          </div>

          <form action={formAction} className="space-y-3">
            <Field label="Naam">
              <input
                type="text"
                name="fullName"
                required
                autoComplete="name"
                placeholder="Willem van der Heijden"
                disabled={isPending}
                className="w-full h-10 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all disabled:opacity-60"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="jij@agency.nl"
                disabled={isPending}
                className="w-full h-10 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all disabled:opacity-60"
              />
            </Field>
            <Field label="Wachtwoord" hint="Min. 8 tekens">
              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={isPending}
                className="w-full h-10 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all disabled:opacity-60"
              />
            </Field>

            {state && "error" in state && (
              <div className="p-2.5 rounded-md bg-[rgb(239_68_68/0.08)] border border-[var(--status-danger)]/30 text-[12px] text-[var(--status-danger)]">
                {state.error}
              </div>
            )}

            <Button type="submit" size="md" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Account aanmaken...
                </>
              ) : (
                <>
                  Account aanmaken
                  <ArrowRight />
                </>
              )}
            </Button>

            <p className="text-[11px] text-[var(--text-tertiary)] text-center leading-relaxed">
              Door door te gaan ga je akkoord met onze{" "}
              <Link href="/terms" className="underline hover:text-[var(--text-primary)]">
                voorwaarden
              </Link>{" "}
              en{" "}
              <Link href="/privacy" className="underline hover:text-[var(--text-primary)]">
                privacybeleid
              </Link>
              .
            </p>
          </form>
        </div>

        <p className="text-center text-[13px] text-[var(--text-secondary)] mt-6">
          Al een account?{" "}
          <Link href="/login" className="text-[var(--accent-500)] hover:underline font-medium">
            Inloggen
          </Link>
        </p>
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
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)]">
          {label}
        </span>
        {hint && <span className="text-[11px] text-[var(--text-tertiary)]">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.32z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
