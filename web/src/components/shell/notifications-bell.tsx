"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NotificationsBell() {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/notifications/count", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (!cancelled) setCount(data.count ?? 0);
      } catch {
        // ignore
      }
    }
    load();
    const id = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pathname]);

  return (
    <Link
      href="/portal/notifications"
      className="relative size-8 rounded-md grid place-items-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
      aria-label="Notificaties"
    >
      <Bell className="size-4" />
      {count > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--accent-500)] text-[10px] font-medium text-white grid place-items-center leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
