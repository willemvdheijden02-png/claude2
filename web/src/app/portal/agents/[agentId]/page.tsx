"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { Topbar } from "@/components/shell/topbar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const AGENTS: Record<
  string,
  {
    icon: string;
    name: string;
    color: string;
    sub: string;
    desc: string;
    tasks: string[];
  }
> = {
  marketing: {
    icon: "🎯",
    name: "Marketing Agent",
    color: "#7c3aed",
    sub: "Campagnes & strategie",
    desc: "Bewaakt campagneprestaties, optimaliseert budget en genereert wekelijkse KPI-rapporten.",
    tasks: ["Wekelijks rapport", "KPI check", "Campagne analyseren", "Budget optimaliseren"],
  },
  creative: {
    icon: "✍️",
    name: "Creative Agent",
    color: "#ec4899",
    sub: "Advertentieteksten & hooks",
    desc: "Schrijft advertentiecopy op het juiste bewustzijnsniveau met 3 A/B-varianten per concept.",
    tasks: ["3 ad varianten", "Video script", "Hook schrijven", "A/B test opzetten"],
  },
  seo: {
    icon: "🔍",
    name: "SEO Agent",
    color: "#10b981",
    sub: "Vindbaarheid & technische SEO",
    desc: "Analyseert Google Search Console, detecteert indexatieproblemen en geeft prioriteitenlijst.",
    tasks: ["SEO audit", "Content optimaliseren", "Technische check", "Rankings analyseren"],
  },
  analytics: {
    icon: "📊",
    name: "Analytics Agent",
    color: "#3b82f6",
    sub: "Data-analyse & rapporten",
    desc: "Monitort KPIs, detecteert creative fatigue en analyseert A/B testresultaten statistisch.",
    tasks: ["Data analyse", "Creative fatigue check", "A/B resultaten", "Anomalie detectie"],
  },
  research: {
    icon: "🔬",
    name: "Research Agent",
    color: "#f59e0b",
    sub: "Concurrenten & marktonderzoek",
    desc: "Monitort concurrenten wekelijks, analyseert reviews op pijnpunten en detecteert trending angles.",
    tasks: ["Concurrent analyseren", "Review mining", "Trending hooks", "Markt scan"],
  },
  klantenservice: {
    icon: "💬",
    name: "Klantenservice Agent",
    color: "#06b6d4",
    sub: "24/7 klantcommunicatie",
    desc: "Beantwoordt klantvragen, herkent gefrustreerde klanten en vraagt automatisch reviews aan.",
    tasks: ["FAQ beantwoorden", "Review verzoek", "Klacht afhandelen", "Email opstellen"],
  },
  crm: {
    icon: "🤝",
    name: "CRM Agent",
    color: "#8b5cf6",
    sub: "Klantrelaties & segmentatie",
    desc: "Kent elke klant bij naam en gedragspatroon, stuurt win-back berichten op het juiste moment.",
    tasks: ["Win-back flow", "Segmentatie", "LTV berekenen", "Welkomstflow"],
  },
  automation: {
    icon: "⚙️",
    name: "Automation Agent",
    color: "#64748b",
    sub: "Systeemdirigent",
    desc: "Houdt alle agents op schema, documenteert alles en schaalt mee als de business groeit.",
    tasks: ["Taken plannen", "Systeem status", "Rapport genereren", "Integraties checken"],
  },
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  routedTo?: { id: string; name: string };
};

