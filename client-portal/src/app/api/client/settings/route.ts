// PATCH /api/client/settings
// Klant werkt eigen ad-account IDs bij via het klantportaal.
// Token-gebaseerde auth — geen Google account nodig.

import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, metaAdAccountId, googleAdsCustomerId, websiteUrl } = body as {
      token: string;
      metaAdAccountId?: string;
      googleAdsCustomerId?: string;
      websiteUrl?: string;
    };

    if (!token) return NextResponse.json({ error: "Token ontbreekt." }, { status: 400 });

    // Valideer token → klant
    const [client] = await db
      .select({ id: schema.clients.id, portalEnabled: schema.clients.portalEnabled })
      .from(schema.clients)
      .where(eq(schema.clients.portalToken, token))
      .limit(1);

    if (!client || !client.portalEnabled) {
      return NextResponse.json({ error: "Onbekend portaal." }, { status: 404 });
    }

    // Bouw update object — alleen velden die zijn meegegeven
    const updates: Record<string, string | null> = {};
    if (metaAdAccountId !== undefined)
      updates.metaAdAccountId = metaAdAccountId.trim() || null;
    if (googleAdsCustomerId !== undefined)
      updates.googleAdsCustomerId = googleAdsCustomerId.trim() || null;
    if (websiteUrl !== undefined)
      updates.websiteUrl = websiteUrl.trim() || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: true, message: "Niets te updaten." });
    }

    await db
      .update(schema.clients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.clients.id, client.id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[client/settings]", err);
    return NextResponse.json({ error: "Opslaan mislukt." }, { status: 500 });
  }
}
