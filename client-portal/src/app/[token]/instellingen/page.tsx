import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { InstellingenForm } from "./instellingen-form";

export default async function InstellingenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [client] = await db
    .select({
      id: schema.clients.id,
      displayName: schema.clients.displayName,
      portalEnabled: schema.clients.portalEnabled,
      metaAdAccountId: schema.clients.metaAdAccountId,
      googleAdsCustomerId: schema.clients.googleAdsCustomerId,
      websiteUrl: schema.clients.websiteUrl,
    })
    .from(schema.clients)
    .where(eq(schema.clients.portalToken, token))
    .limit(1);

  if (!client || !client.portalEnabled) notFound();

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold" style={{ color: "var(--text-primary)" }}>
          Instellingen
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
          Verbind jouw advertentie-accounts zodat KPI&apos;s automatisch worden bijgehouden.
        </p>
      </div>

      {/* Isolatie-melding */}
      <div
        className="rounded-xl p-4 mb-6 flex gap-3"
        style={{
          background: "color-mix(in srgb, var(--accent-500) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent-500) 20%, transparent)",
        }}
      >
        <span className="text-[18px]">🔒</span>
        <div>
          <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
            Jouw gegevens zijn van jou
          </p>
          <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: "var(--text-secondary)" }}>
            De account-IDs die je hier invult worden uitsluitend gebruikt voor jouw eigen
            rapportages. Geen andere klant of agency heeft hier toegang toe.
          </p>
        </div>
      </div>

      <InstellingenForm
        token={token}
        initial={{
          metaAdAccountId: client.metaAdAccountId ?? "",
          googleAdsCustomerId: client.googleAdsCustomerId ?? "",
          websiteUrl: client.websiteUrl ?? "",
        }}
      />
    </div>
  );
}
