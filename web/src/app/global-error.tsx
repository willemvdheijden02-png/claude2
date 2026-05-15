"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="nl">
      <body style={{ margin: 0, background: "#0a0a0f", color: "#e2e8f0", fontFamily: "monospace", padding: 32 }}>
        <h2 style={{ color: "#f87171" }}>Fout (debug)</h2>
        <pre style={{ background: "#1e1e2e", padding: 16, borderRadius: 8, color: "#fbbf24", fontSize: 13, overflow: "auto" }}>
          {error?.message || "Geen message"}
        </pre>
        <pre style={{ background: "#1e1e2e", padding: 16, borderRadius: 8, color: "#64748b", fontSize: 11, overflow: "auto", marginTop: 8 }}>
          {error?.stack || "Geen stack"}
        </pre>
        {error?.digest && (
          <p style={{ color: "#94a3b8", fontSize: 11 }}>digest: {error.digest}</p>
        )}
      </body>
    </html>
  );
}
