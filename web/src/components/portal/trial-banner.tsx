"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const danger = daysLeft <= 3;
  return (
    <div
      className={`px-4 py-2 text-[12px] flex items-center justify-center gap-3 border-b ${
        danger
          ? "bg-[rgb(239_68_68/0.10)] border-[var(--status-danger)]/30 text-[var(--status-danger)]"
          : "bg-[var(--accent-glow)] border-[var(--border-default)] text-[var(--accent-500)]"
      }`}
    >
      <Clock className="size-3.5" />
      <span>
        {daysLeft === 0
          ? "Je trial verloopt vandaag."
          : daysLeft === 1
          ? "Nog 1 dag in je trial."
          : `Nog ${daysLeft} dagen in je trial.`}
      </span>
      <Link
        href="/portal/settings?tab=subscription"
        className="font-medium underline underline-offset-2 hover:no-underline inline-flex items-center gap-1"
      >
        Upgrade nu
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

export function ExpiredBanner() {
  return (
    <div className="px-4 py-2 text-[12px] flex items-center justify-center gap-3 border-b bg-[rgb(239_68_68/0.10)] border-[var(--status-danger)]/30 text-[var(--status-danger)]">
      <Clock className="size-3.5" />
      <span>Je trial is verlopen. Features zijn uitgeschakeld.</span>
      <Link
        href="/portal/settings?tab=subscription"
        className="font-medium underline underline-offset-2 hover:no-underline inline-flex items-center gap-1"
      >
        Kies een plan
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
