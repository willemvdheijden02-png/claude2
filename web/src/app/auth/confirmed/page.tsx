import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Email bevestigd — Willoe" };

export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen grid place-items-center px-6 py-12 relative overflow-hidden bg-[var(--bg-canvas)]">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, var(--accent-glow), transparent 70%)",
          opacity: 0.5,
        }}
      />
      <div className="relative w-full max-w-sm text-center">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="size-8 rounded-md bg-[var(--accent-500)] grid place-items-center">
            <span className="text-white font-semibold">W</span>
          </div>
          <span className="font-medium tracking-display text-[18px]">willoe</span>
        </Link>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8">
          <div className="size-14 rounded-full bg-[rgb(16_185_129/0.12)] grid place-items-center mx-auto mb-6">
            <Check className="size-7 text-[var(--status-success)]" />
          </div>
          <h1 className="text-[22px] font-medium tracking-display mb-2">
            Email bevestigd
          </h1>
          <p className="text-[var(--text-secondary)] text-[14px] mb-8">
            Welkom bij Willoe — je account is klaar. Log in en zet je agency op.
          </p>
          <Button size="lg" className="w-full" asChild>
            <Link href="/login">
              Doorgaan naar inloggen
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
