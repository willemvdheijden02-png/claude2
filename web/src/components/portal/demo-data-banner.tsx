"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDemoData } from "@/app/portal/onboarding-actions";

/**
 * Banner alleen zichtbaar als agency 0 klanten heeft.
 * Click → seedt 3 demo-klanten + 2 service requests zodat lege staat verdwijnt.
 */
export function DemoDataBanner({ visible }: { visible: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!visible || dismissed) return null;

  async function seed() {
    setLoading(true);
    const res = await seedDemoData();
    setLoading(false);
    if (res.error) alert(res.error);
    else {
      setDismissed(true);
      window.location.reload();
    }
  }

  return (
    <div className="mx-6 mt-4 p-4 rounded-[var(--radius-lg)] border border-[var(--accent-500)]/30 bg-[var(--accent-glow)] flex items-center gap-4">
      <Sparkles className="size-5 text-[var(--accent-500)] shrink-0" />
      <div className="flex-1">
        <div className="text-[13px] font-medium text-[var(--text-primary)]">
          Probeer Willoe met voorbeeld-data
        </div>
        <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
          Vul 3 demo-klanten + 2 aanvragen + voorbeeld-rapporten in om alles te zien werken. Verwijder later met één klik.
        </div>
      </div>
      <Button size="sm" onClick={seed} disabled={loading}>
        {loading ? "Bezig..." : "Vul demo-data in"}
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="size-7 rounded grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
        aria-label="Sluit banner"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
