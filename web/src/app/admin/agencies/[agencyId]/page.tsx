import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { eq, desc, count } from "drizzle-orm";
import {
  ArrowLeft,
  Eye,
  Globe,
  Mail,
  Users,
} from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db, schema } from "@/lib/db";
import { getAllIntegrations } from "@/lib/agency-keys";
import { getCurrentContext } from "@/lib/auth/current";
import { startImpersonation } from "../../impersonate-actions";
import { IntegrationsPanel } from "./integrations-panel";

export default async function AdminAgencyDetailPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;

  const ctx = await getCurrentContext();
  if (ctx?.profile?.role !== "operator") redirect("/portal");

  // Agency ophalen
  const [agency] = await db
    .select()
    .from(schema.agencies)
    .where(eq(schema.agencies.id, agencyId))
    .limit(1);
  if (!agency) notFound();

  // Klanten van deze agency — dit ziet alleen de operator
  const clients = await db
    .select({
      id: schema.clients.id,
      displayName: schema.clients.displayName,
      websiteUrl: schema.clients.websiteUrl,
      metaAdAccountId: schema.clients.metaAdAccountId,
      googleAdsCustomerId: schema.clients.googleAdsCustomerId,
      status: schema.clients.status,
      portalEnabled: schema.clients.portalEnabled,
      portalEmail: schema.clients.portalEmail,
      createdAt: schema.clients.createdAt,
    })
    .from(schema.clients)
    .where(eq(schema.clients.agencyId, agencyId))
    .orderBy(desc(schema.clients.createdAt));

  // Integrations voor deze agency
  const integrations = await getAllIntegrations(agencyId);

  // Aantal opdrachten
  const [reqCount] = await db
    .select({ value: count() })
    .from(schema.serviceRequests)
    .where(eq(schema.serviceRequests.agencyId, agencyId));

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <>
      <Topbar
        title={agency.displayName}
        description={`Agency detail · ${clients.length} klanten · ${connectedCount} koppelingen actief`}
      />

      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        {/* Back + quick actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="size-4" />
              Terug
            </Link>
          </Button>
          <form action={startImpersonation.bind(null, agencyId)} className="ml-auto">
            <Button type="submit" size="sm">
              <Eye className="size-4" />
              Meekijken als deze agency
            </Button>
          </form>
        </div>

        {/* Agency info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Klanten" value={String(clients.length)} />
          <StatCard label="Koppelingen" value={`${connectedCount} / 6`} />
          <StatCard label="Opdrachten" value={String(reqCount?.value ?? 0)} />
          <StatCard
            label="Status"
            value={agency.status.toUpperCase()}
            accent={agency.status === "active"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Klanten ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[15px] flex items-center gap-2">
                <Users className="size-4 text-[var(--text-tertiary)]" />
                Klanten van deze agency
              </CardTitle>
              <CardDescription className="text-[12px]">
                Deze klanten zijn alleen zichtbaar voor deze agency (en jou als operator).
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              {clients.length === 0 ? (
                <p className="px-6 py-8 text-center text-[var(--text-tertiary)] text-[13px]">
                  Nog geen klanten.
                </p>
              ) : (
                <div>
                  {clients.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start gap-3 px-6 py-3 border-t border-[var(--border-default)]"
                    >
                      {/* Avatar */}
                      <div
                        className="size-8 rounded-full shrink-0 grid place-items-center text-[11px] font-semibold text-white mt-0.5"
                        style={{ backgroundColor: agency.primaryColor }}
                      >
                        {c.displayName.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                            {c.displayName}
                          </span>
                          <Badge
                            tone={c.status === "active" ? "success" : c.status === "new" ? "info" : "neutral"}
                            className="h-[16px] px-1 text-[9px] shrink-0"
                          >
                            {c.status.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Ad account IDs */}
                        <div className="mt-1 space-y-0.5">
                          {c.metaAdAccountId && (
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                              <span className="size-3 rounded bg-blue-600 inline-flex items-center justify-center text-white text-[7px] font-bold shrink-0">f</span>
                              <span className="font-mono">{c.metaAdAccountId}</span>
                            </div>
                          )}
                          {c.googleAdsCustomerId && (
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                              <Globe className="size-3 shrink-0" />
                              <span className="font-mono">{c.googleAdsCustomerId}</span>
                            </div>
                          )}
                          {c.websiteUrl && (
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                              <Globe className="size-3 shrink-0" />
                              <a
                                href={c.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-[var(--accent-500)] truncate max-w-[200px]"
                              >
                                {c.websiteUrl.replace(/^https?:\/\//, "")}
                              </a>
                            </div>
                          )}
                          {c.portalEmail && (
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                              <Mail className="size-3 shrink-0" />
                              <span>{c.portalEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {c.portalEnabled && (
                        <Badge tone="success" className="h-[16px] px-1 text-[9px] shrink-0 mt-0.5">
                          PORTAAL
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── API Koppelingen ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[15px]">API koppelingen</CardTitle>
              <CardDescription className="text-[12px]">
                Beheer de API-keys van deze agency. Alleen jij als operator kunt dit zien en wijzigen.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <IntegrationsPanel
                agencyId={agencyId}
                initial={integrations.map((i) => ({
                  provider: i.provider,
                  status: i.status,
                  lastVerifiedAt: i.lastVerifiedAt,
                  lastError: i.lastError,
                  credentials: (i.credentials ?? {}) as Record<string, string>,
                }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4">
      <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] mb-1">
        {label}
      </div>
      <div
        className={`text-[22px] font-medium tracking-display tabular ${
          accent ? "text-[var(--accent-500)]" : "text-[var(--text-primary)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
