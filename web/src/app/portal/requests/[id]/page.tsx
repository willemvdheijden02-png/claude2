import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Download } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

const statusToTone = {
  pending: "warning",
  in_progress: "info",
  done: "success",
  failed: "danger",
  cancelled: "neutral",
} as const;

const statusToLabel = {
  pending: "Wacht op start",
  in_progress: "Bezig",
  done: "Klaar",
  failed: "Fout",
  cancelled: "Geannuleerd",
} as const;

function fmt(ts: Date | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ctx = await getCurrentContext();
  if (!ctx?.agency) redirect("/onboarding");

  const [row] = await db
    .select({
      id: schema.serviceRequests.id,
      status: schema.serviceRequests.status,
      brief: schema.serviceRequests.brief,
      operatorNotes: schema.serviceRequests.operatorNotes,
      createdAt: schema.serviceRequests.createdAt,
      startedAt: schema.serviceRequests.startedAt,
      completedAt: schema.serviceRequests.completedAt,
      agencyId: schema.serviceRequests.agencyId,
      serviceName: schema.services.displayName,
      serviceCategory: schema.services.category,
      serviceEta: schema.services.estimatedTurnaroundHours,
      clientName: schema.clients.displayName,
      reportPdfUrl: schema.reports.pdfUrl,
    })
    .from(schema.serviceRequests)
    .leftJoin(schema.services, eq(schema.services.id, schema.serviceRequests.serviceId))
    .leftJoin(schema.clients, eq(schema.clients.id, schema.serviceRequests.clientId))
    .leftJoin(schema.reports, eq(schema.reports.serviceRequestId, schema.serviceRequests.id))
    .where(
      and(
        eq(schema.serviceRequests.id, id),
        eq(schema.serviceRequests.agencyId, ctx.agency.id)
      )
    )
    .limit(1);

  if (!row) notFound();

  const timeline = [
    { label: "Ingediend", ts: row.createdAt },
    { label: "Gestart", ts: row.startedAt },
    { label: "Afgerond", ts: row.completedAt },
  ];

  return (
    <>
      <Topbar
        title={row.serviceName ?? "Aanvraag"}
        description={`voor ${row.clientName}`}
      />
      <div className="p-4 md:p-6 space-y-6 max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="-ml-1">
          <Link href="/portal/requests">
            <ArrowLeft className="size-4" />
            Terug naar aanvragen
          </Link>
        </Button>

        {/* Status card */}
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-[16px]">{row.serviceName}</CardTitle>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                voor <span className="text-[var(--text-primary)] font-medium">{row.clientName}</span>
              </p>
            </div>
            <Badge tone={statusToTone[row.status]}>
              {statusToLabel[row.status]}
            </Badge>
          </CardHeader>

          {row.brief && (
            <CardContent>
              <div className="bg-[var(--bg-surface-2)] rounded-lg p-4 border border-[var(--border-default)]">
                <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium mb-2">
                  Brief
                </p>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {row.brief}
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[14px] flex items-center gap-2">
              <Clock className="size-4 text-[var(--text-tertiary)]" />
              Tijdlijn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeline.map((step) => (
                <div key={step.label} className="flex items-center gap-4 text-[13px]">
                  <div
                    className={`size-2 rounded-full shrink-0 ${step.ts ? "bg-[var(--accent-500)]" : "bg-[var(--border-strong)]"}`}
                  />
                  <span className="text-[var(--text-secondary)] w-24 shrink-0">{step.label}</span>
                  <span className={step.ts ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}>
                    {fmt(step.ts)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operator notes */}
        {row.operatorNotes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[14px]">Notities van Willoe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {row.operatorNotes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Report download */}
        {row.reportPdfUrl && (
          <Card className="border-[var(--accent-500)] bg-[color-mix(in_srgb,var(--accent-500)_4%,transparent)]">
            <CardContent className="flex items-center justify-between gap-4 py-5">
              <div>
                <p className="text-[14px] font-medium text-[var(--text-primary)]">Rapport beschikbaar</p>
                <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                  Het rapport voor deze aanvraag is klaar.
                </p>
              </div>
              <Button asChild>
                <a href={row.reportPdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="size-4" />
                  Download PDF
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
