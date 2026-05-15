import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

type Service = typeof schema.services.$inferSelect;

const categoryLabel: Record<string, string> = {
  audit: "Audit",
  creative: "Creative",
  seo: "SEO",
  strategy: "Strategie",
  onboarding: "Onboarding",
  studio: "Studio",
};

const categoryOrder = ["strategy", "creative", "audit", "seo", "studio", "onboarding"];

function formatPrice(priceCents: number, turnaroundHours: number): string {
  const euros = Math.round(priceCents / 100);
  const suffix = turnaroundHours >= 168 ? " / mnd" : "";
  return `€ ${euros.toLocaleString("nl-NL")}${suffix}`;
}

function ServiceCard({ service, token }: { service: Service; token: string }) {
  const lines = service.packageIncludes
    ? service.packageIncludes.split("\n").filter((l) => l.trim().length > 0)
    : [];
  const visibleLines = lines.slice(0, 5);
  const hasMore = lines.length > 5;

  return (
    <div
      style={{
        background: "var(--bg-surface-2)",
        border: "1px solid var(--border-default)",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: "999px",
            background: "color-mix(in srgb, var(--accent-500) 12%, transparent)",
            color: "var(--accent-500)",
          }}
        >
          {categoryLabel[service.category] ?? service.category}
        </span>
        {service.isPackage && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "2px 8px",
              borderRadius: "999px",
              background: "color-mix(in srgb, var(--accent-500) 20%, transparent)",
              color: "var(--accent-500)",
              border: "1px solid color-mix(in srgb, var(--accent-500) 30%, transparent)",
            }}
          >
            Pakket
          </span>
        )}
      </div>

      <p
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "6px",
          lineHeight: 1.3,
        }}
      >
        {service.displayName}
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          marginBottom: "16px",
        }}
      >
        {service.description}
      </p>

      {/* Package includes */}
      {service.isPackage && visibleLines.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--border-default)",
            paddingTop: "12px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "8px",
            }}
          >
            Bevat:
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {visibleLines.map((line, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "6px",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                <span style={{ color: "var(--accent-500)", marginTop: "1px", flexShrink: 0 }}>
                  ✓
                </span>
                {line.replace(/^[-*•]\s*/, "")}
              </li>
            ))}
            {hasMore && (
              <li
                style={{
                  fontSize: "11px",
                  color: "var(--text-tertiary)",
                  paddingLeft: "18px",
                }}
              >
                + {lines.length - 5} meer...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Footer: price + CTA */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "16px",
          borderTop: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {formatPrice(service.priceCents, service.estimatedTurnaroundHours)}
        </span>
        <a
          href={`/${token}/orders/new?serviceId=${service.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "8px 14px",
            background: "var(--accent-500)",
            color: "white",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}
        >
          Bestellen →
        </a>
      </div>
    </div>
  );
}

export default async function TarievenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Verify token belongs to a valid, enabled client
  const [client] = await db
    .select({ id: schema.clients.id, agencyId: schema.clients.agencyId })
    .from(schema.clients)
    .where(eq(schema.clients.portalToken, token))
    .limit(1);

  if (!client) notFound();

  const services = await db
    .select()
    .from(schema.services)
    .where(
      and(
        eq(schema.services.agencyId, client.agencyId),
        eq(schema.services.isActive, true)
      )
    )
    .orderBy(schema.services.category, schema.services.priceCents);

  // Group by category, preserving logical order
  const grouped = new Map<string, Service[]>();
  for (const order of categoryOrder) {
    const items = services.filter((s) => s.category === order);
    if (items.length > 0) grouped.set(order, items);
  }
  // Add any categories not in categoryOrder
  for (const s of services) {
    if (!grouped.has(s.category)) {
      grouped.set(s.category, services.filter((x) => x.category === s.category));
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Tarieven & Diensten
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Bekijk onze diensten en vraag direct een opdracht aan.
        </p>
      </div>

      {services.length === 0 && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-tertiary)",
            fontSize: "14px",
          }}
        >
          Het agency heeft nog geen diensten toegevoegd.
        </div>
      )}

      {Array.from(grouped.entries()).map(([category, items]) => (
        <section key={category} className="space-y-4">
          <h2
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              borderBottom: "1px solid var(--border-default)",
              paddingBottom: "8px",
            }}
          >
            {categoryLabel[category] ?? category}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {items.map((svc) => (
              <ServiceCard key={svc.id} service={svc} token={token} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
