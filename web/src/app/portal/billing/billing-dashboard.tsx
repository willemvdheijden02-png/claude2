"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  ExternalLink,
  Loader2,
  Plus,
  Receipt,
  Send,
  X,
} from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InvoiceRow = {
  id: string;
  invoiceNumber: string | null;
  clientId: string | null;
  type: "monthly_fee" | "service" | "onboarding";
  status: "draft" | "sent" | "paid" | "overdue";
  issueDate: string | null;
  dueDate: string | null;
  totalCents: number;
  pdfUrl: string | null;
  stripeInvoiceId: string | null;
};

const tabs = [
  { id: "all" as const, label: "Alles" },
  { id: "drafts" as const, label: "Concept" },
  { id: "sent" as const, label: "Verzonden" },
  { id: "paid" as const, label: "Betaald" },
  { id: "overdue" as const, label: "Verlopen" },
];

const statusToTone: Record<InvoiceRow["status"], "success" | "info" | "danger" | "neutral"> = {
  paid: "success",
  sent: "info",
  overdue: "danger",
  draft: "neutral",
};

const statusToLabel: Record<InvoiceRow["status"], string> = {
  paid: "BETAALD",
  sent: "VERZONDEN",
  overdue: "VERLOPEN",
  draft: "CONCEPT",
};

const typeLabels: Record<InvoiceRow["type"], string> = {
  monthly_fee: "Maandfee",
  service: "Service",
  onboarding: "Onboarding",
};

function nl(cents: number) {
  return new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

export function BillingDashboard({
  invoices,
  kpis,
  counts,
}: {
  invoices: InvoiceRow[];
  kpis: { paidThisMonth: number; outstandingCents: number; overdueCents: number };
  counts: Record<string, number>;
}) {
  const [tab, setTab] = useState<typeof tabs[number]["id"]>("all");
  const [showNew, setShowNew] = useState(false);

  const filtered = invoices.filter((i) => {
    if (tab === "all") return true;
    if (tab === "drafts") return i.status === "draft";
    return i.status === tab;
  });

  return (
    <>
      <Topbar
        title="Facturatie"
        description={`${invoices.length} facturen · ${counts.paid} betaald · ${counts.sent} open`}
        action={
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus />
            Nieuwe factuur
          </Button>
        }
      />
      <div className="p-4 md:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard label="Betaald" value={`€${nl(kpis.paidThisMonth)}`} />
          <KpiCard label="Openstaand" value={`€${nl(kpis.outstandingCents)}`} muted />
          <KpiCard label="Verlopen" value={`€${nl(kpis.overdueCents)}`} danger={kpis.overdueCents > 0} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[var(--border-default)]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 h-9 text-[12px] border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-[var(--accent-500)] text-[var(--text-primary)] font-medium"
                  : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              )}
            >
              {t.label}
              <span className="text-[10px] tabular text-[var(--text-tertiary)]">
                {counts[t.id]}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="size-12 rounded-xl bg-[var(--bg-surface-2)] grid place-items-center mx-auto mb-4">
              <Receipt className="size-6 text-[var(--accent-500)]" />
            </div>
            <h2 className="text-[18px] font-medium tracking-display mb-2">
              {tab === "all" ? "Nog geen facturen" : "Geen facturen in deze categorie"}
            </h2>
            <p className="text-[var(--text-secondary)] text-[13px] mb-6">
              Maak je eerste factuur via Stripe — wordt direct verstuurd met iDEAL/kaart betaal-link.
            </p>
            <Button size="md" onClick={() => setShowNew(true)}>
              <Plus />
              Nieuwe factuur
            </Button>
          </Card>
        ) : (
          <Card className="!p-0 overflow-x-auto">
            <div className="min-w-[780px]">
            <div className="grid grid-cols-[120px_1fr_120px_100px_100px_100px_44px] px-5 h-9 bg-[var(--bg-surface-2)] border-b border-[var(--border-default)] items-center text-[10px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium">
              <div>Nr.</div>
              <div>Type</div>
              <div>Status</div>
              <div>Datum</div>
              <div>Vervalt</div>
              <div className="text-right">Bedrag</div>
              <div></div>
            </div>
            {filtered.map((inv) => (
              <div
                key={inv.id}
                className="grid grid-cols-[120px_1fr_120px_100px_100px_100px_44px] px-5 h-12 items-center border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors text-[13px]"
              >
                <div className="font-mono text-[12px] text-[var(--text-secondary)] tabular">
                  {inv.invoiceNumber ?? "—"}
                </div>
                <div className="text-[var(--text-primary)]">{typeLabels[inv.type]}</div>
                <Badge tone={statusToTone[inv.status]} className="h-[18px] px-1.5 text-[9px] w-fit">
                  {statusToLabel[inv.status]}
                </Badge>
                <div className="text-[var(--text-tertiary)] text-[12px] tabular">
                  {inv.issueDate ?? "—"}
                </div>
                <div className="text-[var(--text-tertiary)] text-[12px] tabular">
                  {inv.dueDate ?? "—"}
                </div>
                <div className="text-right tabular text-[var(--text-primary)] font-medium">
                  €{nl(inv.totalCents)}
                </div>
                {inv.pdfUrl ? (
                  <a
                    href={inv.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] justify-self-end"
                    aria-label="Download PDF"
                  >
                    <Download className="size-4" />
                  </a>
                ) : (
                  <span className="justify-self-end text-[var(--text-tertiary)]">—</span>
                )}
              </div>
            ))}
            </div>
          </Card>
        )}
      </div>

      {showNew && <NewInvoiceModal onClose={() => setShowNew(false)} />}
    </>
  );
}

