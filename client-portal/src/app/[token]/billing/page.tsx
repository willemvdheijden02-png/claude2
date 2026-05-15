import { notFound } from "next/navigation";
import { eq, and, sum, inArray, desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  draft: "Concept",
  sent: "Verzonden",
  paid: "Betaald",
  overdue: "Verlopen",
};

const statusColors: Record<string, string> = {
  draft: "#6b7280",
  sent: "#f59e0b",
  paid: "#10b981",
  overdue: "#ef4444",
};

function formatCents(cents: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export default async function BillingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [client] = await db
    .select({ id: schema.clients.id })
    .from(schema.clients)
    .where(eq(schema.clients.portalToken, token))
    .limit(1);

  if (!client) notFound();

  const invoices = await db
    .select({
      id: schema.invoices.id,
      invoiceNumber: schema.invoices.invoiceNumber,
      status: schema.invoices.status,
      issueDate: schema.invoices.issueDate,
      dueDate: schema.invoices.dueDate,
      totalCents: schema.invoices.totalCents,
      description: schema.invoices.description,
      pdfUrl: schema.invoices.pdfUrl,
    })
    .from(schema.invoices)
    .where(eq(schema.invoices.clientId, client.id))
    .orderBy(desc(schema.invoices.issueDate));

  const [{ total }] = await db
    .select({ total: sum(schema.invoices.totalCents) })
    .from(schema.invoices)
    .where(eq(schema.invoices.clientId, client.id));

  const [{ paid }] = await db
    .select({ paid: sum(schema.invoices.totalCents) })
    .from(schema.invoices)
    .where(
      and(eq(schema.invoices.clientId, client.id), eq(schema.invoices.status, "paid"))
    );

  const [{ open }] = await db
    .select({ open: sum(schema.invoices.totalCents) })
    .from(schema.invoices)
    .where(
      and(
        eq(schema.invoices.clientId, client.id),
        inArray(schema.invoices.status, ["sent", "overdue"])
      )
    );

  const stats = [
    { label: "Totaal gefactureerd", value: formatCents(Number(total ?? 0)) },
    { label: "Betaald",             value: formatCents(Number(paid ?? 0)) },
    { label: "Openstaand",          value: formatCents(Number(open ?? 0)) },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Facturen
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Overzicht van al je facturen
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-default)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {s.label}
            </p>
            <p
              className="text-2xl font-semibold mt-1"
              style={{ color: "var(--text-primary)" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Invoice table */}
      {invoices.length === 0 ? (
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
            Nog geen facturen.
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
          {/* Header */}
          <div
            className="grid grid-cols-12 px-5 py-2.5 text-[11px] font-medium"
            style={{
              color: "var(--text-tertiary)",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            <span className="col-span-2">Nummer</span>
            <span className="col-span-3">Datum</span>
            <span className="col-span-4">Omschrijving</span>
            <span className="col-span-2 text-right">Bedrag</span>
            <span className="col-span-1 text-right">Status</span>
          </div>
          {invoices.map((inv, idx) => (
            <div
              key={inv.id}
              className="grid grid-cols-12 items-center px-5 py-3.5"
              style={{
                borderTop: idx > 0 ? "1px solid var(--border-default)" : undefined,
              }}
            >
              <span
                className="col-span-2 text-[12px] font-mono"
                style={{ color: "var(--text-secondary)" }}
              >
                {inv.invoiceNumber ?? "—"}
              </span>
              <span className="col-span-3 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                {inv.issueDate
                  ? new Date(inv.issueDate).toLocaleDateString("nl-NL")
                  : "—"}
              </span>
              <span
                className="col-span-4 text-[13px] truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {inv.description ?? "—"}
              </span>
              <span
                className="col-span-2 text-[13px] font-medium text-right"
                style={{ color: "var(--text-primary)" }}
              >
                {formatCents(inv.totalCents)}
              </span>
              <div className="col-span-1 flex justify-end">
                {inv.pdfUrl ? (
                  <a
                    href={inv.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium px-2 py-1 rounded-full"
                    style={{
                      background: `${statusColors[inv.status] ?? "#6b7280"}22`,
                      color: statusColors[inv.status] ?? "#6b7280",
                      textDecoration: "none",
                    }}
                  >
                    {statusLabels[inv.status] ?? inv.status}
                  </a>
                ) : (
                  <span
                    className="text-[11px] font-medium px-2 py-1 rounded-full"
                    style={{
                      background: `${statusColors[inv.status] ?? "#6b7280"}22`,
                      color: statusColors[inv.status] ?? "#6b7280",
                    }}
                  >
                    {statusLabels[inv.status] ?? inv.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
