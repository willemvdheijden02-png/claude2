"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bot,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plug,
  Receipt,
  Repeat,
  Settings,
  Sparkles,
  Users,
  Video,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/login/actions";

const items = [
  { href: "/portal", icon: LayoutDashboard, label: "Overzicht" },
  { href: "/portal/clients", icon: Users, label: "Klanten" },
  { href: "/portal/ads", icon: BarChart3, label: "Ads Manager" },
  { href: "/portal/services", icon: Sparkles, label: "Service-catalogus" },
  { href: "/portal/studio", icon: Video, label: "Studio" },
  { href: "/portal/agents", icon: Bot, label: "Agents" },
  { href: "/portal/requests", icon: Inbox, label: "Aanvragen" },
  { href: "/portal/reports", icon: FileText, label: "Rapporten" },
  { href: "/portal/billing", icon: Receipt, label: "Facturatie" },
  { href: "/portal/integrations", icon: Plug, label: "Integraties" },
  { href: "/portal/settings", icon: Settings, label: "Instellingen" },
];

export function AgencySidebar({
  agencyName,
  agencyInitial,
  userName,
  userRole,
  isOperator,
  plan,
}: {
  agencyName: string;
  agencyInitial: string;
  userName: string;
  userRole: string;
  isOperator?: boolean;
  plan?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Sluit drawer bij navigatie
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Voorkom scroll achter drawer
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile hamburger — fixed top-left */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-2.5 left-3 z-40 size-9 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)] grid place-items-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
        aria-label="Menu openen"
      >
        <Menu className="size-4" />
      </button>

      {/* Overlay (mobile only when open) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-surface)] p-3 flex flex-col",
          // Desktop: static, altijd zichtbaar
          "md:relative md:flex md:w-[220px] md:translate-x-0",
          // Mobile: fixed overlay, slide in/out
          "fixed inset-y-0 left-0 w-[260px] z-50 transition-transform",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <Link href="/portal" className="flex items-center gap-2 px-2 py-1.5">
            <div className="size-7 rounded-md bg-[var(--accent-500)] grid place-items-center">
              <span className="text-white text-sm font-semibold">{agencyInitial}</span>
            </div>
            <span className="font-medium tracking-display truncate">{agencyName}</span>
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
              item.href === "/portal"
                ? pathname === "/portal"
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
              </Link>
            );
          })}
        </nav>
        {isOperator && (
          <Link
            href="/admin"
            className="flex items-center gap-2 px-2 h-8 rounded-md text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors mb-2"
            title="Wissel naar operator cockpit"
          >
            <Repeat className="size-[14px]" />
            Wissel naar Admin
          </Link>
        )}
        <div className="border-t border-[var(--border-default)] pt-3 mt-3">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="size-7 rounded-full bg-[var(--bg-surface-2)] grid place-items-center text-[11px] font-medium text-[var(--text-secondary)]">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] truncate text-[var(--text-primary)]">{userName}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] truncate">{userRole}</div>
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
          <Badge tone="neutral" className="h-[18px] px-1.5 text-[9px] w-full justify-center mt-2">
            {(plan ?? "trial").toUpperCase()}
          </Badge>
        </div>
      </aside>
    </>
  );
}
