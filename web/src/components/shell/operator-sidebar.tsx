"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Repeat,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/agencies", icon: Building2, label: "Agencies", count: 12 },
  { href: "/admin/clients", icon: Users, label: "Clients", count: 84 },
  { href: "/admin/queue", icon: Inbox, label: "Queue", count: 5 },
  { href: "/admin/services", icon: Sparkles, label: "Services" },
  { href: "/admin/reports", icon: FileText, label: "Reports" },
  { href: "/admin/billing", icon: CreditCard, label: "Billing" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function OperatorSidebar({ hasAgency }: { hasAgency?: boolean }) {
  const pathname = usePathname();
  return (
    <aside className="w-[220px] shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-surface)] p-3 flex flex-col">
      <Link href="/admin" className="flex items-center gap-2 px-2 py-1.5 mb-4">
        <div className="size-7 rounded-md bg-[var(--accent-500)] grid place-items-center">
          <span className="text-white text-sm font-semibold">W</span>
        </div>
        <span className="font-medium tracking-display">willoe</span>
        <Badge tone="neutral" className="ml-auto h-[18px] px-1.5 text-[9px]">
          ADMIN
        </Badge>
      </Link>
      <nav className="space-y-0.5 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2 h-8 rounded-md text-[13px] transition-colors",
                active
                  ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              )}
            >
              <Icon className="size-[15px]" />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={cn(
                    "ml-auto text-[10px] tabular",
                    active
                      ? "text-[var(--accent-500)] font-medium"
                      : "text-[var(--text-tertiary)]"
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      {hasAgency && (
        <Link
          href="/portal"
          className="flex items-center gap-2 px-2 h-8 rounded-md text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors mb-2"
          title="Wissel naar agency view"
        >
          <Repeat className="size-[14px]" />
          Wissel naar Agency
        </Link>
      )}
      <div className="border-t border-[var(--border-default)] pt-3 mt-3">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="size-7 rounded-full bg-[var(--bg-surface-2)] grid place-items-center text-[11px] font-medium text-[var(--text-secondary)]">
            W
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] truncate text-[var(--text-primary)]">Willem</div>
            <div className="text-[10px] text-[var(--text-tertiary)] truncate">Operator</div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="size-7 rounded-md grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              aria-label="Uitloggen"
              title="Uitloggen"
            >
              <LogOut className="size-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
