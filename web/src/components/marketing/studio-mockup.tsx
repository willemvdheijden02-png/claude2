import { ArrowUp, Image as ImageIcon, MessageSquare, Paperclip, Sparkles, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { icon: ImageIcon, label: "Beelden", active: true },
  { icon: MessageSquare, label: "Scripts", active: false },
  { icon: Video, label: "Video-ideeën", active: false },
];

const generatedImages = [
  { label: "Hero · 1080×1080", from: "from-emerald-900/40", to: "to-teal-700/30", accent: "Wakker zonder pijn" },
  { label: "Story · 1080×1920", from: "from-amber-900/40", to: "to-rose-700/30", accent: "60 nachten proef" },
  { label: "Feed · 1080×1350", from: "from-indigo-900/40", to: "to-violet-700/30", accent: "Eindelijk rust" },
  { label: "Square · 1080×1080", from: "from-slate-800/60", to: "to-emerald-900/30", accent: "Comfort die past" },
];

export function StudioMockup() {
  return (
    <div className="grid grid-cols-[260px_1fr] min-h-[480px] text-[13px]">
      {/* Sidebar: history */}
      <aside className="border-r border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] font-medium">
            Recent
          </span>
          <Sparkles className="size-3.5 text-[var(--text-tertiary)]" />
        </div>
        <div className="space-y-1">
          {[
            { title: "Slaapkussen ad varianten", time: "2m", active: true },
            { title: "BH lingerie hooks", time: "1u" },
            { title: "Reel script · zomer", time: "3u" },
            { title: "Pinterest pin batch", time: "Gisteren" },
            { title: "Brand DNA → 12 concepts", time: "2d" },
            { title: "TikTok video-ideeën", time: "5d" },
          ].map((c) => (
            <div
              key={c.title}
              className={`flex items-center justify-between px-2 h-9 rounded-md text-[12px] ${
                c.active
                  ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <span className="truncate">{c.title}</span>
              <span className="text-[10px] text-[var(--text-tertiary)] tabular shrink-0 ml-2">
                {c.time}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main: chat */}
      <main className="flex flex-col">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 h-11 border-b border-[var(--border-default)]">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                className={`flex items-center gap-1.5 px-3 h-9 text-[12px] border-b-2 -mb-px ${
                  t.active
                    ? "border-[var(--accent-500)] text-[var(--text-primary)] font-medium"
                    : "border-transparent text-[var(--text-tertiary)]"
                }`}
              >
                <Icon className="size-[14px]" />
                {t.label}
              </div>
            );
          })}
          <div className="ml-auto">
            <Badge tone="accent" className="h-[18px] px-1.5 text-[9px]">
              GEMINI 2.5
            </Badge>
          </div>
        </div>

        {/* Chat content */}
        <div className="flex-1 px-6 py-5 space-y-5 overflow-hidden">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[80%] bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] rounded-tr-sm px-3.5 py-2.5">
              <p className="text-[var(--text-primary)] leading-relaxed">
                Genereer 4 Facebook ad-creatives voor het ergonomische slaapkussen,
                doelgroep vrouwen 50+ met nekpijn. Gebruik onze brand DNA.
              </p>
            </div>
          </div>

          {/* Assistant message */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-[var(--text-tertiary)] text-[11px]">
              <div className="size-5 rounded-md bg-[var(--accent-500)] grid place-items-center">
                <Sparkles className="size-3 text-white" />
              </div>
              <span className="font-medium text-[var(--text-secondary)]">Willoe Studio</span>
              <span className="tabular">· 4 concepten in 18s</span>
            </div>
            <div className="text-[var(--text-secondary)] mb-3 leading-relaxed">
              Vier concepten op basis van je brand DNA — zachte tonen, herkenbare situaties, geen
              schreeuwerige claims:
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {generatedImages.map((img) => (
                <div
                  key={img.label}
                  className="aspect-[4/3] rounded-[var(--radius-md)] border border-[var(--border-default)] overflow-hidden relative group cursor-pointer"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${img.from} ${img.to}`}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
                  <div className="absolute inset-x-3 bottom-3">
                    <div className="text-white/90 text-[13px] font-medium tracking-display leading-tight">
                      {img.accent}
                    </div>
                    <div className="text-white/50 text-[10px] uppercase tracking-[0.06em] mt-1">
                      {img.label}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 size-5 rounded bg-black/40 backdrop-blur-sm grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUp className="size-3 text-white rotate-45" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-[var(--border-default)] p-3">
          <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)] p-2.5 flex items-end gap-2">
            <button className="size-7 rounded-md grid place-items-center text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-hover)] transition-colors">
              <Paperclip className="size-4" />
            </button>
            <div className="flex-1 text-[var(--text-tertiary)] py-1.5">
              Variatie? Andere stijl? Specifieke claim?
            </div>
            <button className="size-7 rounded-md bg-[var(--accent-500)] grid place-items-center hover:bg-[var(--accent-600)] transition-colors">
              <ArrowUp className="size-4 text-white" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
