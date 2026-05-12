import Link from "next/link";
import { count, eq, sql, sum, desc } from "drizzle-orm";
import { ArrowUpRight, Building2, ChevronRight, Eye, Inbox, TrendingUp } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db, schema } from "@/lib/db";
import { startImpersonation } from "./impersonate-actions";

const statusToTone = {
  pending: "warning",
  in_progress: "info",
  done: "success",
  failed: "danger",
  cancelled: "neutral",
} as const;

const statusLabels = {
  pending: "WACHT",
  in_progress: "BEZIG",
  done: "KLAAR",
  failed: "FOUT",
  cancelled: "GEANNULEERD",
} as const;

function nl(cents: number) {
  return new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cents / 100);
}

function rel(ts: Date | null) {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "nu";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default async function AdminOverviewPage() {
  // Counts
  const [agencyCount] = await db
    .select({ value: count() })
    .from(schema.agencies)
    .where(eq(schema.agencies.status, "active"));

  const [trialCount] = await db
    .select({ value: count() })
    .from(schema.agencies)
    .where(eq(schema.agencies.status, "trial"));

  const [clientCount] = await db.select({ value: count() }).from(schema.clients);

  const [pendingReqs] = await db
    .select({ value: count() })
    .from(schema.serviceRequests)
    .where(eq(schema.serviceRequests.status, "pending"));

  const [paidThisMonth] = await db
    .select({ value: sum(schema.invoices.totalCents) })
    .from(schema.invoices)
    .where(eq(schema.invoices.status, "paid"));

  // All agencies for impersonation
  const agencies = await db
    .select({
      id: schema.agencies.id,
      displayName: schema.agencies.displayName,
      status: schema.agencies.status,
      plan: schema.agencies.plan,
      primaryColor: schema.agencies.primaryColor,
    })
    .from(schema.agencies)
    .orderBy(desc(schema.agencies.createdAt))
    .limit(20);

  // Recent queue items
  const recentRequests = await db
    .select({
      id: schema.serviceRequests.id,
      status: schema.serviceRequests.status,
      createdAt: schema.serviceRequests.createdAt,
      serviceName: schema.services.displayName,
      clientName: schema.clients.displayName,
      agencyName: schema.agencies.displayName,
    })
    .from(schema.serviceRequests)
    .leftJoin(schema.services, eq(schema.services.id, schema.serviceRequests.serviceId))
    .leftJoin(schema.clients, eq(schema.clients.id, schema.serviceRequests.clientId))
    .leftJoin(schema.agencies, eq(schema.agencies.id, schema.serviceRequests.agencyId))
    .orderBy(desc(schema.serviceRequests.createdAt))
    .limit(5);

  return (
    <>
      <Topbar
        title="Overview"
        description="Operator cockpit — alle agencies, klanten en queue"
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi label="Active agencies" value={String(agencyCount?.value ?? 0)} sub={`+ ${trialCount?.value ?? 0} trial`} />
          <Kpi label="Total clients" value={String(clientCount?.value ?? 0)} />
          <Kpi label="Pending requests" value={String(pendingReqs?.value ?? 0)} accent={Number(pendingReqs?.value ?? 0) > 0} />
          <Kpi label="Total paid (cents)" value={`€${nl(Number(paidThisMonth?.value ?? 0))}`} />
        </div>

        {/* Agencies — impersonation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Agencies</CardTitle>
            <CardDescription className="text-[12px] mt-0.5">
              Klik &ldquo;Impersoneer&rdquo; om als die agency in te loggen
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            {agencies.length === 0 ? (
              <div className="px-6 py-8 text-center text-[var(--text-tertiary)] text-[13px]">
                Nog geen agencies.
              </div>
            ) : (
              agencies.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-[32px_1fr_100px_100px_110px] items-center gap-3 px-6 h-12 border-t border-[var(--border-default)] text-[13px]"
                >
                  <div
                    className="size-7 rounded-md grid place-items-center text-white text-[12px] font-semibold shrink-0"
                    style={{ backgroundColor: a.primaryColor }}
                  >
                    {a.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-[var(--text-primary)] truncate">{a.displayName}</div>
                  <Badge
                    tone={
                      a.status === "active"
                        ? "success"
                        : a.status === "trial"
                        ? "warning"
                        : "neutral"
                    }
                    className="h-[18px] px-1.5 text-[9px] w-fit"
                  >
                    {a.status.toUpperCase()}
                  </Badge>
                  <div className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-[0.05em]">
                    {a.plan}
                  </div>
                  <form action={startImpersonation.bind(null, a.id)}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-[var(--border-default)] text-[11px] text-[var(--text-secondary)] hover:border-[var(--accent-500)] hover:text-[var(--accent-500)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                    >
                      <Eye className="size-3" />
                      Impersoneer
                    </button>
                  </form>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[15px]">Recente aanvragen</CardTitle>
              <CardDescription className="text-[12px] mt-0.5">
                Laatste 5 service-aanvragen
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/queue">Open queue <ArrowUpRight /></Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            {recentRequests.length === 0 ? (
              <div className="px-6 py-8 text-center text-[var(--text-tertiary)] text-[13px]">
                Nog geen aanvragen. Wachten op eerste agency die er een plaatst.
              </div>
            ) : (
              recentRequests.map((r) => (
                <Link
                  key={r.id}
                  href="/admin/queue"
                  className="grid grid-cols-[60px_1fr_140px_60px_28px] items-center gap-3 px-6 h-12 hover:bg-[var(--bg-surface-hover)] transition-colors border-t border-[var(--border-default)]"
                >
                  <Badge tone={statusToTone[r.status]} className="h-[18px] px-1.5 text-[9px]">
                    {statusLabels[r.status]}
                  </Badge>
                  <div className="text-[13px]">
                    <span className="text-[var(--text-primary)]">{r.serviceName}</span>
                    <span className="text-[var(--text-tertiary)] ml-2">— {r.clientName}</span>
                  </div>
                  <div className="text-[12px] text-[var(--text-secondary)]">{r.agencyName}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] tabular text-right">{rel(r.createdAt)}</div>
                  <ChevronRight className="size-4 text-[var(--text-tertiary)]" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="uppercase text-[10px] tracking-[0.08em]">{label}</CardDescription>
        <div className={`text-[var(--text-2xl)] font-medium tracking-display tabular mt-1 ${accent ? "text-[var(--accent-500)]" : "text-[var(--text-primary)]"}`}>
          {value}
        </div>
        {sub && <CardDescription className="text-[11px]">{sub}</CardDescription>}
      </CardHeader>
    </Card>
  );
}
