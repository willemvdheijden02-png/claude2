import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { DocumentsClient } from "./documents-client";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [client] = await db
    .select({ id: schema.clients.id, displayName: schema.clients.displayName })
    .from(schema.clients)
    .where(eq(schema.clients.portalToken, token))
    .limit(1);

  if (!client) notFound();

  const docs = await db
    .select({
      id: schema.clientDocuments.id,
      fileName: schema.clientDocuments.fileName,
      fileUrl: schema.clientDocuments.fileUrl,
      fileType: schema.clientDocuments.fileType,
      fileSizeBytes: schema.clientDocuments.fileSizeBytes,
      uploadedBy: schema.clientDocuments.uploadedBy,
      createdAt: schema.clientDocuments.createdAt,
    })
    .from(schema.clientDocuments)
    .where(eq(schema.clientDocuments.clientId, client.id))
    .orderBy(desc(schema.clientDocuments.createdAt));

  const serialized = docs.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Documenten
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Bestanden gedeeld met je agency
          </p>
        </div>
      </div>
      <DocumentsClient token={token} clientId={client.id} initialDocs={serialized} />
    </div>
  );
}
