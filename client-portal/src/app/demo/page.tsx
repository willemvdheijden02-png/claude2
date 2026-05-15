"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bot, ClipboardCheck, FolderOpen, LayoutDashboard, MessageSquare,
  Plus, Receipt, ShoppingBag, TrendingUp, Clock, AlertCircle,
  CheckCircle2, Send, BarChart2, Target, MousePointerClick,
  DollarSign, Eye, ArrowUpRight, ArrowDownRight,
  FileText, Upload, X, RefreshCw, Tag, Paperclip, Settings,
} from "lucide-react";

const accent = "#10b981";

// ─── Mock data ───────────────────────────────────────────────

const metaStats = [
  { label: "Besteed",       value: "€ 1.240", change: +8.4,  icon: DollarSign },
  { label: "Bereik",        value: "84.200",  change: +12.1, icon: Eye },
  { label: "Klikken",       value: "3.108",   change: -3.2,  icon: MousePointerClick },
  { label: "ROAS",          value: "3.8×",    change: +5.6,  icon: TrendingUp },
];
const googleStats = [
  { label: "Besteed",       value: "€ 680",  change: +2.1,  icon: DollarSign },
  { label: "Vertoningen",   value: "52.400", change: +9.3,  icon: Eye },
  { label: "Klikken",       value: "1.842",  change: +6.8,  icon: MousePointerClick },
  { label: "Conversies",    value: "94",     change: +11.2, icon: Target },
];
const metaCampaigns = [
  { name: "Slaapkussen — Retargeting",    spend: "€ 420", roas: "5.2×", status: "active" },
  { name: "BH Collectie — Cold Traffic",  spend: "€ 510", roas: "3.1×", status: "active" },
  { name: "Video — Testimonials",         spend: "€ 310", roas: "2.8×", status: "paused" },
];
const googleCampaigns = [
  { name: "Brand Search — Livoa",         spend: "€ 180", conv: "42",  status: "active" },
  { name: "Shopping — Kussens",           spend: "€ 310", conv: "38",  status: "active" },
  { name: "Display Retargeting",          spend: "€ 190", conv: "14",  status: "paused" },
];
const orders = [
  { name: "Meta Ads Campagne — Q2",  status: "in_progress", date: "12 mei", price: "€ 850" },
  { name: "Social Media Kalender",   status: "completed",   date: "8 mei",  price: "€ 450" },
  { name: "Google Ads Setup",        status: "started",     date: "5 mei",  price: "€ 600" },
  { name: "SEO Analyse Rapport",     status: "pending",     date: "1 mei",  price: "€ 350" },
];
const invoices = [
  { desc: "Meta Ads — april",   date: "1 mei",   amount: "€ 1.240", paid: true  },
  { desc: "Google Ads — april", date: "1 mei",   amount: "€ 680",   paid: true  },
  { desc: "Studio pakket",      date: "15 apr",  amount: "€ 450",   paid: true  },
  { desc: "Meta Ads — mei",     date: "1 jun",   amount: "€ 650",   paid: false },
];
const proposals = [
  { title: "Budget verhoging Meta Ads", type: "Budget", current: "€ 500/mnd", proposed: "€ 750/mnd", status: "pending",  date: "13 mei" },
  { title: "Nieuwe Google Shopping",    type: "Campagne", current: "—",       proposed: "Nieuw",      status: "approved", date: "2 mei"  },
];
const chatMessages = [
  { from: "agency", name: "Willoe Agency", text: "Goedemorgen! Je Meta campagne loopt heel goed deze week. ROAS staat op 5.2×.",    time: "09:14" },
  { from: "client", name: "Jij",           text: "Top nieuws! Wanneer verwacht je de volgende rapportage?",                          time: "09:22" },
  { from: "agency", name: "Willoe Agency", text: "We sturen je vrijdag een volledig overzicht met alle cijfers en aanbevelingen.",   time: "09:25" },
  { from: "client", name: "Jij",           text: "Super, alvast bedankt!",                                                           time: "09:26" },
];
const documents = [
  { name: "Rapportage April 2026.pdf",   type: "pdf",   size: "1.2 MB", date: "2 mei"  },
  { name: "Campagne assets Q2.zip",      type: "zip",   size: "8.4 MB", date: "10 mei" },
  { name: "Livoa logo pakket.png",       type: "image", size: "420 KB", date: "15 apr" },
];

