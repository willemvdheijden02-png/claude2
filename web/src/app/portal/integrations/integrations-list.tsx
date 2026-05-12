"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2, Plug, Trash2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IntegrationProvider } from "@/lib/agency-keys";
import type { AgencyIntegration } from "@/lib/db/schema";
import { connectIntegration, disconnectIntegration, type IntegrationResult } from "./actions";

type ProviderInfo = {
  name: string;
  description: string;
  color: string;
  icon: string;
  requiredFor: string[];
  docsUrl: string;
  fields: { name: string; label: string; placeholder: string; helpText?: string }[];
};

export function IntegrationsList({
  existing,
  info,
}: {
  existing: AgencyIntegration[];
  info: Record<IntegrationProvider, ProviderInfo>;
}) {
  const providers = Object.keys(info) as IntegrationProvider[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {providers.map((p) => {
        const existingRow = existing.find((e) => e.provider === p);
        return <IntegrationCard key={p} provider={p} info={info[p]} existing={existingRow} />;
      })}
    </div>
  );
}

function IntegrationCard({
  provider,
  info,
  existing,
}: {
  provider: IntegrationProvider;
  info: ProviderInfo;
  existing: AgencyIntegration | undefined;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isConnected = existing?.status === "connected";
  const isInvalid = existing?.status === "invalid";

  async function handleDisconnect() {
    if (!confirm(`${info.name} loskoppelen? Bestaande data blijft, maar features stoppen tot je opnieuw connect.`)) return;
    await disconnectIntegration(provider);
    router.refresh();
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className="size-10 rounded-md grid place-items-center font-bold text-white text-[14px] shrink-0"
                style={{ backgroundColor: info.color }}
              >
                {info.icon}
              </div>
              <div>
                <div className="text-[15px] font-medium tracking-display">{info.name}</div>
                <CardDescription className="text-[12px] mt-0.5 line-clamp-2">{info.description}</CardDescription>
              </div>
            </div>
            {isConnected && <Badge tone="success">CONNECTED</Badge>}
            {isInvalid && <Badge tone="danger">INVALID</Badge>}
            {!existing && <Badge tone="neutral">NIET GEKOPPELD</Badge>}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium mb-1.5">
            Nodig voor
          </div>
          <ul className="space-y-0.5 mb-4 flex-1">
            {info.requiredFor.map((req) => (
              <li key={req} className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-[var(--text-tertiary)]" />
                {req}
              </li>
            ))}
          </ul>
          {existing?.lastError && (
            <div className="p-2 rounded-md bg-[rgb(239_68_68/0.08)] border border-[var(--status-danger)]/30 text-[11px] text-[var(--status-danger)] mb-3">
              {existing.lastError}
            </div>
          )}
          <div className="flex items-center justify-between gap-2 mt-auto">
            <a
              href={info.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Verkrijg key <ExternalLink className="size-3" />
            </a>
            <div className="flex items-center gap-1">
              {existing && (
                <button
                  onClick={handleDisconnect}
                  className="size-8 rounded-md grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--status-danger)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                  aria-label="Loskoppelen"
                  title="Loskoppelen"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
              <Button size="sm" variant={isConnected ? "secondary" : "primary"} onClick={() => setOpen(true)}>
                <Plug />
                {isConnected ? "Wijzig keys" : isInvalid ? "Fix keys" : "Verbind"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {open && <ConnectModal provider={provider} info={info} onClose={() => setOpen(false)} />}
    </>
  );
}

function ConnectModal({
  provider,
  info,
  onClose,
}: {
  provider: IntegrationProvider;
  info: ProviderInfo;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<IntegrationResult | null, FormData>(
    connectIntegration,
    null
  );

  if (state && "success" in state) {
    // success: refresh + close after delay
    setTimeout(() => {
      router.refresh();
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="size-9 rounded-md grid place-items-center font-bold text-white text-[14px]"
              style={{ backgroundColor: info.color }}
            >
              {info.icon}
            </div>
            <div>
              <div className="text-[18px] font-medium tracking-display">{info.name}</div>
              <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">{info.description}</div>
            </div>
          </div>
          <button onClick={onClose} className="size-8 rounded-md grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <form action={formAction}>
          <input type="hidden" name="provider" value={provider} />
          <div className="p-5 space-y-4">
            {info.fields.map((field) => (
              <label key={field.name} className="block">
                <div className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">
                  {field.label}
                </div>
                <input
                  type="text"
                  name={field.name}
                  required
                  placeholder={field.placeholder}
                  disabled={isPending}
                  autoComplete="off"
                  className="w-full h-9 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all disabled:opacity-60 font-mono"
                />
                {field.helpText && (
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-1">{field.helpText}</div>
                )}
              </label>
            ))}
            <div className="p-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[11px] text-[var(--text-tertiary)]">
              <strong className="text-[var(--text-secondary)]">Veilig opgeslagen:</strong> credentials worden encrypted at rest in Supabase. Alleen jouw eigen agency heeft toegang.
            </div>
            {state && "error" in state && (
              <div className="p-2.5 rounded-md bg-[rgb(239_68_68/0.08)] border border-[var(--status-danger)]/30 text-[12px] text-[var(--status-danger)]">{state.error}</div>
            )}
            {state && "success" in state && (
              <div className="p-2.5 rounded-md bg-[rgb(16_185_129/0.08)] border border-[var(--status-success)]/30 text-[12px] text-[var(--status-success)] flex items-center gap-2">
                <Check className="size-3.5" /> Verbonden + getest. Je kunt deze service nu gebruiken.
              </div>
            )}
          </div>
          <div className="p-5 border-t border-[var(--border-default)] flex items-center justify-between">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isPending}>Annuleren</Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? <><Loader2 className="animate-spin" /> Verifiëren...</> : <><Plug /> Verbind + test</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
