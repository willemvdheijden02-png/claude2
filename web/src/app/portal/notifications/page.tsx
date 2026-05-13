import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Button } from "@/components/ui/button";
import { getCurrentContext } from "@/lib/auth/current";
import { listNotifications } from "@/lib/notifications";
import { markAllNotificationsRead } from "./actions";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  request_done: "Aanvraag klaar",
  request_failed: "Aanvraag mislukt",
  invoice_paid: "Factuur betaald",
  invoice_overdue: "Factuur te laat",
  trial_expiring: "Trial verloopt",
  meta_token_expiring: "Meta token verloopt",
  client_added: "Nieuwe klant",
  integration_invalid: "Integratie probleem",
  general: "Algemeen",
};

function relativeTime(date: Date | string | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "zojuist";
  if (min < 60) return `${min} min geleden`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} uur geleden`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} dag${days === 1 ? "" : "en"} geleden`;
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export default async function NotificationsPage() {
  const ctx = await getCurrentContext();
  if (!ctx?.agency) redirect("/login");

  const items = await listNotifications(ctx.agency.id, ctx.authUser.id);
  const unreadCount = items.filter((n) => !n.readAt).length;

  return (
    <>
      <Topbar
        title="Notificaties"
        description={`${unreadCount} ongelezen · ${items.length} totaal`}
        action={
          unreadCount > 0 ? (
            <form action={markAllNotificationsRead}>
              <Button type="submit" variant="secondary" size="sm">
                <CheckCheck className="size-3.5 mr-1.5" />
                Alles als gelezen
              </Button>
            </form>
          ) : null
        }
      />
      <div className="p-4 md:p-6 max-w-3xl">
        {items.length === 0 ? (
          <div className="border border-[var(--border-default)] rounded-lg p-12 text-center bg-[var(--bg-surface)]">
            <Bell className="size-8 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-[14px] text-[var(--text-secondary)]">
              Geen notificaties. Zodra er aanvragen worden geleverd of facturen
              binnenkomen, zie je ze hier.
            </p>
          </div>
        ) : (
          <div className="border border-[var(--border-default)] rounded-lg bg-[var(--bg-surface)] divide-y divide-[var(--border-default)] overflow-hidden">
            {items.map((n) => {
              const unread = !n.readAt;
              const content = (
                <div className="flex items-start gap-3 px-5 py-4 hover:bg-[var(--bg-surface-hover)] transition-colors">
                  <div className="mt-1.5 shrink-0">
                    {unread ? (
                      <div className="size-2 rounded-full bg-[var(--accent-500)]" />
                    ) : (
                      <Check className="size-3.5 text-[var(--text-tertiary)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium">
                        {TYPE_LABELS[n.type] ?? n.type}
                      </span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        · {relativeTime(n.createdAt)}
                      </span>
                    </div>
                    <div
                      className={`text-[14px] ${
                        unread
                          ? "text-[var(--text-primary)] font-medium"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {n.title}
                    </div>
                    {n.body && (
                      <div className="text-[13px] text-[var(--text-tertiary)] mt-0.5 line-clamp-2">
                        {n.body}
                      </div>
                    )}
                  </div>
                </div>
              );

              return n.link ? (
                <Link key={n.id} href={n.link} className="block">
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
