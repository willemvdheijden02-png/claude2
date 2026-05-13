import { redirect } from "next/navigation";
import { eq, and, asc } from "drizzle-orm";
import { Topbar } from "@/components/shell/topbar";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";
import { ServicesCatalog } from "./services-catalog";

export default async function ServicesPage() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) redirect("/onboarding");

  const services = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.isActive, true))
    .orderBy(asc(schema.services.category), asc(schema.services.displayName));

  const clients = await db
    .select({ id: schema.clients.id, displayName: schema.clients.displayName })
    .from(schema.clients)
    .where(eq(schema.clients.agencyId, ctx.agency.id))
    .orderBy(asc(schema.clients.displayName));

  return (
    <>
      <Topbar
        title="Service-catalogus"
        description="Activeer een service voor één van je klanten"
      />
      <div className="p-4 md:p-6">
        <ServicesCatalog services={services} clients={clients} />
      </div>
    </>
  );
}
