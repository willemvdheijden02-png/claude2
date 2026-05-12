import { cn } from "@/lib/utils";

export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.5),0_0_120px_-30px_var(--accent-glow)]",
        className
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 h-10 border-b border-[var(--border-default)] bg-[var(--bg-surface-2)]">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-[#ff5f57]" />
          <div className="size-2.5 rounded-full bg-[#febc2e]" />
          <div className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 h-6 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)] min-w-[280px] justify-center">
            <span className="size-1.5 rounded-full bg-[var(--status-success)]" />
            {url}
          </div>
        </div>
        <div className="size-5" />
      </div>
      {/* Content */}
      <div className="bg-[var(--bg-canvas)]">{children}</div>
    </div>
  );
}
