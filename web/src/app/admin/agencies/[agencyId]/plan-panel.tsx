"use client";

import { useState, useTransition } from "react";
import { adminSetPlan, adminResetUsage } from "./actions";
import { PLAN_LIMITS } from "@/lib/usage";

type Plan = "trial" | "starter" | "pro" | "scale" | "cancelled";

interface UsageData {
  aiCalls: number;
  metaCalls: number;
  schedulerRuns: number;
}

interface PlanPanelProps {
  agencyId: string;
  currentPlan: Plan;
  usage: UsageData;
}

const PLANS: { value: Plan; label: string; color: string }[] = [
  { value: "trial",     label: "Trial",      color: "#f59e0b" },
  { value: "starter",   label: "Starter",    color: "#3b82f6" },
  { value: "pro",       label: "Pro",        color: "#8b5cf6" },
  { value: "scale",     label: "Scale",      color: "#10b981" },
  { value: "cancelled", label: "Geannuleerd",color: "#6b7280" },
];

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const color =
    pct >= 100 ? "#ef4444" :
    pct >= 80  ? "#f59e0b" :
                 "#10b981";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="tabular text-[var(--text-tertiary)]">
          {used.toLocaleString("nl-NL")} / {limit.toLocaleString("nl-NL")}
          <span className="ml-1.5 font-semibold" style={{ color }}>{pct}%</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--bg-muted)]">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function PlanPanel({ agencyId, currentPlan, usage }: PlanPanelProps) {
  const [plan, setPlan] = useState<Plan>(currentPlan);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.trial;

  function handleSetPlan(newPlan: Plan) {
    startTransition(async () => {
      const res = await adminSetPlan(agencyId, newPlan);
      if (res.error) {
        setMsg("❌ " + res.error);
      } else {
        setPlan(newPlan);
        setMsg("✅ Plan bijgewerkt naar " + PLANS.find((p) => p.value === newPlan)?.label);
        setTimeout(() => setMsg(null), 3000);
      }
    });
  }

  function handleResetUsage() {
    if (!confirm("Maandtellers resetten? Dit kan niet ongedaan worden gemaakt.")) return;
    startTransition(async () => {
      const res = await adminResetUsage(agencyId);
      if (res.error) {
        setMsg("❌ " + res.error);
      } else {
        setMsg("✅ Tellers gereset");
        setTimeout(() => setMsg(null), 3000);
      }
    });
  }

  const currentPlanDef = PLANS.find((p) => p.value === plan);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Plan & Limieten</h3>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
            Huidig plan: <span className="font-semibold" style={{ color: currentPlanDef?.color }}>{currentPlanDef?.label}</span>
          </p>
        </div>
        {msg && (
          <span className="text-[11px] text-[var(--text-secondary)] animate-pulse">{msg}</span>
        )}
      </div>

      {/* Plan selector */}
      <div className="grid grid-cols-5 gap-1.5">
        {PLANS.map((p) => (
          <button
            key={p.value}
            onClick={() => handleSetPlan(p.value)}
            disabled={isPending || p.value === plan}
            className={`
              relative py-2 px-2 rounded-lg text-[11px] font-medium text-center transition-all
              border cursor-pointer disabled:cursor-default
              ${p.value === plan
                ? "border-current text-white"
                : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              }
            `}
            style={p.value === plan ? { backgroundColor: p.color, borderColor: p.color } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Limiet overzicht voor dit plan */}
      <div className="bg-[var(--bg-muted)] rounded-lg p-3 space-y-0.5 text-[11px] text-[var(--text-tertiary)]">
        <div className="font-semibold text-[var(--text-secondary)] mb-2">Limieten {currentPlanDef?.label}</div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="block text-[var(--text-primary)] font-semibold text-[13px]">
              {limits.aiCalls.toLocaleString("nl-NL")}
            </span>
            Claude calls/mo
          </div>
          <div>
            <span className="block text-[var(--text-primary)] font-semibold text-[13px]">
              {limits.metaCalls.toLocaleString("nl-NL")}
            </span>
            Meta calls/mo
          </div>
          <div>
            <span className="block text-[var(--text-primary)] font-semibold text-[13px]">
              {limits.schedulerRuns.toLocaleString("nl-NL")}
            </span>
            Scheduler runs/mo
          </div>
        </div>
      </div>

      {/* Verbruik deze maand */}
      <div className="space-y-3">
        <div className="text-[11px] font-semibold text-[var(--text-secondary)]">Verbruik deze maand</div>
        <UsageBar label="Claude AI calls" used={usage.aiCalls} limit={limits.aiCalls} />
        <UsageBar label="Meta API calls"  used={usage.metaCalls} limit={limits.metaCalls} />
        <UsageBar label="Scheduler runs"  used={usage.schedulerRuns} limit={limits.schedulerRuns} />
      </div>

      {/* Reset knop */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleResetUsage}
          disabled={isPending}
          className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] underline decoration-dotted transition-colors"
        >
          Tellers resetten
        </button>
      </div>
    </div>
  );
}
