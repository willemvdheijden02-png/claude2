"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  proposalId: string;
  token: string;
}

export function ProposalRespond({ proposalId, token }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(status: "approved" | "rejected") {
    setLoading(status === "approved" ? "approve" : "reject");
    setError(null);
    try {
      const res = await fetch("/api/proposals/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, token, status, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis.");
      router.push(`/${token}/proposals`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
      setLoading(null);
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-surface-2)",
        border: "1px solid var(--border-default)",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <h2
        className="text-[14px] font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Jouw reactie
      </h2>
      <div className="space-y-4">
        <div>
          <label
            className="block text-[12px] font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
            htmlFor="note"
          >
            Toelichting (optioneel)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Voeg een toelichting toe bij je beslissing…"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "var(--text-primary)",
              fontSize: "13px",
              outline: "none",
              width: "100%",
              resize: "vertical",
            }}
          />
        </div>
        {error && (
          <p className="text-[13px]" style={{ color: "#ef4444" }}>
            {error}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={() => respond("approved")}
            disabled={!!loading}
            style={{
              background: "var(--accent-500)",
              color: "white",
              borderRadius: "8px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading === "reject" ? 0.5 : 1,
              transition: "all 0.15s",
            }}
          >
            {loading === "approve" ? "Bezig…" : "Goedkeuren"}
          </button>
          <button
            onClick={() => respond("rejected")}
            disabled={!!loading}
            style={{
              background: "#ef444415",
              color: "#ef4444",
              border: "1px solid #ef444430",
              borderRadius: "8px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading === "approve" ? 0.5 : 1,
              transition: "all 0.15s",
            }}
          >
            {loading === "reject" ? "Bezig…" : "Afwijzen"}
          </button>
        </div>
      </div>
    </div>
  );
}
