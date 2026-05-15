import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabase";
import { db, schema } from "@/lib/db";

const BUCKET = "client-documents";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const clientId = form.get("clientId") as string | null;

    if (!file || !clientId) {
      return NextResponse.json({ error: "Missing file or clientId." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Detect file type
    let fileType = "other";
    if (file.type.startsWith("image/")) fileType = "image";
    else if (file.type.startsWith("video/")) fileType = "video";
    else if (file.type === "application/pdf") fileType = "pdf";
    else if (
      file.type === "application/msword" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      fileType = "document";

    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${clientId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabaseServer.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("[upload] Supabase error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabaseServer.storage.from(BUCKET).getPublicUrl(path);
    const fileUrl = urlData.publicUrl;

    // Get agencyId
    const [client] = await db
      .select({ agencyId: schema.clients.agencyId })
      .from(schema.clients)
      .where(eq(schema.clients.id, clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const [doc] = await db
      .insert(schema.clientDocuments)
      .values({
        clientId,
        agencyId: client.agencyId,
        fileName: file.name,
        fileUrl,
        fileType,
        fileSizeBytes: buffer.length,
        uploadedBy: "client",
      })
      .returning();

    return NextResponse.json({
      url: fileUrl,
      fileName: file.name,
      fileType,
      doc: { ...doc, createdAt: doc.createdAt.toISOString() },
    });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
