import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentContext } from "@/lib/auth/current";

export const runtime = "nodejs";
export const maxDuration = 15;

/**
 * Video generation = operator-fulfilled (queue).
 * Higgsfield heeft geen REST API, dus we maken een service_request aan.
 * Operator gebruikt Higgsfield MCP in Claude Code om te leveren.
 */
export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx?.agency) {
      return Response.json({ error: "Niet ingelogd of geen agency." }, { status: 401 });
    }

    const body = (await req.json()) as {
      prompt: string;
      aspectRatio: "9:16" | "16:9" | "1:1";
      duration: number;
      clientId?: string;
    };

    if (!body.prompt || body.prompt.length < 10) {
      return Response.json({ error: "Prompt moet minimaal 10 tekens zijn." }, { status: 400 });
    }

    // Zoek of maak een 'video-higgsfield' service
    let [service] = await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.slug, "video-higgsfield"))
      .limit(1);

    if (!service) {
      [service] = await db
        .insert(schema.services)
        .values({
          slug: "video-higgsfield",
          displayName: "Video Generation (Higgsfield)",
          description: "AI UGC video's via Higgsfield. Levert binnen 4 uur.",
          iconName: "Video",
          category: "studio",
          estimatedTurnaroundHours: 4,
          priceCents: 9900,
          skillCommand: "/higgsfield-video",
          isActive: true,
        })
        .returning();
    }

    // Eerste klant van deze agency (of expliciet meegegeven)
    let clientId = body.clientId;
    if (!clientId) {
      const [firstClient] = await db
        .select({ id: schema.clients.id })
        .from(schema.clients)
        .where(eq(schema.clients.agencyId, ctx.agency.id))
        .limit(1);
      clientId = firstClient?.id;
    }
    if (!clientId) {
      return Response.json(
        { error: "Voeg eerst een klant toe in /portal/clients voordat je video kunt aanvragen." },
        { status: 400 }
      );
    }

    const [inserted] = await db
      .insert(schema.serviceRequests)
      .values({
        agencyId: ctx.agency.id,
        clientId,
        serviceId: service.id,
        requestedBy: ctx.authUser.id,
        status: "pending",
        brief: body.prompt,
        inputPayload: {
          prompt: body.prompt,
          aspectRatio: body.aspectRatio,
          duration: body.duration,
          model: "seedance_2_0",
        },
      })
      .returning({ id: schema.serviceRequests.id });

    return Response.json({
      success: true,
      requestId: inserted.id,
      status: "pending",
      estimatedTurnaround: "~4 uur",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
