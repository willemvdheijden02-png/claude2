import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { BotChat } from "./bot-chat";

export const dynamic = "force-dynamic";

export default async function BotPage({
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

  const [agency] = await db
    .select({ displayName: schema.agencies.displayName })
    .from(schema.agencies)
    .where(eq(schema.agencies.id, client.agencyId))
    .limit(1);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Hulp
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Stel een vraag aan de assistent van {agency?.displayName ?? "je agency"}
        </p>
      </div>
      <BotChat agencyId={client.agencyId} />
    </div>
  );
}
