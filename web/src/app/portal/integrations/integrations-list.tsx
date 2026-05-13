"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, ExternalLink, Loader2, Plug, Trash2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IntegrationProvider } from "@/lib/agency-keys";
import type { AgencyIntegration } from "@/lib/db/schema";
import {
  connectIntegration,
  disconnectIntegration,
  pullMetaData,
  type IntegrationResult,
  type MetaPullResult,
} from "./actions";

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
          {provider === "meta" && isConnected && <MetaPullButton />}
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

function MetaPullButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<MetaPullResult | null>(null);
  const [days, setDays] = useState(30);

  function handlePull() {
    setResult(null);
    startTransition(async () => {
      const res = await pullMetaData(days);
      setResult(res);
      if ("success" in res) router.refresh();
    });
  }

  return (
    <div className="border-t border-[var(--border-default)] -mx-6 px-6 pt-3 mt-3 mb-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium">
          Data ophalen
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value, 10))}
          disabled={pending}
          className="h-7 px-2 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[11px] outline-none disabled:opacity-50"
        >
          <option value={7}>7 dagen</option>
          <option value={14}>14 dagen</option>
          <option value={30}>30 dagen</option>
          <option value={90}>90 dagen</option>
        </select>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handlePull}
        disabled={pending}
        className="w-full"
      >
        {pending ? <><Loader2 className="animate-spin" /> Ophalen...</> : <><Download /> Haal Meta data op</>}
      </Button>
      {result && "error" in result && (
        <div className="mt-2 p-2 rounded-md bg-[rgb(239_68_68/0.08)] border border-[var(--status-danger)]/30 text-[11px] text-[var(--status-danger)]">
          {result.error}
        </div>
      )}
      {result && "success" in result && (
        <div className="mt-2 space-y-1.5">
          <div className="p-2 rounded-md bg-[rgb(16_185_129/0.08)] border border-[var(--status-success)]/30 text-[11px] text-[var(--status-success)] flex items-center gap-1.5">
            <Check className="size-3" />
            {result.sync.snapshotsWritten} snapshots geschreven voor {result.sync.clientsChecked} klanten
          </div>
          {result.adAccounts.length > 0 && (
            <div className="p-2 rounded-md bg-[var(--bg-surface-2)] text-[10px] text-[var(--text-tertiary)] space-y-0.5">
              <div className="font-medium text-[var(--text-secondary)] mb-1">
                Toegankelijke ad accounts ({result.adAccounts.length}):
              </div>
              {result.adAccounts.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between font-mono">
                  <span>{a.id}</span>
                  <span className="text-[var(--text-tertiary)]">{a.name}</span>
                </div>
              ))}
              {result.adAccounts.length > 5 && (
                <div className="text-[var(--text-tertiary)] italic">+ {result.adAccounts.length - 5} meer…</div>
              )}
            </div>
          )}
          {result.sync.errors.length > 0 && (
            <div className="p-2 rounded-md bg-[rgb(251_191_36/0.08)] border border-[var(--status-warning)]/30 text-[10px] text-[var(--status-warning)]">
              {result.sync.errors.length} klant(en) hadden errors. Check Ads dashboard.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
