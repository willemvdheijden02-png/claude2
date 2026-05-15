"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Bot,
  ClipboardCheck,
  FolderOpen,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Plus,
  Receipt,
  Settings,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  token: string;
  clientName: string;
  agencyName: string;
  agencyLogoUrl?: string;
  accentColor: string;
  unreadCount?: number;
  pendingCount?: number;
}

export function Sidebar({
  token,
  clientName,
  agencyName,
  agencyLogoUrl,
  accentColor,
  unreadCount = 0,
  pendingCount = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const base = `/${token}`;

  const nav = [
    { href: base,                   icon: LayoutDashboard, label: "Overzicht",       exact: true,  badge: 0,            highlight: false },
    { href: `${base}/tarieven`,     icon: Tag,             label: "Tarieven",        exact: false, badge: 0,            highlight: false },
    { href: `${base}/orders`,       icon: ShoppingBag,     label: "Mijn Opdrachten", exact: false, badge: 0,            highlight: false },
    { href: `${base}/orders/new`,   icon: Plus,            label: "Nieuwe Opdracht", exact: true,  badge: 0,            highlight: true  },
    { href: `${base}/chat`,         icon: MessageSquare,   label: "Chat",            exact: false, badge: unreadCount,  highlight: false },
    { href: `${base}/documents`,    icon: FolderOpen,      label: "Documenten",      exact: false, badge: 0,            highlight: false },
    { href: `${base}/billing`,      icon: Receipt,         label: "Facturen",        exact: false, badge: 0,            highlight: false },
    { href: `${base}/proposals`,    icon: ClipboardCheck,  label: "Voorstellen",     exact: false, badge: pendingCount, highlight: false },
    { href: `${base}/bot`,           icon: Bot,             label: "Hulp",            exact: false, badge: 0,            highlight: false },
    { href: `${base}/instellingen`, icon: Settings,        label: "Instellingen",    exact: false, badge: 0,            highlight: false },
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full" style={{ background: "var(--bg-surface)" }}>
        {/* Agency logo/name */}
        <div
          className="flex items-center gap-2.5 px-4 py-4 border-b"
          style={{ borderColor: "var(--border-default)" }}
        >
          {agencyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agencyLogoUrl} alt={agencyName} className="h-7 w-auto" />
          ) : (
            <div
              className="size-8 rounded-lg grid place-items-center text-white text-[13px] font-bold shrink-0"
              style={{ background: accentColor }}
            >
              {agencyName.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className="text-[13px] font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {agencyName}
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 h-9 rounded-lg text-[13px] font-medium transition-all relative",
                  active ? "border-l-2" : "hover:bg-surface-hover",
                  item.highlight && !active && "opacity-80"
                )}
                style={{
                  color: active ? accentColor : "var(--text-secondary)",
                  borderLeftColor: active ? accentColor : "transparent",
                  background: active
                    ? `color-mix(in srgb, ${accentColor} 8%, transparent)`
                    : undefined,
                  paddingLeft: active ? "10px" : undefined,
                }}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white min-w-[18px] text-center"
                    style={{ background: accentColor }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Client card at bottom */}
        <div
          className="px-3 py-3 border-t"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="size-8 rounded-full grid place-items-center text-[12px] font-bold text-white shrink-0"
              style={{ background: "var(--bg-surface-2)" }}
            >
              {clientName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p
                className="text-[12px] font-medium truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {clientName}
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                Klant · {agencyName}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-[200px] shrink-0 flex-col h-screen sticky top-0"
        style={{ borderRight: "1px solid var(--border-default)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 size-9 grid place-items-center rounded-lg"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
        }}
        aria-label="Menu openen"
      >
        <Menu className="size-4" style={{ color: "var(--text-primary)" }} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <aside
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-[200px]"
            style={{ borderRight: "1px solid var(--border-default)" }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 size-7 grid place-items-center rounded-md"
              style={{ background: "var(--bg-surface-2)" }}
              aria-label="Menu sluiten"
            >
              <X className="size-3.5" style={{ color: "var(--text-secondary)" }} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
