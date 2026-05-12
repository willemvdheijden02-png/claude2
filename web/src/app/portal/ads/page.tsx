import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";
import { AdsDashboard } from "./ads-dashboard";

export default async function AdsManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) redirect("/onboarding");

  const clientsWithMeta = await db
    .select({
      id: schema.clients.id,
      displayName: schema.clients.displayName,
      metaAdAccountId: schema.clients.metaAdAccountId,
    })
    .from(schema.clients)
    .where(
      and(
        eq(schema.clients.agencyId, ctx.agency.id),
        isNotNull(schema.clients.metaAdAccountId)
      )
    )
    .orderBy(desc(schema.clients.createdAt));

  const params = await searchParams;
  const selectedClientId = params.client ?? clientsWithMeta[0]?.id;
  const selectedClient = clientsWithMeta.find((c) => c.id === selectedClientId) ?? clientsWithMeta[0];

  if (clientsWithMeta.length === 0) {
    return (
      <>
        <Topbar
          title="Ads Manager"
          description="Geen klanten met Meta gekoppeld"
        />
        <div className="p-6">
          <Card className="p-12 text-center">
            <div className="size-12 rounded-xl bg-[#1877F2]/10 grid place-items-center mx-auto mb-4">
              <span className="text-[#1877F2] font-bold text-[24px] leading-none">f</span>
            </div>
            <h2 className="text-[18px] font-medium tracking-display mb-2">
              Koppel Meta aan een klant
            </h2>
            <p className="text-[var(--text-secondary)] text-[13px] max-w-md mx-auto mb-6">
              Voeg een klant toe en vul z'n Meta Ad Account ID in (begint met
              <code className="px-1 py-0.5 bg-[var(--bg-surface-2)] rounded mx-1 font-mono text-[12px]">act_</code>),
              dan zie je hier live spend, ROAS en per-campagne data.
            </p>
            <Button asChild>
              <Link href="/portal/clients">
                <Plus />
                Naar klanten
              </Link>
            </Button>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-4">
              Eerst toegang nodig? Vraag je klant om jouw Meta Business toe te voegen als{" "}
              <strong>Partner</strong> met <em>Manage campaigns</em> recht.
            </p>
          </Card>
        </div>
      </>
    );
  }

  return (
    <AdsDashboard
      clients={clientsWithMeta}
      selectedClientId={selectedClient.id}
    />
  );
}
