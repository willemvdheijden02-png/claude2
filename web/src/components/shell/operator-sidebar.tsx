"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Repeat,
  Settings,
  Sparkles,
  Users,
  X,
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-2.5 left-3 z-40 size-9 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)] grid place-items-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
        aria-label="Menu openen"
      >
        <Menu className="size-4" />
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-surface)] p-3 flex flex-col",
          "md:relative md:flex md:w-[220px] md:translate-x-0",
          "fixed inset-y-0 left-0 w-[260px] z-50 transition-transform",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <Link href="/admin" className="flex items-center gap-2 px-2 py-1.5">
            <div className="size-7 rounded-md bg-[var(--accent-500)] grid place-items-center">
              <span className="text-white text-sm font-semibold">W</span>
            </div>
            <span className="font-medium tracking-display">willoe</span>
            <Badge tone="neutral" className="ml-auto h-[18px] px-1.5 text-[9px]">
              ADMIN
            </Badge>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="md:hidden size-8 rounded-md grid place-items-center text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-hover)]"
            aria-label="Menu sluiten"
          >
            <X className="size-4" />
          </button>
        </div>
        <nav className="space-y-0.5 flex-1 overflow-y-auto">
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
    </>
  );
}
