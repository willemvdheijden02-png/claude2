import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { roomId } = await req.json();
    if (!roomId) return NextResponse.json({ error: "Missing roomId." }, { status: 400 });

    await db
      .update(schema.chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.chatMessages.roomId, roomId),
          eq(schema.chatMessages.senderType, "agency"),
          eq(schema.chatMessages.isRead, false)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[chat/read]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
