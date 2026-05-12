import { Bell, Command, Search } from "lucide-react";

export function Topbar({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="h-14 border-b border-[var(--border-default)] px-6 flex items-center gap-4 bg-[var(--bg-canvas)] sticky top-0 z-30">
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-medium tracking-tight truncate text-[var(--text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="text-[11px] text-[var(--text-tertiary)] truncate -mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 h-8 px-2.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[12px] text-[var(--text-tertiary)] min-w-[220px]">
          <Search className="size-3.5" />
          <span>Zoeken...</span>
          <span className="ml-auto inline-flex items-center gap-0.5 text-[10px]">
            <Command className="size-3" />K
          </span>
        </div>
        <button
          className="size-8 rounded-md grid place-items-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>
        {action}
      </div>
    </header>
  );
}
