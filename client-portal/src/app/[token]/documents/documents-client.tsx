"use client";
import { useState, useRef } from "react";
import { FileText, Image, Video, File, Upload } from "lucide-react";

interface Doc {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number | null;
  uploadedBy: string;
  createdAt: string;
}

function FileIcon({ type }: { type: string }) {
  if (type === "image") return <Image className="size-5" style={{ color: "var(--accent-500)" }} />;
  if (type === "video") return <Video className="size-5" style={{ color: "#8b5cf6" }} />;
  if (type === "pdf")   return <FileText className="size-5" style={{ color: "#f59e0b" }} />;
  return <File className="size-5" style={{ color: "var(--text-tertiary)" }} />;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsClient({
  token,
  clientId,
  initialDocs,
}: {
  token: string;
  clientId: string;
  initialDocs: Doc[];
}) {
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Suppress unused token warning
  void token;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("clientId", clientId);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload mislukt.");
      setDocs((prev) => [data.doc, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
          className="hidden"
          onChange={handleUpload}
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: uploading ? "var(--bg-surface-2)" : "var(--accent-500)",
            color: uploading ? "var(--text-tertiary)" : "white",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          <Upload className="size-4" />
          {uploading ? "Bezig met uploaden…" : "Bestand uploaden"}
        </label>
        {error && (
          <p className="text-[12px] mt-2" style={{ color: "#ef4444" }}>
            {error}
          </p>
        )}
      </div>

      {/* Docs grid */}
      {docs.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Nog geen documenten.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {docs.map((doc, idx) => (
            <a
              key={doc.id}
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-hover transition-colors"
              style={{
                borderTop: idx > 0 ? "1px solid var(--border-default)" : undefined,
                textDecoration: "none",
              }}
            >
              {doc.fileType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doc.fileUrl}
                  alt={doc.fileName}
                  className="size-10 rounded object-cover shrink-0"
                />
              ) : (
                <div
                  className="size-10 rounded grid place-items-center shrink-0"
                  style={{ background: "var(--bg-surface)" }}
                >
                  <FileIcon type={doc.fileType} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {doc.fileName}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {formatSize(doc.fileSizeBytes)} ·{" "}
                  {new Date(doc.createdAt).toLocaleDateString("nl-NL")} ·{" "}
                  {doc.uploadedBy === "client" ? "Door jou geüpload" : "Door agency"}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