function KpiCard({ label, value, muted, danger }: { label: string; value: string; muted?: boolean; danger?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="uppercase text-[10px] tracking-[0.08em]">{label}</CardDescription>
        <div
          className={cn(
            "text-[var(--text-2xl)] font-medium tracking-display tabular mt-1",
            danger ? "text-[var(--status-danger)]" : muted ? "text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
          )}
        >
          {value}
        </div>
      </CardHeader>
    </Card>
  );
}

type InvoiceResult = {
  success: true;
  invoiceNumber: string;
  hostedInvoiceUrl: string;
  pdfUrl: string;
  totalCents: number;
  customerEmail: string;
};

function NewInvoiceModal({ onClose }: { onClose: () => void }) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [type, setType] = useState<"monthly_fee" | "service" | "onboarding">("service");
  const [amount, setAmount] = useState("");
  const [vat, setVat] = useState("21");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InvoiceResult | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          type,
          amount: parseFloat(amount),
          vatRate: parseInt(vat),
          description: description || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || `HTTP ${res.status}`);
      } else {
        setResult(data as InvoiceResult);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onbekende fout");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {result ? (
          <SuccessView result={result} onClose={() => { onClose(); window.location.reload(); }} />
        ) : (
          <>
            <div className="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--accent-500)] font-medium mb-1">Nieuwe factuur</div>
                <div className="text-[18px] font-medium tracking-display">Factuur opstellen</div>
                <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                  Wordt aangemaakt + verstuurd via Stripe (test mode · iDEAL betaal-link inbegrepen)
                </div>
              </div>
              <button onClick={onClose} className="size-8 rounded-md grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors" aria-label="Sluiten">
                <X className="size-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Klantnaam">
                  <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Bol BH's" disabled={submitting} className={inp()} />
                </Field>
                <Field label="Klant email">
                  <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="finance@bolbhs.nl" disabled={submitting} className={inp()} />
                </Field>
              </div>
              <Field label="Type factuur">
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "monthly_fee" as const, label: "Maandfee" },
                    { id: "service" as const, label: "Service" },
                    { id: "onboarding" as const, label: "Onboarding" },
                  ].map((opt) => (
                    <button key={opt.id} onClick={() => setType(opt.id)} disabled={submitting} className={cn("h-9 rounded-md text-[12px] border transition-colors disabled:opacity-60", type === opt.id ? "bg-[var(--accent-glow)] border-[var(--accent-500)] text-[var(--accent-500)] font-medium" : "bg-[var(--bg-surface-2)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]")}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Omschrijving (optioneel)">
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bv: Meta Ads management mei 2026" disabled={submitting} className={inp()} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bedrag (excl. BTW)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--text-tertiary)]">€</span>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" step="0.01" disabled={submitting} className={inp() + " pl-7 tabular"} />
                  </div>
                </Field>
                <Field label="BTW">
                  <select value={vat} onChange={(e) => setVat(e.target.value)} disabled={submitting} className={inp()}>
                    <option value="21">21%</option>
                    <option value="9">9%</option>
                    <option value="0">0% (KOR)</option>
                  </select>
                </Field>
              </div>
              {amount && (
                <div className="p-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[12px] space-y-1">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Subtotaal</span><span className="tabular">€{nl((parseFloat(amount) || 0) * 100)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>BTW {vat}%</span><span className="tabular">€{nl((parseFloat(amount) || 0) * 100 * parseInt(vat) / 100)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t border-[var(--border-default)] text-[var(--text-primary)]">
                    <span>Totaal</span><span className="tabular">€{nl((parseFloat(amount) || 0) * 100 * (1 + parseInt(vat) / 100))}</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-2.5 rounded-md bg-[rgb(239_68_68/0.08)] border border-[var(--status-danger)]/30 text-[12px] text-[var(--status-danger)]">{error}</div>
              )}
            </div>
            <div className="p-5 border-t border-[var(--border-default)] flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>Annuleren</Button>
              <Button size="sm" onClick={handleSubmit} disabled={!clientName || !clientEmail || !amount || submitting}>
                {submitting ? <><Loader2 className="animate-spin" /> Aanmaken...</> : <><Send /> Maak + verstuur factuur</>}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SuccessView({ result, onClose }: { result: InvoiceResult; onClose: () => void }) {
  return (
    <>
      <div className="p-5 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.08em] text-[var(--status-success)] font-medium mb-1">
          <Check className="size-3.5" />Verzonden
        </div>
        <div className="text-[18px] font-medium tracking-display">Factuur {result.invoiceNumber}</div>
        <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
          Naar <span className="text-[var(--text-primary)]">{result.customerEmail}</span> (test mode = Stripe inbox).
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="p-4 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)]">
          <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] mb-1">Totaalbedrag</div>
          <div className="text-[24px] font-medium tracking-display tabular">€{nl(result.totalCents)}</div>
        </div>
        <a href={result.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-md border border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] transition-colors text-[13px]">
          <ExternalLink className="size-4 text-[var(--accent-500)]" />
          <div className="flex-1">
            <div className="font-medium">Bekijk hosted invoice</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">Klant kan hier betalen via iDEAL / kaart</div>
          </div>
        </a>
      </div>
      <div className="p-5 border-t border-[var(--border-default)] flex items-center justify-end">
        <Button size="sm" onClick={onClose}>Klaar</Button>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.06em] font-medium text-[var(--text-tertiary)] mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function inp() { return "w-full h-9 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[13px] outline-none focus:border-[var(--accent-500)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all disabled:opacity-60"; }
