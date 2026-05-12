import { redirect } from "next/navigation";
import { eq, desc, inArray } from "drizzle-orm";
import { ChevronRight, Inbox } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";

const statusToTone = {
  pending: "warning",
  in_progress: "info",
  done: "success",
  failed: "danger",
  cancelled: "neutral",
} as const;

const statusToLabel = {
  pending: "WACHT",
  in_progress: "BEZIG",
  done: "KLAAR",
  failed: "FOUT",
  cancelled: "GEANNULEERD",
} as const;

function rel(ts: Date | null) {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "nu";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(ts).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export default async function RequestsPage() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) redirect("/onboarding");

  const rows = await db
    .select({
      id: schema.serviceRequests.id,
      status: schema.serviceRequests.status,
      brief: schema.serviceRequests.brief,
      createdAt: schema.serviceRequests.createdAt,
      completedAt: schema.serviceRequests.completedAt,
      serviceName: schema.services.displayName,
      clientName: schema.clients.displayName,
    })
    .from(schema.serviceRequests)
    .leftJoin(schema.services, eq(schema.services.id, schema.serviceRequests.serviceId))
    .leftJoin(schema.clients, eq(schema.clients.id, schema.serviceRequests.clientId))
    .where(eq(schema.serviceRequests.agencyId, ctx.agency.id))
    .orderBy(desc(schema.serviceRequests.createdAt));

  const active = rows.filter((r) => r.status === "pending" || r.status === "in_progress");
  const history = rows.filter((r) => r.status !== "pending" && r.status !== "in_progress");

  return (
    <>
      <Topbar
        title="Aanvragen"
        description={`${active.length} actief · ${history.length} afgerond`}
      />
      <div className="p-6 space-y-8">
        {rows.length === 0 && (
          <Card className="p-12 text-center">
            <div className="size-12 rounded-xl bg-[var(--bg-surface-2)] grid place-items-center mx-auto mb-4">
              <Inbox className="size-6 text-[var(--accent-500)]" />
            </div>
            <h2 className="text-[18px] font-medium tracking-display mb-2">Nog geen aanvragen</h2>
            <p className="text-[var(--text-secondary)] text-[13px]">
              Ga naar Service-catalogus om je eerste aanvraag te plaatsen.
            </p>
          </Card>
        )}

        {active.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                Actief
              </h2>
              <span className="text-[11px] tabular text-[var(--text-tertiary)]">{active.length}</span>
            </div>
            <div className="grid gap-3">
              {active.map((r) => (
                <Card key={r.id} className="p-5 hover:border-[var(--border-strong)] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <Badge tone={statusToTone[r.status]} className="h-[18px] px-1.5 text-[9px]">
                        {statusToLabel[r.status]}
                      </Badge>
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium text-[var(--text-primary)] truncate">{r.serviceName}</div>
                        <div className="text-[12px] text-[var(--text-secondary)]">
                          voor <span className="text-[var(--text-primary)]">{r.clientName}</span> · ingediend {rel(r.createdAt)}
                        </div>
                        {r.brief && (
                          <div className="text-[12px] text-[var(--text-tertiary)] mt-2 line-clamp-2 italic">"{r.brief}"</div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-[var(--text-tertiary)]" />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {history.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                Historie
              </h2>
              <span className="text-[11px] tabular text-[var(--text-tertiary)]">{history.length}</span>
            </div>
            <Card className="!p-0">
              {history.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[80px_1fr_140px_120px_44px] px-5 h-12 items-center border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors text-[13px] cursor-pointer"
                >
                  <Badge tone={statusToTone[r.status]} className="h-[18px] px-1.5 text-[9px] w-fit">
                    {statusToLabel[r.status]}
                  </Badge>
                  <div>{r.serviceName}</div>
                  <div className="text-[var(--text-secondary)]">{r.clientName}</div>
                  <div className="text-[var(--text-tertiary)] text-[12px] tabular">{rel(r.completedAt ?? r.createdAt)}</div>
                  <ChevronRight className="size-4 text-[var(--text-tertiary)] justify-self-end" />
                </div>
              ))}
            </Card>
          </section>
        )}
      </div>
    </>
  );
}
