import {
  ArrowUpRight,
  FileText,
  GaugeCircle,
  PenTool,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    icon: GaugeCircle,
    name: "Meta Ads Audit",
    desc: "46 checks op pixel, creative en account",
    eta: "~24u",
    price: "Inbegrepen",
  },
  {
    icon: PenTool,
    name: "Static Remix",
    desc: "Concurrent ads → on-brand recreaties",
    eta: "~12u",
    price: "+€49",
  },
  {
    icon: TrendingUp,
    name: "Google Ads Audit",
    desc: "74 checks op Search, PMax en YouTube",
    eta: "~24u",
    price: "Inbegrepen",
  },
  {
    icon: Search,
    name: "SEO Audit",
    desc: "Technical, content, schema en E-E-A-T",
    eta: "~36u",
    price: "+€99",
  },
  {
    icon: Sparkles,
    name: "Brand DNA",
    desc: "Visuele identiteit + tone of voice extract",
    eta: "~6u",
    price: "Inbegrepen",
  },
  {
    icon: FileText,
    name: "Onboarding Pipeline",
    desc: "Volledig pitch + welcome rapport",
    eta: "~24u",
    price: "Inbegrepen",
  },
];

export function PortalMockup() {
  return (
    <div className="p-6 min-h-[420px] text-[13px]">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[20px] font-medium tracking-display">Service-catalogus</h3>
          <p className="text-[var(--text-tertiary)] text-xs mt-0.5">
            Activeer een service voor één van je klanten
          </p>
        </div>
        <Badge tone="accent" className="h-6 px-2">
          NORTHBEAM AGENCY
        </Badge>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-4 border-b border-[var(--border-default)] -mx-6 px-6">
        {["Alles", "Audit", "Creative", "SEO", "Strategie"].map((label, i) => (
          <div
            key={label}
            className={`px-3 h-9 text-[12px] flex items-center border-b-2 -mb-px ${
              i === 0
                ? "border-[var(--accent-500)] text-[var(--text-primary)] font-medium"
                : "border-transparent text-[var(--text-tertiary)]"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Service grid */}
      <div className="grid grid-cols-3 gap-3">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.name}
              className="border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)] p-4 hover:border-[var(--border-strong)] transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="size-9 rounded-md bg-[var(--bg-surface-2)] grid place-items-center group-hover:bg-[var(--accent-glow)] transition-colors">
                  <Icon className="size-[16px] text-[var(--text-secondary)] group-hover:text-[var(--accent-500)] transition-colors" />
                </div>
                <ArrowUpRight className="size-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="font-medium text-[13px] mb-1">{svc.name}</div>
              <div className="text-[11px] text-[var(--text-tertiary)] leading-relaxed mb-3">
                {svc.desc}
              </div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.04em]">
                <span className="text-[var(--text-tertiary)]">{svc.eta}</span>
                <span
                  className={
                    svc.price === "Inbegrepen"
                      ? "text-[var(--status-success)]"
                      : "text-[var(--text-secondary)]"
                  }
                >
                  {svc.price}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
