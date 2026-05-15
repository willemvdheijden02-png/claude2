import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, content, senderType, senderName } = body;

    if (!roomId || !content || !senderType || !senderName) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    // Only clients may post via this public endpoint — prevent spoofing agency messages
    if (senderType !== "client") {
      return NextResponse.json({ error: "Invalid senderType." }, { status: 403 });
    }

    await db.insert(schema.chatMessages).values({
      roomId,
      content,
      senderType,
      senderName,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[chat/send]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
