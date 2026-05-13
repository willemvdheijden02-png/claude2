"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";
import { createNotification } from "@/lib/notifications";

async function ensureOperator() {
  const ctx = await getCurrentContext();
  if (!ctx || ctx.profile?.role !== "operator") {
    throw new Error("Operator only");
  }
  return ctx;
}

export async function markRequestDone(requestId: string, notes?: string) {
  await ensureOperator();
  const [req] = await db
    .update(schema.serviceRequests)
    .set({
      status: "done",
      completedAt: new Date(),
      operatorNotes: notes ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.serviceRequests.id, requestId))
    .returning({
      id: schema.serviceRequests.id,
      agencyId: schema.serviceRequests.agencyId,
      requestedBy: schema.serviceRequests.requestedBy,
      serviceId: schema.serviceRequests.serviceId,
      clientId: schema.serviceRequests.clientId,
    });

  if (req) {
    const [svc] = await db
      .select({ displayName: schema.services.displayName })
      .from(schema.services)
      .where(eq(schema.services.id, req.serviceId))
      .limit(1);
    const [client] = req.clientId
      ? await db
          .select({ displayName: schema.clients.displayName })
          .from(schema.clients)
          .where(eq(schema.clients.id, req.clientId))
          .limit(1)
      : [null];

    await createNotification({
      agencyId: req.agencyId,
      recipientUserId: req.requestedBy ?? undefined,
      type: "request_done",
      title: `${svc?.displayName ?? "Aanvraag"} klaar`,
      body: client?.displayName
        ? `Levering voor ${client.displayName} staat klaar.`
        : "Je aanvraag is geleverd.",
      link: `/portal/requests`,
      sendEmail: true,
    });
  }

  revalidatePath("/admin/queue");
  revalidatePath("/portal/requests");
}

export async function markRequestFailed(requestId: string, reason: string) {
  await ensureOperator();
  const [req] = await db
    .update(schema.serviceRequests)
    .set({
      status: "failed",
      completedAt: new Date(),
      operatorNotes: reason,
      updatedAt: new Date(),
    })
    .where(eq(schema.serviceRequests.id, requestId))
    .returning({
      id: schema.serviceRequests.id,
      agencyId: schema.serviceRequests.agencyId,
      requestedBy: schema.serviceRequests.requestedBy,
      serviceId: schema.serviceRequests.serviceId,
    });

  if (req) {
    const [svc] = await db
      .select({ displayName: schema.services.displayName })
      .from(schema.services)
      .where(eq(schema.services.id, req.serviceId))
      .limit(1);

    await createNotification({
      agencyId: req.agencyId,
      recipientUserId: req.requestedBy ?? undefined,
      type: "request_failed",
      title: `${svc?.displayName ?? "Aanvraag"} mislukt`,
      body: reason,
      link: `/portal/requests`,
      sendEmail: true,
    });
  }

  revalidatePath("/admin/queue");
  revalidatePath("/portal/requests");
}
