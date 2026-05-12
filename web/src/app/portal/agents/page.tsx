"use client";

import Link from "next/link";
import { Bot, Users, Zap, CheckCircle } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AGENTS = [
  {
    id: "marketing",
    icon: "🎯",
    name: "Marketing Agent",
    color: "#7c3aed",
    sub: "Campagnes & strategie",
    desc: "Bewaakt campagneprestaties, optimaliseert budget en genereert wekelijkse KPI-rapporten.",
    tasks: ["Wekelijks rapport", "KPI check", "Campagne analyseren", "Budget optimaliseren"],
  },
  {
    id: "creative",
    icon: "✍️",
    name: "Creative Agent",
    color: "#ec4899",
    sub: "Advertentieteksten & hooks",
    desc: "Schrijft advertentiecopy op het juiste bewustzijnsniveau met 3 A/B-varianten per concept.",
    tasks: ["3 ad varianten", "Video script", "Hook schrijven", "A/B test opzetten"],
  },
  {
    id: "seo",
    icon: "🔍",
    name: "SEO Agent",
    color: "#10b981",
    sub: "Vindbaarheid & technische SEO",
    desc: "Analyseert Google Search Console, detecteert indexatieproblemen en geeft prioriteitenlijst.",
    tasks: ["SEO audit", "Content optimaliseren", "Technische check", "Rankings analyseren"],
  },
  {
    id: "analytics",
    icon: "📊",
    name: "Analytics Agent",
    color: "#3b82f6",
    sub: "Data-analyse & rapporten",
    desc: "Monitort KPIs, detecteert creative fatigue en analyseert A/B testresultaten statistisch.",
    tasks: ["Data analyse", "Creative fatigue check", "A/B resultaten", "Anomalie detectie"],
  },
  {
    id: "research",
    icon: "🔬",
    name: "Research Agent",
    color: "#f59e0b",
    sub: "Concurrenten & marktonderzoek",
    desc: "Monitort concurrenten wekelijks, analyseert reviews op pijnpunten en detecteert trending angles.",
    tasks: ["Concurrent analyseren", "Review mining", "Trending hooks", "Markt scan"],
  },
  {
    id: "klantenservice",
    icon: "💬",
    name: "Klantenservice Agent",
    color: "#06b6d4",
    sub: "24/7 klantcommunicatie",
    desc: "Beantwoordt klantvragen, herkent gefrustreerde klanten en vraagt automatisch reviews aan.",
    tasks: ["FAQ beantwoorden", "Review verzoek", "Klacht afhandelen", "Email opstellen"],
  },
  {
    id: "crm",
    icon: "🤝",
    name: "CRM Agent",
    color: "#8b5cf6",
    sub: "Klantrelaties & segmentatie",
    desc: "Kent elke klant bij naam en gedragspatroon, stuurt win-back berichten op het juiste moment.",
    tasks: ["Win-back flow", "Segmentatie", "LTV berekenen", "Welkomstflow"],
  },
  {
    id: "automation",
    icon: "⚙️",
    name: "Automation Agent",
    color: "#64748b",
    sub: "Systeemdirigent",
    desc: "Houdt alle agents op schema, documenteert alles en schaalt mee als de business groeit.",
    tasks: ["Taken plannen", "Systeem status", "Rapport genereren", "Integraties checken"],
  },
];

export default function AgentsPage() {
  return (
    <>
      <Topbar
        title="Agents"
        description="8 gespecialiseerde AI-agents die samenwerken"
      />
      <div className="p-6">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Bot className="size-4" />} label="Actieve agents" value="8" />
          <StatCard icon={<Zap className="size-4" />} label="Capabilities" value="32" />
          <StatCard icon={<Users className="size-4" />} label="Samenwerking" value="Auto-routing" />
          <StatCard icon={<CheckCircle className="size-4" />} label="Status" value="Online" accent />
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-3 gap-4">
          {AGENTS.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[var(--text-tertiary)]">{icon}</span>
          <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] font-medium">
            {label}
          </span>
        </div>
        <div
          className={`text-[20px] font-medium tracking-display ${
            accent ? "text-[var(--status-success)]" : "text-[var(--text-primary)]"
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentCard({ agent }: { agent: (typeof AGENTS)[number] }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden hover:border-[var(--border-strong)] transition-colors flex flex-col">
      {/* Colored top border */}
      <div className="h-1 w-full" style={{ backgroundColor: agent.color }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="size-10 rounded-[var(--radius-md)] grid place-items-center text-[20px] shrink-0"
            style={{ backgroundColor: `${agent.color}18` }}
          >
            {agent.icon}
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-[var(--text-primary)] leading-tight">
              {agent.name}
            </div>
            <Badge tone="neutral" className="h-[18px] px-1.5 text-[9px] mt-1">
              {agent.tasks.length} capabilities
            </Badge>
          </div>
        </div>

        {/* Subtitle */}
        <div className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-[0.06em] font-medium mb-2">
          {agent.sub}
        </div>

        {/* Description */}
        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed mb-4 flex-1">
          {agent.desc}
        </p>

        {/* Quick tasks */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.tasks.map((task) => (
            <Link
              key={task}
              href={`/portal/agents/${agent.id}?task=${encodeURIComponent(task)}`}
              className="inline-flex items-center h-[26px] px-2.5 rounded-md border border-[var(--border-default)] text-[11px] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              {task}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Button variant="secondary" size="sm" asChild className="w-full justify-between">
          <Link href={`/portal/agents/${agent.id}`}>
            Chat openen
            <span className="text-[var(--text-tertiary)]">→</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
