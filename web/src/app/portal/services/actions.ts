"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";

export type RequestResult = { error: string } | { success: true; requestId: string };

export async function createServiceRequest(
  _prev: RequestResult | null,
  formData: FormData
): Promise<RequestResult> {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) return { error: "Niet ingelogd." };

  const serviceId = formData.get("serviceId") as string;
  const clientId = formData.get("clientId") as string;
  const brief = (formData.get("brief") as string)?.trim() || null;

  if (!serviceId) return { error: "Kies een service." };
  if (!clientId) return { error: "Kies een klant." };

  try {
    // Verifieer service bestaat
    const [service] = await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.id, serviceId))
      .limit(1);
    if (!service) return { error: "Service niet gevonden." };

    // Verifieer client behoort tot agency
    const [client] = await db
      .select()
      .from(schema.clients)
      .where(and(eq(schema.clients.id, clientId), eq(schema.clients.agencyId, ctx.agency.id)))
      .limit(1);
    if (!client) return { error: "Klant niet gevonden of geen toegang." };

    const [inserted] = await db
      .insert(schema.serviceRequests)
      .values({
        agencyId: ctx.agency.id,
        clientId,
        serviceId,
        requestedBy: ctx.authUser.id,
        status: "pending",
        brief,
      })
      .returning({ id: schema.serviceRequests.id });

    revalidatePath("/portal/requests");
    revalidatePath("/portal");
    revalidatePath("/admin/queue");
    return { success: true, requestId: inserted.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Kon aanvraag niet maken." };
  }
}
