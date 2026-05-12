import {
  Building2,
  ChevronRight,
  CreditCard,
  FileText,
  GaugeCircle,
  Inbox,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: false },
  { icon: Building2, label: "Agencies", count: 12, active: false },
  { icon: Users, label: "Clients", count: 84, active: false },
  { icon: Inbox, label: "Queue", count: 5, active: true },
  { icon: Sparkles, label: "Services", active: false },
  { icon: FileText, label: "Reports", active: false },
  { icon: CreditCard, label: "Billing", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const requests: {
  status: "pending" | "in_progress" | "done";
  service: string;
  serviceIcon: typeof Sparkles;
  agency: string;
  client: string;
  time: string;
}[] = [
  { status: "pending", service: "Meta Ads Audit", serviceIcon: GaugeCircle, agency: "Northbeam", client: "Bol BH's", time: "2m ago" },
  { status: "in_progress", service: "Static Remix", serviceIcon: Sparkles, agency: "Forge Studio", client: "Slaapwijs", time: "14m ago" },
  { status: "pending", service: "SEO Audit", serviceIcon: FileText, agency: "Lumen", client: "Comfortabel.nl", time: "1u ago" },
  { status: "done", service: "Brand DNA", serviceIcon: Sparkles, agency: "Atelier", client: "Hopper Lingerie", time: "3u ago" },
  { status: "done", service: "Meta Ads Audit", serviceIcon: GaugeCircle, agency: "Northbeam", client: "Restful", time: "Vandaag" },
];

const statusToTone = {
  pending: "warning",
  in_progress: "info",
  done: "success",
} as const;

const statusToLabel = {
  pending: "WACHT",
  in_progress: "BEZIG",
  done: "KLAAR",
} as const;

export function QueueMockup() {
  return (
    <div className="grid grid-cols-[200px_1fr] min-h-[480px] text-[13px]">
      {/* Sidebar */}
      <aside className="border-r border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-4">
          <div className="size-6 rounded-md bg-[var(--accent-500)] grid place-items-center">
            <span className="text-white text-[11px] font-semibold">W</span>
          </div>
          <span className="font-medium">willoe</span>
          <Badge tone="neutral" className="ml-auto h-[18px] px-1.5 text-[9px]">
            ADMIN
          </Badge>
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-2 h-8 rounded-md transition-colors ${
                  item.active
                    ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                <Icon className="size-[15px]" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`ml-auto text-[10px] tabular ${
                      item.active
                        ? "text-[var(--accent-500)] font-medium"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="p-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[20px] font-medium tracking-display">Queue</h3>
            <p className="text-[var(--text-tertiary)] text-xs mt-0.5">
              5 wachtend &middot; 1 bezig &middot; gemiddelde turnaround 14u
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)]">
              <Search className="size-3.5 text-[var(--text-tertiary)]" />
              <span className="text-[var(--text-tertiary)] text-xs">Zoeken...</span>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 mb-4">
          {["Alles", "Wachtend", "Bezig", "Klaar"].map((label, i) => (
            <div
              key={label}
              className={`px-2.5 h-7 rounded-md text-[11px] flex items-center ${
                i === 1
                  ? "bg-[var(--accent-glow)] text-[var(--accent-500)] font-medium"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Queue table */}
        <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-surface)]">
          <div className="grid grid-cols-[80px_1fr_140px_140px_80px_60px] px-4 h-9 bg-[var(--bg-surface-2)] border-b border-[var(--border-default)] items-center text-[10px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium">
            <div>Status</div>
            <div>Service</div>
            <div>Agency</div>
            <div>Klant</div>
            <div>Tijd</div>
            <div></div>
          </div>
          {requests.map((r, i) => {
            const Icon = r.serviceIcon;
            return (
              <div
                key={i}
                className="grid grid-cols-[80px_1fr_140px_140px_80px_60px] px-4 h-12 items-center border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                <div>
                  <Badge tone={statusToTone[r.status]} className="h-[18px] px-1.5 text-[9px]">
                    {statusToLabel[r.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-md bg-[var(--bg-surface-2)] grid place-items-center">
                    <Icon className="size-3.5 text-[var(--text-secondary)]" />
                  </div>
                  <span className="text-[13px]">{r.service}</span>
                </div>
                <div className="text-[var(--text-secondary)]">{r.agency}</div>
                <div className="text-[var(--text-secondary)]">{r.client}</div>
                <div className="text-[var(--text-tertiary)] text-xs tabular">{r.time}</div>
                <div className="flex justify-end">
                  <ChevronRight className="size-4 text-[var(--text-tertiary)]" />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
