"use client";

import { useActionState, useState, useEffect } from "react";
import {
  ArrowUpRight,
  Check,
  FileText,
  GaugeCircle,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  PenTool,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  Video,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createServiceRequest, type RequestResult } from "./actions";

type Service = {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  iconName: string;
  category: "audit" | "creative" | "seo" | "strategy" | "onboarding" | "studio";
  estimatedTurnaroundHours: number;
  priceCents: number;
};

type Client = { id: string; displayName: string };

const iconMap: Record<string, typeof Sparkles> = {
  GaugeCircle,
  TrendingUp,
  PenTool,
  Search,
  Sparkles,
  FileText,
  Image: ImageIcon,
  MessageSquare,
  Video,
  Wand2,
  Zap,
};

const categoryLabels: Record<Service["category"], string> = {
  audit: "Audit",
  creative: "Creative",
  seo: "SEO",
  strategy: "Strategie",
  onboarding: "Onboarding",
  studio: "Studio",
};

export function ServicesCatalog({ services, clients }: { services: Service[]; clients: Client[] }) {
  const [filter, setFilter] = useState<"all" | Service["category"]>("all");
  const [selected, setSelected] = useState<Service | null>(null);

  const filtered = filter === "all" ? services : services.filter((s) => s.category === filter);
  const tabs: ("all" | Service["category"])[] = ["all", "audit", "creative", "seo", "strategy", "studio"];
  const tabLabel = (id: typeof tabs[number]) => (id === "all" ? "Alles" : categoryLabels[id]);

  return (
    <>
      <div className="flex items-center gap-1 mb-6 border-b border-[var(--border-default)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "px-3 h-9 text-[12px] border-b-2 -mb-px whitespace-nowrap transition-colors",
              filter === t
                ? "border-[var(--accent-500)] text-[var(--text-primary)] font-medium"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tabLabel(t)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((s) => {
          const Icon = iconMap[s.iconName] ?? Sparkles;
          return (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="text-left border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)] p-5 hover:border-[var(--border-strong)] transition-colors group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="size-10 rounded-md bg-[var(--bg-surface-2)] grid place-items-center group-hover:bg-[var(--accent-glow)] transition-colors">
                  <Icon className="size-[18px] text-[var(--text-secondary)] group-hover:text-[var(--accent-500)] transition-colors" />
                </div>
                <ArrowUpRight className="size-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="font-medium text-[14px] mb-1">{s.displayName}</div>
              <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-3">{s.description}</div>
              <div className="flex items-center justify-between">
                <Badge tone="neutral" className="h-[18px]">{categoryLabels[s.category]}</Badge>
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.04em]">
                  <span className="text-[var(--text-tertiary)]">~{Math.round(s.estimatedTurnaroundHours / 24) || "<1"}d</span>
                  <span className={s.priceCents === 0 ? "text-[var(--status-success)]" : "text-[var(--text-secondary)]"}>
                    {s.priceCents === 0 ? "Inbegrepen" : `+€${(s.priceCents / 100).toFixed(0)}`}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && <RequestModal service={selected} clients={clients} onClose={() => setSelected(null)} />}
    </>
  );
}

function RequestModal({ service, clients, onClose }: { service: Service; clients: Client[]; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState<RequestResult | null, FormData>(createServiceRequest, null);

  useEffect(() => {
    if (state && "success" in state) {
      // sluit modal na 1.5s zodat success state zichtbaar is
      const t = setTimeout(onClose, 1500);
      return () => clearTimeout(t);
    }
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--accent-500)] font-medium mb-1">{categoryLabels[service.category]}</div>
            <div className="text-[18px] font-medium tracking-display">{service.displayName}</div>
            <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">{service.description}</div>
          </div>
          <button onClick={onClose} className="size-8 rounded-md grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <form action={formAction}>
          <input type="hidden" name="serviceId" value={service.id} />
          <div className="p-5 space-y-4">
            <label className="block">
              <div className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">Klant</div>
              {clients.length === 0 ? (
                <div className="p-3 rounded-md border border-dashed border-[var(--border-default)] text-[12px] text-[var(--text-tertiary)] text-center">
                  Geen klanten gevonden. Voeg eerst een klant toe.
                </div>
              ) : (
                <select name="clientId" required disabled={isPending} className="w-full h-9 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)]">
                  <option value="">Kies een klant...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.displayName}</option>
                  ))}
                </select>
              )}
            </label>
            <label className="block">
              <div className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">
                Korte briefing (optioneel)
              </div>
              <textarea
                name="brief"
                rows={4}
                placeholder="Wat moet de operator weten? Specifieke wensen, deadlines, focus..."
                disabled={isPending}
                className="w-full px-3 py-2 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)] resize-none"
              />
            </label>

            <div className="p-3 rounded-md bg-[var(--bg-surface-2)] text-[12px] flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">
                Geschatte turnaround: <strong className="text-[var(--text-primary)]">~{Math.round(service.estimatedTurnaroundHours / 24) || "<1"} {service.estimatedTurnaroundHours <= 24 ? "dag" : "dagen"}</strong>
              </span>
              <span className={service.priceCents === 0 ? "text-[var(--status-success)] font-medium" : "text-[var(--text-primary)] font-medium"}>
                {service.priceCents === 0 ? "Inbegrepen in plan" : `+€${(service.priceCents / 100).toFixed(0)} extra`}
              </span>
            </div>

            {state && "error" in state && (
              <div className="p-2.5 rounded-md bg-[rgb(239_68_68/0.08)] border border-[var(--status-danger)]/30 text-[12px] text-[var(--status-danger)]">{state.error}</div>
            )}
            {state && "success" in state && (
              <div className="p-2.5 rounded-md bg-[rgb(16_185_129/0.08)] border border-[var(--status-success)]/30 text-[12px] text-[var(--status-success)] flex items-center gap-2">
                <Check className="size-3.5" /> Aanvraag ingediend. De operator pakt 'm op.
              </div>
            )}
          </div>
          <div className="p-5 border-t border-[var(--border-default)] flex items-center justify-between">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isPending}>Annuleren</Button>
            <Button type="submit" size="sm" disabled={isPending || clients.length === 0}>
              {isPending ? <><Loader2 className="animate-spin" /> Versturen...</> : <><Send /> Service aanvragen</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
