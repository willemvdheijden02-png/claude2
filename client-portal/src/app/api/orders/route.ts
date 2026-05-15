import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

interface Attachment {
  url: string;
  fileName: string;
  fileType: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, serviceId, brief, attachments } = body as {
      token: string;
      serviceId: string;
      brief?: string;
      attachments?: Attachment[];
    };

    if (!token || !serviceId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Validate token → get client
    const [client] = await db
      .select({ id: schema.clients.id, agencyId: schema.clients.agencyId, portalEnabled: schema.clients.portalEnabled })
      .from(schema.clients)
      .where(eq(schema.clients.portalToken, token))
      .limit(1);

    if (!client || !client.portalEnabled) {
      return NextResponse.json({ error: "Invalid token." }, { status: 403 });
    }

    // Validate service exists and is active
    const [service] = await db
      .select({ id: schema.services.id })
      .from(schema.services)
      .where(eq(schema.services.id, serviceId))
      .limit(1);

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    const sanitizedAttachments: Attachment[] = Array.isArray(attachments)
      ? attachments.filter(
          (a) => typeof a.url === "string" && typeof a.fileName === "string" && typeof a.fileType === "string"
        )
      : [];

    const inputPayload: Record<string, unknown> = {};
    if (brief) inputPayload.brief = brief;
    if (sanitizedAttachments.length > 0) inputPayload.attachments = sanitizedAttachments;

    const [order] = await db
      .insert(schema.serviceRequests)
      .values({
        agencyId: client.agencyId,
        clientId: client.id,
        serviceId,
        brief: brief ?? null,
        inputPayload: Object.keys(inputPayload).length > 0 ? inputPayload : null,
        status: "pending",
      })
      .returning({ id: schema.serviceRequests.id });

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (err) {
    console.error("[orders/POST]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
