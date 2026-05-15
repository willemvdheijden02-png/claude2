"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileUploader, type UploadedFile } from "@/components/file-uploader";
import { Paperclip } from "lucide-react";

interface Service {
  id: string;
  displayName: string;
  description: string;
  priceCents: number;
  estimatedTurnaroundHours: number;
  category: string;
}

interface Props {
  token: string;
  clientId: string;
  services: Service[];
}

export function NewOrderForm({ token, clientId, services }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [brief, setBrief] = useState("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) { setError("Kies een dienst."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, serviceId: selectedId, brief, attachments }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis.");
      router.push(`/${token}/orders/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service picker */}
      <div>
        <p
          className="text-[13px] font-medium mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Kies een dienst
        </p>
        <div className="grid grid-cols-1 gap-3">
          {services.map((svc) => (
            <button
              key={svc.id}
              type="button"
              onClick={() => setSelectedId(svc.id)}
              className={cn(
                "text-left px-4 py-3 rounded-xl transition-all",
                selectedId === svc.id ? "ring-2" : ""
              )}
              style={{
                background: "var(--bg-surface-2)",
                border: `1px solid ${selectedId === svc.id ? "var(--accent-500)" : "var(--border-default)"}`,
                borderRadius: "12px",
                outline: "none",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {svc.displayName}
                </span>
                {svc.priceCents > 0 && (
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: "var(--accent-500)" }}
                  >
                    {new Intl.NumberFormat("nl-NL", {
                      style: "currency",
                      currency: "EUR",
                    }).format(svc.priceCents / 100)}
                  </span>
                )}
              </div>
              <p className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                {svc.description}
              </p>
              <p className="text-[11px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                Levertijd: ~{svc.estimatedTurnaroundHours}u
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Brief */}
      <div>
        <label
          className="block text-[13px] font-medium mb-2"
          style={{ color: "var(--text-secondary)" }}
          htmlFor="brief"
        >
          Beschrijf je opdracht
        </label>
        <textarea
          id="brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={5}
          placeholder="Wat wil je bereiken? Wat is de context? Hoe meer informatie, hoe beter het resultaat."
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "var(--text-primary)",
            fontSize: "13px",
            outline: "none",
            width: "100%",
            resize: "vertical",
            lineHeight: "1.6",
          }}
        />
      </div>

      {/* File attachments */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Paperclip className="size-3.5" style={{ color: "var(--text-tertiary)" }} />
          <p
            className="text-[13px] font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Bijlagen{" "}
            <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(optioneel)</span>
          </p>
        </div>
        <FileUploader clientId={clientId} onChange={setAttachments} />
      </div>

      {error && (
        <p className="text-[13px]" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !selectedId}
          style={{
            background: loading || !selectedId ? "var(--bg-surface-2)" : "var(--accent-500)",
            color: loading || !selectedId ? "var(--text-tertiary)" : "white",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 600,
            border: "none",
            cursor: loading || !selectedId ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {loading ? "Bezig met indienen…" : "Opdracht indienen"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}
