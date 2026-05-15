import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { NewOrderForm } from "./new-order-form";

export const dynamic = "force-dynamic";

export default async function NewOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [client] = await db
    .select({ id: schema.clients.id, agencyId: schema.clients.agencyId })
    .from(schema.clients)
    .where(eq(schema.clients.portalToken, token))
    .limit(1);

  if (!client) notFound();

  const services = await db
    .select({
      id: schema.services.id,
      displayName: schema.services.displayName,
      description: schema.services.description,
      priceCents: schema.services.priceCents,
      estimatedTurnaroundHours: schema.services.estimatedTurnaroundHours,
      category: schema.services.category,
    })
    .from(schema.services)
    .where(
      and(
        eq(schema.services.agencyId, client.agencyId),
        eq(schema.services.isActive, true)
      )
    )
    .orderBy(schema.services.displayName);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Nieuwe Opdracht indienen
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Kies een dienst en beschrijf je opdracht.
        </p>
      </div>
      <NewOrderForm token={token} clientId={client.id} services={services} />
    </div>
  );
}
