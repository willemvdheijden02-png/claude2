import { notFound } from "next/navigation";
import { eq, and, count } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [client] = await db
    .select({
      id: schema.clients.id,
      displayName: schema.clients.displayName,
      portalEnabled: schema.clients.portalEnabled,
      agencyId: schema.clients.agencyId,
    })
    .from(schema.clients)
    .where(eq(schema.clients.portalToken, token))
    .limit(1);

  if (!client || !client.portalEnabled) notFound();

  const [agency] = await db
    .select({
      displayName: schema.agencies.displayName,
      primaryColor: schema.agencies.primaryColor,
      logoUrl: schema.agencies.logoUrl,
    })
    .from(schema.agencies)
    .where(eq(schema.agencies.id, client.agencyId))
    .limit(1);

  if (!agency) notFound();

  // Unread messages — agency messages not read by client
  const [{ unread }] = await db
    .select({ unread: count() })
    .from(schema.chatMessages)
    .innerJoin(schema.chatRooms, eq(schema.chatMessages.roomId, schema.chatRooms.id))
    .where(
      and(
        eq(schema.chatRooms.clientId, client.id),
        eq(schema.chatMessages.senderType, "agency"),
        eq(schema.chatMessages.isRead, false)
      )
    );

  // Pending proposals
  const [{ pending }] = await db
    .select({ pending: count() })
    .from(schema.proposals)
    .where(
      and(
        eq(schema.proposals.clientId, client.id),
        eq(schema.proposals.status, "pending")
      )
    );

  const accent = agency.primaryColor || "#10b981";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={
        {
          "--accent-500": accent,
          "--accent-600": accent,
        } as React.CSSProperties
      }
    >
      <Sidebar
        token={token}
        clientName={client.displayName}
        agencyName={agency.displayName}
        agencyLogoUrl={agency.logoUrl ?? undefined}
        accentColor={accent}
        unreadCount={unread}
        pendingCount={pending}
      />
      <main className="flex-1 overflow-y-auto bg-canvas p-6 lg:p-8">{children}</main>
    </div>
  );
}
