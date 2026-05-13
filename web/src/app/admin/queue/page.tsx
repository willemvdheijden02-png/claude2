import { eq, desc, inArray } from "drizzle-orm";
import { Topbar } from "@/components/shell/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db, schema } from "@/lib/db";
import { QueueRowActions } from "./queue-row-actions";

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

export default async function QueuePage() {
  const rows = await db
    .select({
      id: schema.serviceRequests.id,
      status: schema.serviceRequests.status,
      brief: schema.serviceRequests.brief,
      createdAt: schema.serviceRequests.createdAt,
      serviceName: schema.services.displayName,
      clientName: schema.clients.displayName,
      agencyName: schema.agencies.displayName,
      skillCommand: schema.services.skillCommand,
    })
    .from(schema.serviceRequests)
    .leftJoin(schema.services, eq(schema.services.id, schema.serviceRequests.serviceId))
    .leftJoin(schema.clients, eq(schema.clients.id, schema.serviceRequests.clientId))
    .leftJoin(schema.agencies, eq(schema.agencies.id, schema.serviceRequests.agencyId))
    .where(inArray(schema.serviceRequests.status, ["pending", "in_progress"]))
    .orderBy(desc(schema.serviceRequests.createdAt));

  return (
    <>
      <Topbar
        title="Queue"
        description={`${rows.length} actief — pak ze in volgorde van oudste eerst`}
      />
      <div className="p-6">
        {rows.length === 0 ? (
          <Card className="p-12 text-center">
            <h2 className="text-[18px] font-medium tracking-display mb-2">Queue is leeg</h2>
            <p className="text-[var(--text-secondary)] text-[13px]">
              Geen openstaande aanvragen. Tijd voor koffie ☕
            </p>
          </Card>
        ) : (
          <Card className="!p-0 overflow-x-auto">
            <div className="min-w-[880px]">
            <div className="grid grid-cols-[80px_1fr_160px_160px_120px_80px_72px] px-4 h-9 bg-[var(--bg-surface-2)] border-b border-[var(--border-default)] items-center text-[10px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium">
              <div>Status</div>
              <div>Service / Briefing</div>
              <div>Agency</div>
              <div>Klant</div>
              <div>Skill cmd</div>
              <div>Tijd</div>
              <div></div>
            </div>
            {rows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[80px_1fr_160px_160px_120px_80px_72px] px-4 py-3 items-start border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors text-[13px]"
              >
                <Badge tone={statusToTone[r.status]} className="h-[18px] px-1.5 text-[9px] w-fit">
                  {statusLabels[r.status]}
                </Badge>
                <div className="min-w-0">
                  <div className="text-[var(--text-primary)] font-medium">{r.serviceName}</div>
                  {r.brief && (
                    <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 italic line-clamp-2">"{r.brief}"</div>
                  )}
                </div>
                <div className="text-[var(--text-secondary)]">{r.agencyName}</div>
                <div className="text-[var(--text-secondary)]">{r.clientName}</div>
                <div className="text-[11px] font-mono text-[var(--text-tertiary)]">{r.skillCommand}</div>
                <div className="text-[var(--text-tertiary)] text-[12px] tabular">{rel(r.createdAt)}</div>
                <QueueRowActions requestId={r.id} />
              </div>
            ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
