import { notFound } from "next/navigation";
import { eq, and, asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { supabaseServer, supabasePublicUrl, supabaseAnonKey } from "@/lib/supabase";
import { ChatWindow } from "@/components/chat-window";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [client] = await db
    .select({
      id: schema.clients.id,
      displayName: schema.clients.displayName,
      agencyId: schema.clients.agencyId,
    })
    .from(schema.clients)
    .where(eq(schema.clients.portalToken, token))
    .limit(1);

  if (!client) notFound();

  const [agency] = await db
    .select({ displayName: schema.agencies.displayName })
    .from(schema.agencies)
    .where(eq(schema.agencies.id, client.agencyId))
    .limit(1);

  if (!agency) notFound();

  // Get or create chat room
  let [room] = await db
    .select({ id: schema.chatRooms.id })
    .from(schema.chatRooms)
    .where(
      and(
        eq(schema.chatRooms.clientId, client.id),
        eq(schema.chatRooms.agencyId, client.agencyId)
      )
    )
    .limit(1);

  if (!room) {
    const [newRoom] = await db
      .insert(schema.chatRooms)
      .values({ clientId: client.id, agencyId: client.agencyId })
      .returning({ id: schema.chatRooms.id });
    room = newRoom;
  }

  const rawMessages = await db
    .select({
      id: schema.chatMessages.id,
      content: schema.chatMessages.content,
      senderType: schema.chatMessages.senderType,
      senderName: schema.chatMessages.senderName,
      createdAt: schema.chatMessages.createdAt,
    })
    .from(schema.chatMessages)
    .where(eq(schema.chatMessages.roomId, room.id))
    .orderBy(asc(schema.chatMessages.createdAt))
    .limit(100);

  const initialMessages = rawMessages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  // Suppress unused import warning
  void supabaseServer;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Chat
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Direct contact met {agency.displayName}
        </p>
      </div>
      <ChatWindow
        roomId={room.id}
        initialMessages={initialMessages}
        clientName={client.displayName}
        agencyName={agency.displayName}
        supabaseUrl={supabasePublicUrl}
        supabaseAnonKey={supabaseAnonKey}
      />
    </div>
  );
}