// ─── Helpers ──────────────────────────────────────────────────

const statusColor: Record<string, string> = { pending: "#f59e0b", started: "#3b82f6", in_progress: "#8b5cf6", completed: "#10b981" };
const statusLabel: Record<string, string> = { pending: "Ingediend", started: "Gestart", in_progress: "Bezig", completed: "Afgerond" };

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "20px", ...style }}>
      {children}
    </div>
  );
}
function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
      <Icon size={14} style={{ color: accent }} />
      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{title}</span>
    </div>
  );
}
function Badge({ status }: { status: string }) {
  return (
    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "999px", background: `${statusColor[status]}20`, color: statusColor[status], fontWeight: 600 }}>
      {statusLabel[status]}
    </span>
  );
}
function StatCard({ label, value, change, icon: Icon }: { label: string; value: string; change: number; icon: React.ElementType }) {
  const up = change >= 0;
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <Icon size={14} style={{ color: accent }} />
        <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{value}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {up ? <ArrowUpRight size={12} style={{ color: "#10b981" }} /> : <ArrowDownRight size={12} style={{ color: "#ef4444" }} />}
        <span style={{ fontSize: "11px", color: up ? "#10b981" : "#ef4444" }}>{Math.abs(change)}% vs vorige maand</span>
      </div>
    </Card>
  );
}

// ─── Views ────────────────────────────────────────────────────

