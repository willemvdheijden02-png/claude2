"use client";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 40, fontFamily: "monospace", background: "#0a0a0f", color: "#e2e8f0", minHeight: "100vh" }}>
      <h2 style={{ color: "#f87171", marginBottom: 16 }}>Portal fout (tijdelijke debug pagina)</h2>
      <pre style={{ background: "#1e1e2e", padding: 16, borderRadius: 8, overflow: "auto", color: "#fbbf24", fontSize: 13 }}>
        {error?.message ?? "Geen error message beschikbaar"}
      </pre>
      {error?.digest && (
        <pre style={{ background: "#1e1e2e", padding: 16, borderRadius: 8, marginTop: 8, color: "#94a3b8", fontSize: 11 }}>
          digest: {error.digest}
        </pre>
      )}
      <pre style={{ background: "#1e1e2e", padding: 16, borderRadius: 8, marginTop: 8, color: "#64748b", fontSize: 11, overflow: "auto" }}>
        {error?.stack ?? "Geen stack trace"}
      </pre>
      <button onClick={reset} style={{ marginTop: 16, background: "#2563eb", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer" }}>
        Opnieuw proberen
      </button>
    </div>
  );
}
