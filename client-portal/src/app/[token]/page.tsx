import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, and, sum, count, desc, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatCents(cents: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
}

const statusLabels: Record<string, string> = {
  pending: "Ingediend",
  in_progress: "Bezig",
  done: "Afgerond",
  failed: "Mislukt",
  cancelled: "Geannuleerd",
};

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  in_progress: "#8b5cf6",
  done: "#10b981",
  failed: "#ef4444",
  cancelled: "#6b7280",
};

export default async function OverviewPage({
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

  // Total spent (paid invoices)
  const [{ total }] = await db
    .select({ total: sum(schema.invoices.totalCents) })
    .from(schema.invoices)
    .where(
      and(
        eq(schema.invoices.clientId, client.id),
        eq(schema.invoices.status, "paid")
      )
    );

  // Active orders
  const [{ activeCount }] = await db
    .select({ activeCount: count() })
    .from(schema.serviceRequests)
    .where(
      and(
        eq(schema.serviceRequests.clientId, client.id),
        inArray(schema.serviceRequests.status, ["pending", "in_progress"])
      )
    );

  // Unpaid invoices
  const [{ unpaidCount }] = await db
    .select({ unpaidCount: count() })
    .from(schema.invoices)
    .where(
      and(
        eq(schema.invoices.clientId, client.id),
        inArray(schema.invoices.status, ["sent", "overdue"])
      )
    );

  // Recent orders
  const recentOrders = await db
    .select({
      id: schema.serviceRequests.id,
      status: schema.serviceRequests.status,
      createdAt: schema.serviceRequests.createdAt,
      serviceName: schema.services.displayName,
    })
    .from(schema.serviceRequests)
    .innerJoin(schema.services, eq(schema.serviceRequests.serviceId, schema.services.id))
    .where(eq(schema.serviceRequests.clientId, client.id))
    .orderBy(desc(schema.serviceRequests.createdAt))
    .limit(4);

  // Recent chat messages
  const chatRoom = await db
    .select({ id: schema.chatRooms.id })
    .from(schema.chatRooms)
    .where(eq(schema.chatRooms.clientId, client.id))
    .limit(1);

  const recentMessages = chatRoom[0]
    ? await db
        .select({
          id: schema.chatMessages.id,
          content: schema.chatMessages.content,
          senderType: schema.chatMessages.senderType,
          senderName: schema.chatMessages.senderName,
          createdAt: schema.chatMessages.createdAt,
        })
        .from(schema.chatMessages)
        .where(eq(schema.chatMessages.roomId, chatRoom[0].id))
        .orderBy(desc(schema.chatMessages.createdAt))
        .limit(4)
    : [];

  const stats = [
    { label: "Totaal uitgegeven", value: formatCents(Number(total ?? 0)) },
    { label: "Actieve opdrachten", value: String(activeCount) },
    { label: "Openstaande facturen", value: String(unpaidCount) },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Welkom, {client.displayName}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Hier zie je een overzicht van je account.
        </p>
      </div>

      {/* Stat cards */}
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

      {/* New order CTA */}
      <Link
        href={`/${token}/orders/new`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "var(--accent-500)",
          color: "white",
          borderRadius: "8px",
          padding: "10px 20px",
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        + Nieuwe Opdracht indienen
      </Link>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <div
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
              Recente opdrachten
            </h2>
            <Link
              href={`/${token}/orders`}
              className="text-[12px]"
              style={{ color: "var(--accent-500)" }}
            >
              Alle opdrachten →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              Nog geen opdrachten ingediend.
            </p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/${token}/orders/${order.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-hover transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  <div>
                    <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                      {order.serviceName}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className="text-[11px] font-medium px-2 py-1 rounded-full"
                    style={{
                      background: `${statusColors[order.status] ?? "#6b7280"}22`,
                      color: statusColors[order.status] ?? "#6b7280",
                    }}
                  >
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
              Recente berichten
            </h2>
            <Link
              href={`/${token}/chat`}
              className="text-[12px]"
              style={{ color: "var(--accent-500)" }}
            >
              Open chat →
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              Nog geen berichten.
            </p>
          ) : (
            <div className="space-y-2">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="py-2 px-3 rounded-lg"
                  style={{ background: "var(--bg-surface)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                      {msg.senderName}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p
                    className="text-[12px] truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