function Overview({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Overzicht</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Welkom terug — hier is je actuele status</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
        {[
          { icon: TrendingUp,  label: "Totaal uitgegeven",   value: "€ 4.850", sub: "Afgelopen 6 maanden" },
          { icon: Clock,       label: "Actieve opdrachten",  value: "2",       sub: "In behandeling" },
          { icon: AlertCircle, label: "Openstaande facturen",value: "1",       sub: "€ 650 te betalen" },
        ].map((s) => (
          <Card key={s.label}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <s.icon size={14} style={{ color: accent }} />
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.label}</span>
            </div>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{s.value}</p>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{s.sub}</p>
          </Card>
        ))}
      </div>
      <button onClick={() => setPage("Nieuwe Opdracht")} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "12px 16px", background: accent, color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: "16px" }}>
        <Plus size={15} /> Nieuwe Opdracht indienen
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Card>
          <SectionTitle icon={ShoppingBag} title="Recente opdrachten" />
          {orders.slice(0, 4).map((o) => (
            <div key={o.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                <CheckCircle2 size={12} style={{ color: statusColor[o.status], flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</span>
              </div>
              <Badge status={o.status} />
            </div>
          ))}
        </Card>
        <Card>
          <SectionTitle icon={MessageSquare} title="Recente berichten" />
          {chatMessages.slice(-3).map((m, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: m.from === "client" ? accent : "var(--text-secondary)" }}>{m.name}</span>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{m.time}</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{m.text}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

type KpiData = {
  hasData: boolean;
  totals: {
    spendEur: number; impressions: number; clicks: number;
    conversions: number; revenueEur: number; roas: number | null; ctr: number | null;
  };
  byPlatform: Record<string, { spend: number; impressions: number; clicks: number; conversions: number; revenue: number; roas: number | null }>;
  daily: { date: string; platform: string; spendEur: number; impressions: number; clicks: number; conversions: number; roas: number | null }[];
};

const RANGES = [
  { label: "Vandaag",    value: 1  },
  { label: "4 dagen",   value: 4  },
  { label: "7 dagen",   value: 7  },
  { label: "30 dagen",  value: 30 },
];

function AdsManager() {
  const [platform, setPlatform] = useState<"meta" | "google">("meta");
  const [range, setRange] = useState(7);
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const fetchKpis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kpis?token=demo&range=${range}&platform=${platform}`);
      if (res.ok) {
        const data = await res.json();
        setKpi(data);
        setLastRefresh(new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }));
      }
    } catch {
      // silently fall back to mock data
    } finally {
      setLoading(false);
    }
  }, [range, platform]);

  useEffect(() => { fetchKpis(); }, [fetchKpis]);

  // Use real data if available, otherwise fall back to mock
  const useReal = kpi?.hasData;
  const stats = platform === "meta"
    ? useReal
      ? [
          { label: "Besteed",     value: `€ ${kpi!.byPlatform["meta"]?.spend ?? 0}`,        change: +8.4, icon: DollarSign },
          { label: "Vertoningen", value: (kpi!.byPlatform["meta"]?.impressions ?? 0).toLocaleString("nl"), change: +12.1, icon: Eye },
          { label: "Klikken",     value: (kpi!.byPlatform["meta"]?.clicks ?? 0).toLocaleString("nl"),     change: -3.2,  icon: MousePointerClick },
          { label: "ROAS",        value: kpi!.byPlatform["meta"]?.roas ? `${kpi!.byPlatform["meta"].roas}×` : "—", change: +5.6, icon: TrendingUp },
        ]
      : metaStats
    : useReal
      ? [
          { label: "Besteed",     value: `€ ${kpi!.byPlatform["google"]?.spend ?? 0}`,         change: +2.1,  icon: DollarSign },
          { label: "Vertoningen", value: (kpi!.byPlatform["google"]?.impressions ?? 0).toLocaleString("nl"), change: +9.3, icon: Eye },
          { label: "Klikken",     value: (kpi!.byPlatform["google"]?.clicks ?? 0).toLocaleString("nl"),      change: +6.8, icon: MousePointerClick },
          { label: "Conversies",  value: String(kpi!.byPlatform["google"]?.conversions ?? 0),  change: +11.2, icon: Target },
        ]
      : googleStats;

  const campaigns = platform === "meta" ? metaCampaigns : googleCampaigns;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Ads Manager</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Live overzicht · {lastRefresh ? `Bijgewerkt om ${lastRefresh}` : "Wordt geladen…"}
          </p>
        </div>
        <button onClick={fetchKpis} disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer" }}>
          <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Vernieuwen
        </button>
      </div>

      {/* Platform + daterange */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px" }}>
        {/* Platform tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          {(["meta", "google"] as const).map((p) => (
            <button key={p} onClick={() => setPlatform(p)}
              style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.12s",
                background: platform === p ? accent : "var(--bg-surface)",
                color: platform === p ? "white" : "var(--text-secondary)",
                borderColor: platform === p ? accent : "var(--border-default)" }}>
              {p === "meta" ? "📘 Meta Ads" : "🔵 Google Ads"}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div style={{ display: "flex", gap: "4px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "8px", padding: "3px" }}>
          {RANGES.map((r) => (
            <button key={r.value} onClick={() => setRange(r.value)}
              style={{ padding: "5px 12px", borderRadius: "6px", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.12s",
                background: range === r.value ? accent : "transparent",
                color: range === r.value ? "white" : "var(--text-secondary)" }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* No data notice */}
      {!useReal && (
        <div style={{ padding: "10px 14px", background: "#f59e0b10", border: "1px solid #f59e0b30", borderRadius: "8px", fontSize: "12px", color: "#f59e0b", marginBottom: "14px" }}>
          ⚠️ Nog geen KPI-data voor deze periode — voorbeeldcijfers worden getoond. De cron vult dit dagelijks aan.
        </div>
      )}

      {/* Campaigns */}
      <Card>
        <SectionTitle icon={BarChart2} title="Campagnes" />
        <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-default)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px", padding: "10px 14px", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)" }}>
            {["Campagne", "Besteed", platform === "meta" ? "ROAS" : "Conversies", "Status"].map((h) => (
              <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{h}</span>
            ))}
          </div>
          {campaigns.map((c, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px", padding: "12px 14px", borderBottom: i < campaigns.length - 1 ? "1px solid var(--border-default)" : "none", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{c.name}</span>
              <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>{c.spend}</span>
              <span style={{ fontSize: "13px", color: accent, fontWeight: 600 }}>{"roas" in c ? c.roas : c.conv}</span>
              <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", background: c.status === "active" ? "#10b98120" : "#f59e0b20", color: c.status === "active" ? "#10b981" : "#f59e0b", fontWeight: 600, display: "inline-block" }}>
                {c.status === "active" ? "Actief" : "Gepauzeerd"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Orders({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Mijn Opdrachten</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{orders.length} opdrachten in totaal</p>
        </div>
        <button onClick={() => setPage("Nieuwe Opdracht")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: accent, color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          <Plus size={14} /> Nieuwe Opdracht
        </button>
      </div>
      <Card style={{ padding: 0 }}>
        {orders.map((o, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < orders.length - 1 ? "1px solid var(--border-default)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${statusColor[o.status]}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShoppingBag size={15} style={{ color: statusColor[o.status] }} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{o.name}</p>
                <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{o.date} · {o.price}</p>
              </div>
            </div>
            <Badge status={o.status} />
          </div>
        ))}
      </Card>
    </div>
  );
}

function NewOrder({ setPage }: { setPage: (p: string) => void }) {
  const services = [
    { name: "Meta Ads Beheer",    price: "€ 850/mnd", desc: "Volledig campagnebeheer op Facebook & Instagram" },
    { name: "Google Ads Setup",   price: "€ 600",     desc: "Campagnes opzetten: Search, Shopping of Display" },
    { name: "Social Kalender",    price: "€ 450/mnd", desc: "Content planning en scheduling voor socials" },
    { name: "SEO Analyse",        price: "€ 350",     desc: "Technische SEO audit + actieplan" },
    { name: "E-mail Campagne",    price: "€ 300",     desc: "Email sequence schrijven en instellen in Klaviyo" },
    { name: "Rapportage",         price: "€ 200",     desc: "Maandelijkse performance rapportage met inzichten" },
  ];
  const [selected, setSelected] = useState<string | null>(null);
  const [brief, setBrief] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `${accent}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <CheckCircle2 size={28} style={{ color: accent }} />
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Opdracht ingediend!</h2>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "24px" }}>Het agency neemt zo snel mogelijk contact op.</p>
        <button onClick={() => { setSubmitted(false); setSelected(null); setBrief(""); setPage("Mijn Opdrachten"); }}
          style={{ padding: "8px 20px", background: accent, color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          Naar mijn opdrachten
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Nieuwe Opdracht</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Kies een dienst en omschrijf je wens</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
        {services.map((s) => (
          <div key={s.name} onClick={() => setSelected(s.name)}
            style={{ padding: "16px", background: "var(--bg-surface-2)", border: `1px solid ${selected === s.name ? accent : "var(--border-default)"}`, borderRadius: "10px", cursor: "pointer", transition: "border-color 0.12s" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{s.name}</p>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "8px" }}>{s.desc}</p>
            <p style={{ fontSize: "13px", fontWeight: 700, color: accent }}>{s.price}</p>
          </div>
        ))}
      </div>
      <Card>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Omschrijving / brief</label>
        <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} placeholder="Wat wil je bereiken? Geef zo veel mogelijk context..."
          style={{ width: "100%", background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "8px", padding: "10px 12px", color: "var(--text-primary)", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />

        {/* Mock file upload zone */}
        <div style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Paperclip size={13} style={{ color: "var(--text-tertiary)" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Bijlagen <span style={{ fontWeight: 400, color: "var(--text-tertiary)" }}>(optioneel)</span></span>
          </div>
          <div style={{ border: "2px dashed var(--border-strong)", borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: "var(--bg-surface)" }}>
            <Paperclip size={18} style={{ color: "var(--text-tertiary)", margin: "0 auto 8px" }} />
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
              Sleep bestanden hierheen of <span style={{ color: accent, fontWeight: 600 }}>klik om te uploaden</span>
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>PDF · Afbeeldingen · Video · Word</p>
          </div>
        </div>

        <button disabled={!selected} onClick={() => setSubmitted(true)}
          style={{ marginTop: "12px", padding: "10px 20px", background: selected ? accent : "var(--bg-surface-hover)", color: selected ? "white" : "var(--text-tertiary)", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: selected ? "pointer" : "not-allowed", transition: "background 0.12s" }}>
          Opdracht indienen
        </button>
      </Card>
    </div>
  );
}

function Tarieven({ setPage }: { setPage: (p: string) => void }) {
  const mockServices = [
    { category: "Advertising", name: "Meta Ads Beheer",       price: "€ 850 / mnd", isPackage: false, desc: "Volledig campagnebeheer op Facebook & Instagram. Inclusief creatives en rapportage." },
    { category: "Advertising", name: "Google Ads Setup",      price: "€ 600",       isPackage: false, desc: "Campagnes opzetten: Search, Shopping of Display. Inclusief conversion tracking." },
    { category: "SEO",         name: "SEO Analyse",           price: "€ 350",       isPackage: false, desc: "Technische SEO audit + actieplan met prioriteiten." },
    { category: "Pakket",      name: "Groei Pakket",          price: "€ 1.850 / mnd", isPackage: true, desc: "Alles-in-één pakket voor maximale groei.",
      includes: ["Meta Ads Beheer", "Google Ads Setup", "Maandelijkse rapportage", "Strategie call (1×/mnd)", "Content kalender"] },
    { category: "Content",     name: "Social Media Kalender", price: "€ 450 / mnd", isPackage: false, desc: "Content planning en scheduling voor Instagram en Facebook." },
    { category: "Email",       name: "Email Campagne",        price: "€ 300",       isPackage: false, desc: "Email sequence schrijven en instellen in Klaviyo. Tot 5 emails." },
  ];

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Tarieven & Diensten</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Bekijk onze diensten en vraag direct een opdracht aan.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
        {mockServices.map((s) => (
          <Card key={s.name} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "999px", background: `${accent}15`, color: accent }}>{s.category}</span>
              {s.isPackage && <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "999px", background: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}>Pakket</span>}
            </div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>{s.name}</p>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>{s.desc}</p>
            {s.isPackage && "includes" in s && s.includes && (
              <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "10px", marginBottom: "12px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Bevat:</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                  {s.includes.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <span style={{ color: accent, flexShrink: 0, marginTop: "1px" }}>✓</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ marginTop: "auto", paddingTop: "14px", borderTop: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>{s.price}</span>
              <button
                onClick={() => setPage("Nieuwe Opdracht")}
                style={{ padding: "7px 13px", background: accent, color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                Bestellen →
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Chat() {
  const [messages, setMessages] = useState(chatMessages.map((m) => ({ ...m })));
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "client", name: "Jij", text: input.trim(), time: "nu" }]);
    setInput("");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Chat</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Direct contact met Willoe Agency</p>
      </div>
      <Card style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "client" ? "flex-end" : "flex-start" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: m.from === "client" ? accent : "var(--text-secondary)", marginBottom: "4px" }}>{m.name} · {m.time}</span>
              <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: "12px", fontSize: "13px", lineHeight: 1.5,
                background: m.from === "client" ? accent : "var(--bg-surface)",
                color: m.from === "client" ? "white" : "var(--text-primary)" }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-default)", display: "flex", gap: "8px" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Stuur een bericht..."
            style={{ flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "8px", padding: "8px 12px", color: "var(--text-primary)", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
          <button onClick={send} style={{ width: "36px", height: "36px", background: accent, border: "none", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Send size={14} style={{ color: "white" }} />
          </button>
        </div>
      </Card>
    </div>
  );
}

function Documents() {
  const [docs, setDocs] = useState(documents);
  const typeIcon = (t: string) => t === "image" ? "🖼️" : t === "pdf" ? "📄" : "📦";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Documenten</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{docs.length} bestanden</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: accent, color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          <Upload size={14} /> Uploaden
        </button>
      </div>
      <Card style={{ padding: 0 }}>
        {docs.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < docs.length - 1 ? "1px solid var(--border-default)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "22px" }}>{typeIcon(d.type)}</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{d.name}</p>
                <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{d.size} · {d.date}</p>
              </div>
            </div>
            <button onClick={() => setDocs(docs.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex", padding: "4px" }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Billing() {
  const total = "€ 2.570";
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Facturen</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Overzicht van jouw betalingen</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
        {[
          { label: "Totaal gefactureerd", value: "€ 3.220", color: "var(--text-primary)" },
          { label: "Betaald",             value: "€ 2.570", color: "#10b981" },
          { label: "Openstaand",          value: "€ 650",   color: "#f59e0b" },
        ].map((s) => (
          <Card key={s.label}>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "8px" }}>{s.label}</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>
      <Card style={{ padding: 0 }}>
        {invoices.map((inv, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < invoices.length - 1 ? "1px solid var(--border-default)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FileText size={15} style={{ color: "var(--text-tertiary)" }} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{inv.desc}</p>
                <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{inv.date}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{inv.amount}</span>
              <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", background: inv.paid ? "#10b98120" : "#f59e0b20", color: inv.paid ? "#10b981" : "#f59e0b", fontWeight: 600 }}>
                {inv.paid ? "Betaald" : "Openstaand"}
              </span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Proposals() {
  const [items, setItems] = useState(proposals.map((p) => ({ ...p })));
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Voorstellen</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Bekijk en keur voorstellen goed van het agency</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((p, i) => (
          <Card key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{p.title}</p>
                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>{p.type}</span>
              </div>
              <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", fontWeight: 600,
                background: p.status === "pending" ? "#f59e0b20" : p.status === "approved" ? "#10b98120" : "#ef444420",
                color: p.status === "pending" ? "#f59e0b" : p.status === "approved" ? "#10b981" : "#ef4444" }}>
                {p.status === "pending" ? "In afwachting" : p.status === "approved" ? "Goedgekeurd" : "Afgewezen"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: p.status === "pending" ? "12px" : "0" }}>
              {[["Huidig", p.current], ["Voorstel", p.proposed]].map(([lbl, val]) => (
                <div key={lbl} style={{ background: "var(--bg-surface)", borderRadius: "8px", padding: "8px 12px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "2px" }}>{lbl}</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{val}</p>
                </div>
              ))}
            </div>
            {p.status === "pending" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setItems(items.map((x, j) => j === i ? { ...x, status: "approved" } : x))}
                  style={{ flex: 1, padding: "8px", background: accent, color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  Goedkeuren
                </button>
                <button onClick={() => setItems(items.map((x, j) => j === i ? { ...x, status: "rejected" } : x))}
                  style={{ flex: 1, padding: "8px", background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border-default)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  Afwijzen
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function BotHelp() {
  const [msgs, setMsgs] = useState([{ from: "bot", text: "Hoi! Ik ben de hulpbot van Willoe Agency. Stel me een vraag over onze diensten, tarieven of processen." }]);
  const [input, setInput] = useState("");
  const answers: Record<string, string> = {
    default: "Goeie vraag! Het agency team kan je hier het beste over informeren. Stuur ze een bericht via de Chat.",
    prijs: "Onze prijzen variëren per dienst. Meta Ads beheer start vanaf €850/mnd, Google Ads setup vanaf €600. Kijk bij Nieuwe Opdracht voor het volledige overzicht.",
    rapportage: "Je ontvangt elke maand een uitgebreide rapportage met alle ad-prestaties, inzichten en aanbevelingen.",
    contract: "We werken zonder langlopende contracten. Je kunt maandelijks opzeggen.",
  };
  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    const key = Object.keys(answers).find((k) => q.toLowerCase().includes(k)) || "default";
    setMsgs((prev) => [...prev, { from: "client", text: q }, { from: "bot", text: answers[key] }]);
    setInput("");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Hulp</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Stel een vraag aan de AI-assistent</p>
      </div>
      <Card style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "client" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: "12px", fontSize: "13px", lineHeight: 1.5,
                background: m.from === "client" ? accent : "var(--bg-surface)",
                color: m.from === "client" ? "white" : "var(--text-primary)" }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-default)", display: "flex", gap: "8px" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Stel een vraag..."
            style={{ flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "8px", padding: "8px 12px", color: "var(--text-primary)", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
          <button onClick={send} style={{ width: "36px", height: "36px", background: accent, border: "none", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Send size={14} style={{ color: "white" }} />
          </button>
        </div>
      </Card>
    </div>
  );
}

function Instellingen() {
  const [meta, setMeta] = useState("");
  const [google, setGoogle] = useState("");
  const [website, setWebsite] = useState("https://livoa.nl");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: "40px", padding: "0 12px", borderRadius: "8px",
    background: "var(--bg-surface)", border: "1px solid var(--border-default)",
    color: "var(--text-primary)", fontSize: "13px", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: "560px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Instellingen</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Verbind jouw advertentie-accounts zodat KPI's automatisch worden bijgehouden.</p>
      </div>

      {/* Isolation notice */}
      <div style={{ display: "flex", gap: "12px", padding: "14px 16px", borderRadius: "12px", marginBottom: "20px",
        background: `color-mix(in srgb, ${accent} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)` }}>
        <span style={{ fontSize: "18px" }}>🔒</span>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>Jouw gegevens zijn van jou</p>
          <p style={{ fontSize: "11px", lineHeight: 1.5, color: "var(--text-secondary)" }}>
            De account-IDs die je hier invult worden uitsluitend gebruikt voor jouw eigen rapportages. Geen andere klant of agency heeft hier toegang toe.
          </p>
        </div>
      </div>

      {/* Meta Ads */}
      <Card style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "white", fontSize: "13px", fontWeight: 700 }}>f</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Meta Ads</p>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Facebook &amp; Instagram advertenties</p>
          </div>
          {meta && (
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px",
              background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>VERBONDEN</span>
          )}
        </div>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", marginBottom: "6px" }}>Ad Account ID</span>
          <input type="text" value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="act_123456789" style={inputStyle} />
          <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "4px" }}>Vind je account ID in Meta Business Manager → Advertentieaccounts</p>
        </label>
      </Card>

      {/* Google Ads */}
      <Card style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "white", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px" }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Google Ads</p>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Google zoekmachine advertenties</p>
          </div>
          {google && (
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px",
              background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>VERBONDEN</span>
          )}
        </div>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", marginBottom: "6px" }}>Customer ID</span>
          <input type="text" value={google} onChange={(e) => setGoogle(e.target.value)} placeholder="123-456-7890" style={inputStyle} />
          <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "4px" }}>Vind je Customer ID rechtsboven in Google Ads</p>
        </label>
      </Card>

      {/* Website */}
      <Card style={{ marginBottom: "16px" }}>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "10px" }}>Website URL</span>
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://jouwbedrijf.nl" style={inputStyle} />
        </label>
      </Card>

      <button onClick={handleSave}
        style={{ width: "100%", height: "40px", borderRadius: "8px", background: accent, color: "white", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
        {saved ? "✓ Opgeslagen!" : "Instellingen opslaan"}
      </button>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────

const navItems = [
  { icon: LayoutDashboard, label: "Overzicht",       badge: 0 },
  { icon: BarChart2,       label: "Ads Manager",     badge: 0 },
  { icon: Tag,             label: "Tarieven",        badge: 0 },
  { icon: ShoppingBag,     label: "Mijn Opdrachten", badge: 0 },
  { icon: Plus,            label: "Nieuwe Opdracht", badge: 0, highlight: true },
  { icon: MessageSquare,   label: "Chat",            badge: 3 },
  { icon: FolderOpen,      label: "Documenten",      badge: 0 },
  { icon: Receipt,         label: "Facturen",        badge: 0 },
  { icon: ClipboardCheck,  label: "Voorstellen",     badge: 1 },
  { icon: Bot,             label: "Hulp",            badge: 0 },
  { icon: Settings,        label: "Instellingen",    badge: 0 },
];

export default function DemoPage() {
  const [page, setPage] = useState("Overzicht");

  const renderPage = () => {
    switch (page) {
      case "Overzicht":       return <Overview setPage={setPage} />;
      case "Ads Manager":     return <AdsManager />;
      case "Tarieven":        return <Tarieven setPage={setPage} />;
      case "Mijn Opdrachten": return <Orders setPage={setPage} />;
      case "Nieuwe Opdracht": return <NewOrder setPage={setPage} />;
      case "Chat":            return <Chat />;
      case "Documenten":      return <Documents />;
      case "Facturen":        return <Billing />;
      case "Voorstellen":     return <Proposals />;
      case "Hulp":            return <BotHelp />;
      case "Instellingen":   return <Instellingen />;
      default:                return <Overview setPage={setPage} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-canvas)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: "200px", flexShrink: 0, background: "var(--bg-surface)", borderRight: "1px solid var(--border-default)", display: "flex", flexDirection: "column", height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>W</div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Willoe Agency</span>
        </div>
        <nav style={{ flex: 1, padding: "8px", overflowY: "auto" }}>
          {navItems.map((item) => {
            const active = item.label === page;
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={() => setPage(item.label)}
                style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "0 12px", height: "36px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, textAlign: "left", marginBottom: "2px",
                  background: active ? `color-mix(in srgb, ${accent} 10%, transparent)` : "transparent",
                  color: active ? accent : "var(--text-secondary)",
                  borderLeft: active ? `2px solid ${accent}` : "2px solid transparent",
                  paddingLeft: active ? "10px" : "12px" }}>
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{ background: accent, color: "white", fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "999px" }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "12px", borderTop: "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700 }}>L</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>Livoa</p>
              <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Klant · Willoe Agency</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
        {renderPage()}
      </main>
    </div>
  );
}
