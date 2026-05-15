"use client";

import { useRef, useState } from "react";
import { FileText, Film, Image, Paperclip, X } from "lucide-react";

export interface UploadedFile {
  url: string;
  fileName: string;
  fileType: string;
}

interface FileUploaderProps {
  clientId: string;
  onChange: (files: UploadedFile[]) => void;
}

interface FileEntry extends UploadedFile {
  key: string;
}

type UploadState = "uploading" | "done" | "error";

interface PendingFile {
  key: string;
  name: string;
  state: UploadState;
  errorMsg?: string;
}

function fileIcon(fileType: string) {
  if (fileType === "image") return <Image className="size-3.5 shrink-0" />;
  if (fileType === "video") return <Film className="size-3.5 shrink-0" />;
  return <FileText className="size-3.5 shrink-0" />;
}

export function FileUploader({ clientId, onChange }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [uploaded, setUploaded] = useState<FileEntry[]>([]);

  async function uploadFile(file: File): Promise<UploadedFile | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `Upload mislukt (${res.status})`);
    }
    const data = await res.json();
    return { url: data.url, fileName: data.fileName ?? file.name, fileType: data.fileType ?? "other" };
  }

  async function processFiles(files: File[]) {
    const newPending: PendingFile[] = files.map((f) => ({
      key: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      state: "uploading" as UploadState,
    }));

    setPending((prev) => [...prev, ...newPending]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = newPending[i].key;

      try {
        const result = await uploadFile(file);
        if (!result) throw new Error("Geen respons van server.");

        const entry: FileEntry = { ...result, key };

        setUploaded((prev) => {
          const next = [...prev, entry];
          onChange(next.map(({ url, fileName, fileType }) => ({ url, fileName, fileType })));
          return next;
        });

        setPending((prev) => prev.filter((p) => p.key !== key));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload mislukt.";
        setPending((prev) =>
          prev.map((p) => (p.key === key ? { ...p, state: "error", errorMsg: msg } : p))
        );
      }
    }
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const arr = Array.from(fileList);
    processFiles(arr);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function removeUploaded(key: string) {
    setUploaded((prev) => {
      const next = prev.filter((f) => f.key !== key);
      onChange(next.map(({ url, fileName, fileType }) => ({ url, fileName, fileType })));
      return next;
    });
  }

  function removePending(key: string) {
    setPending((prev) => prev.filter((p) => p.key !== key));
  }

  const hasItems = uploaded.length > 0 || pending.length > 0;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? "var(--accent-500)" : "var(--border-strong)"}`,
          borderRadius: "10px",
          padding: "24px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
          background: isDragging
            ? "color-mix(in srgb, var(--accent-500) 5%, transparent)"
            : "var(--bg-surface)",
          outline: "none",
        }}
      >
        <Paperclip
          className="size-5 mx-auto mb-2"
          style={{ color: isDragging ? "var(--accent-500)" : "var(--text-tertiary)" }}
        />
        <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
          Sleep bestanden hierheen of{" "}
          <span style={{ color: "var(--accent-500)", fontWeight: 600 }}>klik om te uploaden</span>
        </p>
        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
          PDF · Afbeeldingen · Video · Word
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* File list */}
      {hasItems && (
        <div className="space-y-1.5">
          {uploaded.map((f) => (
            <div
              key={f.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                background: "var(--bg-surface-2)",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
              }}
            >
              <span style={{ color: "var(--accent-500)" }}>{fileIcon(f.fileType)}</span>
              <span
                className="flex-1 text-[12px] truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {f.fileName}
              </span>
              <span className="text-[11px]" style={{ color: "#10b981" }}>
                ✓
              </span>
              <button
                type="button"
                onClick={() => removeUploaded(f.key)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-tertiary)",
                  display: "flex",
                  padding: "2px",
                }}
                aria-label={`Verwijder ${f.fileName}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}

          {pending.map((p) => (
            <div
              key={p.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                background: "var(--bg-surface-2)",
                border: `1px solid ${p.state === "error" ? "#ef444440" : "var(--border-default)"}`,
                borderRadius: "8px",
              }}
            >
              <Paperclip className="size-3.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
              <span
                className="flex-1 text-[12px] truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                {p.name}
              </span>
              {p.state === "uploading" && (
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  Bezig…
                </span>
              )}
              {p.state === "error" && (
                <span
                  className="text-[11px] truncate max-w-[140px]"
                  style={{ color: "#ef4444" }}
                  title={p.errorMsg}
                >
                  {p.errorMsg ?? "Fout"}
                </span>
              )}
              <button
                type="button"
                onClick={() => removePending(p.key)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-tertiary)",
                  display: "flex",
                  padding: "2px",
                }}
                aria-label={`Verwijder ${p.name}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
