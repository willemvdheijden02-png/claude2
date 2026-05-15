import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proposalId, token, status, note } = body;

    if (!proposalId || !token || !status) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    // Validate token
    const [client] = await db
      .select({ id: schema.clients.id })
      .from(schema.clients)
      .where(eq(schema.clients.portalToken, token))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Invalid token." }, { status: 403 });
    }

    // Update proposal — only if belongs to client and is pending
    const [updated] = await db
      .update(schema.proposals)
      .set({
        status,
        clientNote: note ?? null,
        respondedAt: new Date(),
      })
      .where(
        and(
          eq(schema.proposals.id, proposalId),
          eq(schema.proposals.clientId, client.id),
          eq(schema.proposals.status, "pending")
        )
      )
      .returning({ id: schema.proposals.id });

    if (!updated) {
      return NextResponse.json(
        { error: "Proposal not found or already responded." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[proposals/respond]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
