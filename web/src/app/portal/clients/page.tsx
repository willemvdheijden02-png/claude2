import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Topbar } from "@/components/shell/topbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";
import { ClientsTable } from "./clients-table";
import { NewClientButton } from "./new-client-button";

export default async function ClientsPage() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) redirect("/onboarding");

  const clients = await db
    .select()
    .from(schema.clients)
    .where(eq(schema.clients.agencyId, ctx.agency.id))
    .orderBy(desc(schema.clients.createdAt));

  const activeRequestsCount = 0; // placeholder — komt zodra service_requests gevuld is

  return (
    <>
      <Topbar
        title="Klanten"
        description={
          clients.length === 0
            ? "Nog geen klanten · voeg je eerste klant toe"
            : `${clients.length} ${clients.length === 1 ? "klant" : "klanten"} · ${activeRequestsCount} actieve aanvragen`
        }
        action={<NewClientButton />}
      />
      <div className="p-6">
        {clients.length === 0 ? (
          <EmptyState />
        ) : (
          <ClientsTable clients={clients} />
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)] p-12 text-center">
      <div className="size-12 rounded-xl bg-[var(--bg-surface-2)] grid place-items-center mx-auto mb-4">
        <Plus className="size-6 text-[var(--accent-500)]" />
      </div>
      <h2 className="text-[18px] font-medium tracking-display mb-2">
        Voeg je eerste klant toe
      </h2>
      <p className="text-[var(--text-secondary)] text-[13px] max-w-md mx-auto mb-6">
        Klanten zijn de bedrijven waarvoor jij ads draait. Voeg ze toe en koppel
        hun Meta ad-accounts om live performance te zien.
      </p>
      <NewClientButton variant="large" />
    </div>
  );
}