export default function AgentChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const agentId = typeof params.agentId === "string" ? params.agentId : "";
  const agent = AGENTS[agentId];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pre-fill from quick task
  useEffect(() => {
    const task = searchParams.get("task");
    if (task) setInput(task);
  }, [searchParams]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText,
    };
    setMessages((m) => [...m, userMsg]);
    setIsLoading(true);

    try {
      // Build messages array for the API (only role+content)
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`/api/agents/${agentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setMessages((m) => [
          ...m,
          { id: `a-${Date.now()}`, role: "assistant", content: `Fout: ${errText}` },
        ]);
        return;
      }

      const data: { content: string; routedTo?: { id: string; name: string } } =
        await res.json();

      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.content,
          routedTo: data.routedTo,
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `Fout: ${err instanceof Error ? err.message : "Onbekend"}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  if (!agent) {
    return (
      <>
        <Topbar title="Agent niet gevonden" />
        <div className="p-6 text-[var(--text-secondary)]">
          Agent &ldquo;{agentId}&rdquo; bestaat niet.{" "}
          <Link href="/portal/agents" className="text-[var(--accent-500)] hover:underline">
            Terug naar Agents
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title={agent.name}
        description={agent.sub}
        action={
          <Link
            href="/portal/agents"
            className="flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-default)]"
          >
            <ArrowLeft className="size-3.5" />
            Agents
          </Link>
        }
      />
      <div className="grid grid-cols-[280px_1fr] h-[calc(100vh-3.5rem)]">
        {/* Agent info panel */}
        <aside className="border-r border-[var(--border-default)] bg-[var(--bg-surface)] p-4 flex flex-col">
          {/* Agent card */}
          <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden mb-4">
            <div className="h-1" style={{ backgroundColor: agent.color }} />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="size-10 rounded-[var(--radius-md)] grid place-items-center text-[20px] shrink-0"
                  style={{ backgroundColor: `${agent.color}18` }}
                >
                  {agent.icon}
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[var(--text-primary)]">
                    {agent.name}
                  </div>
                  <Badge tone="neutral" className="h-[16px] px-1.5 text-[9px] mt-0.5">
                    {agent.tasks.length} capabilities
                  </Badge>
                </div>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {agent.desc}
              </p>
            </div>
          </div>

          {/* Quick tasks */}
          <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] font-medium mb-2 px-1">
            Snelle taken
          </div>
          <div className="space-y-1.5 flex-1">
            {agent.tasks.map((task) => (
              <button
                key={task}
                type="button"
                onClick={() => setInput(task)}
                className="w-full text-left px-3 h-9 rounded-md border border-[var(--border-default)] text-[12px] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                {task}
              </button>
            ))}
          </div>

          {/* Other agents */}
          <div className="border-t border-[var(--border-default)] pt-3 mt-3">
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] font-medium mb-2 px-1">
              Andere agents
            </div>
            <div className="space-y-0.5">
              {Object.entries(AGENTS)
                .filter(([id]) => id !== agentId)
                .slice(0, 4)
                .map(([id, a]) => (
                  <Link
                    key={id}
                    href={`/portal/agents/${id}`}
                    className="flex items-center gap-2 h-8 px-2 rounded-md text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <span>{a.icon}</span>
                    <span className="truncate">{a.name}</span>
                  </Link>
                ))}
            </div>
          </div>
        </aside>

        {/* Chat panel */}
        <main className="flex flex-col min-w-0">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-8">
            {messages.length === 0 ? (
              <div className="max-w-2xl mx-auto pt-12 text-center">
                <div
                  className="size-14 rounded-xl grid place-items-center mx-auto mb-4 text-[28px]"
                  style={{ backgroundColor: `${agent.color}18` }}
                >
                  {agent.icon}
                </div>
                <h2 className="text-[20px] font-medium tracking-display mb-2">
                  {agent.name}
                </h2>
                <p className="text-[var(--text-secondary)] text-[14px] mb-8">
                  {agent.desc} Stel een vraag of gebruik een snelle taak.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {agent.tasks.map((task) => (
                    <button
                      key={task}
                      type="button"
                      onClick={() => setInput(task)}
                      className="px-3 h-9 rounded-md border border-[var(--border-default)] text-[12px] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m} agentColor={agent.color} agentIcon={agent.icon} agentName={agent.name} />
                ))}
                {isLoading && <ThinkingIndicator icon={agent.icon} color={agent.color} name={agent.name} />}
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[var(--border-default)] p-4"
          >
            <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)] p-2.5 max-w-3xl mx-auto focus-within:border-[var(--accent-500)] focus-within:shadow-[0_0_0_3px_var(--accent-glow)] transition-all">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Vraag de ${agent.name}...`}
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 resize-none bg-transparent outline-none text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] py-1.5 max-h-32 leading-relaxed disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="size-8 rounded-md bg-[var(--accent-500)] grid place-items-center hover:bg-[var(--accent-600)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  aria-label="Versturen"
                >
                  <ArrowUp className="size-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-[var(--text-tertiary)] mt-2">
              Enter om te versturen · Shift+Enter voor nieuwe regel
            </p>
          </form>
        </main>
      </div>
    </>
  );
}

function ChatMessage({
  message,
  agentColor,
  agentIcon,
  agentName,
}: {
  message: Message;
  agentColor: string;
  agentIcon: string;
  agentName: string;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] rounded-tr-sm px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div>
      {message.routedTo && (
        <div className="flex items-center gap-2 mb-2 text-[11px] text-[var(--text-tertiary)]">
          <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-default)]">
            Doorgestuurd naar {message.routedTo.name}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 mb-3 text-[var(--text-tertiary)] text-[11px]">
        <div
          className="size-6 rounded-md grid place-items-center text-[14px]"
          style={{ backgroundColor: `${agentColor}18` }}
        >
          {agentIcon}
        </div>
        <span className="font-medium text-[var(--text-secondary)]">
          {message.routedTo ? message.routedTo.name : agentName}
        </span>
      </div>
      <div className="text-[13px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
        {renderMarkdown(message.content)}
      </div>
    </div>
  );
}

function ThinkingIndicator({
  icon,
  color,
  name,
}: {
  icon: string;
  color: string;
  name: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-[12px]">
      <div
        className="size-6 rounded-md grid place-items-center text-[14px]"
        style={{ backgroundColor: `${color}18` }}
      >
        {icon}
      </div>
      <span>{name} denkt na</span>
      <div className="flex gap-1">
        <span className="size-1 rounded-full bg-[var(--text-tertiary)] animate-pulse" />
        <span className="size-1 rounded-full bg-[var(--text-tertiary)] animate-pulse [animation-delay:150ms]" />
        <span className="size-1 rounded-full bg-[var(--text-tertiary)] animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}
