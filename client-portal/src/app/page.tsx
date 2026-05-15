import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const clients = await db
    .select({
      id: schema.clients.id,
      displayName: schema.clients.displayName,
      portalToken: schema.clients.portalToken,
      agencyId: schema.clients.agencyId,
    })
    .from(schema.clients)
    .where(eq(schema.clients.portalEnabled, true))
    .limit(50);

  // Fetch agency names
  const agencies = await db
    .select({ id: schema.agencies.id, displayName: schema.agencies.displayName, primaryColor: schema.agencies.primaryColor })
    .from(schema.agencies);

  const agencyMap = Object.fromEntries(agencies.map((a) => [a.id, a]));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-canvas)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "var(--accent-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "22px",
            }}
          >
            W
          </div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "6px",
            }}
          >
            Klantportaal
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Selecteer een klant om het portaal te openen
          </p>
        </div>

        {/* Client list */}
        {clients.length === 0 ? (
          <div
            style={{
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-default)",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              color: "var(--text-tertiary)",
              fontSize: "13px",
            }}
          >
            Geen klanten met actief portaal gevonden.
            <br />
            Activeer een klantportaal via het agency dashboard.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {clients.map((client) => {
              const agency = agencyMap[client.agencyId];
              const accent = agency?.primaryColor || "#10b981";
              return (
                <Link
                  key={client.id}
                  href={`/${client.portalToken}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "10px",
                    textDecoration: "none",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = accent;
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-surface-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {client.displayName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "2px",
                      }}
                    >
                      {client.displayName}
                    </p>
                    {agency && (
                      <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                        via {agency.displayName}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "var(--text-tertiary)" }}>
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
