"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUp,
  Download,
  FileBarChart,
  Image as ImageIcon,
  MessageSquare,
  Paperclip,
  Plus,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  Attachment,
  GeneratedImage,
  Message,
  StudioMode,
  VideoRequest,
} from "@/lib/studio/types";
import {
  deleteChat,
  deriveTitle,
  loadChat,
  relativeTime,
  saveChat,
  useChatSummaries,
  type ChatRecord,
} from "@/lib/studio/store";

const tabs: { id: StudioMode; icon: typeof ImageIcon; label: string }[] = [
  { id: "video", icon: Video, label: "Video" },
  { id: "reports", icon: FileBarChart, label: "Rapporten" },
  { id: "images", icon: ImageIcon, label: "Beelden" },
  { id: "scripts", icon: MessageSquare, label: "Scripts" },
  { id: "ideas", icon: Video, label: "Video-ideeën" },
];

const placeholders: Record<StudioMode, string> = {
  images: "Beschrijf je creative — formaat, doelgroep, claim...",
  scripts: "Welk product? Welke hook-stijl? Welke lengte?",
  ideas: "Welk platform? Welke vibe? Welk product?",
  reports: "Welke periode? Welke klant? Plak je cijfers of upload CSV...",
  video: "Beschrijf de video — wie, wat, sfeer, productie-stijl...",
};

const modelLabels: Record<StudioMode, string> = {
  images: "GEMINI · IMAGEN 4",
  scripts: "CLAUDE SONNET 4.6",
  ideas: "CLAUDE SONNET 4.6",
  reports: "CLAUDE SONNET 4.6",
  video: "HIGGSFIELD · SEEDANCE 2.0",
};

const modeLabels: Record<StudioMode, string> = {
  images: "Beelden",
  scripts: "Scripts",
  ideas: "Ideeën",
  reports: "Rapport",
  video: "Video",
};

function newChatId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function StudioPage() {
  const [mode, setMode] = useState<StudioMode>("scripts");
  const [chatId, setChatId] = useState<string>(() => newChatId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const summaries = useChatSummaries();

  // auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // persist chat na elke message change (als er messages zijn)
  useEffect(() => {
    if (messages.length === 0) return;
    const firstUserMsg = messages.find((m) => m.role === "user");
    const record: ChatRecord = {
      id: chatId,
      mode,
      title: deriveTitle(firstUserMsg),
      updatedAt: Date.now(),
      messages,
    };
    saveChat(record);
  }, [messages, chatId, mode]);

  function startNewChat() {
    setChatId(newChatId());
    setMessages([]);
    setInput("");
    setAttachments([]);
  }

  function openChat(id: string) {
    const record = loadChat(id);
    if (!record) return;
    setChatId(record.id);
    setMode(record.mode);
    setMessages(record.messages);
    setInput("");
    setAttachments([]);
  }

  function removeChat(id: string) {
    deleteChat(id);
    if (id === chatId) startNewChat();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 8 * 1024 * 1024) {
        alert(`${file.name} is groter dan 8 MB en wordt overgeslagen.`);
        continue;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "image",
        name: file.name,
        dataUrl,
      });
    }
    setAttachments((a) => [...a, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((a) => a.filter((att) => att.id !== id));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isStreaming) return;
    const userPrompt = input.trim();
    const sentAttachments = attachments;
    setInput("");
    setAttachments([]);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userPrompt,
      attachments: sentAttachments.length > 0 ? sentAttachments : undefined,
    };
    setMessages((m) => [...m, userMsg]);
    setIsStreaming(true);

    try {
      if (mode === "video") {
        const res = await fetch("/api/chat/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userPrompt,
            aspectRatio: "9:16",
            duration: 5,
          }),
        });
        const data = await res.json();
        if (data.error) {
          setMessages((m) => [
            ...m,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              mode: "scripts",
              content: `⚠️ ${data.error}`,
            },
          ]);
        } else {
          const videoMsg: Message = {
            id: `a-${Date.now()}`,
            role: "assistant",
            mode: "video",
            videoRequest: {
              requestId: data.requestId,
              status: "pending",
              prompt: userPrompt,
              aspectRatio: "9:16",
              duration: 5,
              estimatedTurnaround: data.estimatedTurnaround ?? "~4 uur",
            },
          };
          setMessages((m) => [...m, videoMsg]);
        }
      } else if (mode === "images") {
        const res = await fetch("/api/chat/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userPrompt, attachments: sentAttachments }),
        });
        const data: { intro?: string; images?: GeneratedImage[]; error?: string } =
          await res.json();
        if (data.error) {
          setMessages((m) => [
            ...m,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              mode: "scripts",
              content: `⚠️ Error: ${data.error}`,
            },
          ]);
        } else if (data.images) {
          const imgMessage: Message = {
            id: `a-${Date.now()}`,
            role: "assistant",
            mode: "images",
            intro: data.intro,
            images: data.images,
          };
          setMessages((m) => [...m, imgMessage]);
        }
      } else {
        const res = await fetch(`/api/chat/${mode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userPrompt, attachments: sentAttachments }),
        });
        if (!res.ok) {
          const errText = await res.text();
          setMessages((m) => [
            ...m,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              mode,
              content: `⚠️ Error: ${errText}`,
            },
          ]);
          return;
        }
        if (!res.body) throw new Error("No body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const aiId = `a-${Date.now()}`;
        setMessages((m) => [
          ...m,
          { id: aiId, role: "assistant", mode, content: "" },
        ]);
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value);
          setMessages((m) =>
            m.map((msg) =>
              msg.id === aiId &&
              msg.role === "assistant" &&
              msg.mode !== "images"
                ? { ...msg, content: acc }
                : msg
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          mode: "scripts",
          content: `⚠️ ${err instanceof Error ? err.message : "Onbekende fout"}`,
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <>
      <Topbar
        title="Studio"
        description="Beelden, scripts en video-ideeën — getuned op je brand DNA"
      />
      <div className="grid grid-cols-[280px_1fr] h-[calc(100vh-3.5rem)]">
        {/* Studio sidebar */}
        <aside className="border-r border-[var(--border-default)] bg-[var(--bg-surface)] p-3 flex flex-col">
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 h-9 px-3 rounded-md bg-[var(--accent-500)] text-white text-[13px] font-medium hover:bg-[var(--accent-600)] transition-colors"
          >
            <Plus className="size-4" />
            Nieuwe chat
          </button>

          <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] font-medium mt-5 mb-2 px-1 flex items-center justify-between">
            <span>Geschiedenis</span>
            {summaries.length > 0 && (
              <span className="tabular text-[var(--text-tertiary)] normal-case tracking-normal">
                {summaries.length}
              </span>
            )}
          </div>

          <div className="space-y-1 overflow-y-auto flex-1">
            {summaries.length === 0 && (
              <div className="text-[12px] text-[var(--text-tertiary)] px-2 py-3 leading-relaxed">
                Je chats verschijnen hier zodra je een bericht stuurt. Alle conversaties worden lokaal in je browser bewaard.
              </div>
            )}
            {summaries.map((c) => {
              const isActive = c.id === chatId;
              return (
                <div
                  key={c.id}
                  className={cn(
                    "group flex items-center gap-2 px-2 h-10 rounded-md text-[12px] transition-colors cursor-pointer",
                    isActive
                      ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                  )}
                  onClick={() => openChat(c.id)}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full shrink-0",
                      isActive ? "bg-[var(--accent-500)]" : "bg-[var(--text-tertiary)]"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{c.title}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)] tabular flex items-center gap-1.5">
                      <span>{modeLabels[c.mode]}</span>
                      <span>·</span>
                      <span>{relativeTime(c.updatedAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChat(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 size-6 rounded grid place-items-center text-[var(--text-tertiary)] hover:text-[var(--status-danger)] hover:bg-[var(--bg-canvas)] transition-all"
                    aria-label="Verwijder chat"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <main className="flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 h-12 border-b border-[var(--border-default)]">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = mode === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 h-10 text-[13px] border-b-2 -mb-px transition-colors",
                    isActive
                      ? "border-[var(--accent-500)] text-[var(--text-primary)] font-medium"
                      : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon className="size-[15px]" />
                  {t.label}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              <Badge tone="accent" className="h-[20px] px-2">
                {modelLabels[mode]}
              </Badge>
            </div>
          </div>

          {/* Chat scroll */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-8">
            {messages.length === 0 ? (
              <EmptyState mode={mode} onPick={(p) => setInput(p)} />
            ) : (
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {isStreaming &&
                  messages.length > 0 &&
                  messages[messages.length - 1]?.role === "user" && <Thinking />}
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[var(--border-default)] p-4"
          >
            <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)] p-2.5 max-w-3xl mx-auto focus-within:border-[var(--accent-500)] focus-within:shadow-[0_0_0_3px_var(--accent-glow)] transition-all">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1 pt-1 pb-2 border-b border-[var(--border-default)] mb-2">
                  {attachments.map((a) => (
                    <div
                      key={a.id}
                      className="relative group rounded-md overflow-hidden border border-[var(--border-default)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.dataUrl}
                        alt={a.name}
                        className="size-14 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(a.id)}
                        className="absolute top-0.5 right-0.5 size-5 rounded-full bg-black/70 backdrop-blur-sm grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Verwijder bijlage"
                      >
                        <X className="size-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming}
                  className="size-8 rounded-md grid place-items-center text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors shrink-0 disabled:opacity-40"
                  aria-label="Bijlage toevoegen"
                >
                  <Paperclip className="size-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholders[mode]}
                  rows={1}
                  disabled={isStreaming}
                  className="flex-1 resize-none bg-transparent outline-none text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] py-1.5 max-h-32 leading-relaxed disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={(!input.trim() && attachments.length === 0) || isStreaming}
                  className="size-8 rounded-md bg-[var(--accent-500)] grid place-items-center hover:bg-[var(--accent-600)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  aria-label="Versturen"
                >
                  <ArrowUp className="size-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-[var(--text-tertiary)] mt-2">
              Enter om te versturen · Shift+Enter voor nieuwe regel · Paperclip voor afbeeldingen (max 8 MB)
            </p>
          </form>
        </main>
      </div>
    </>
  );
}

function EmptyState({
  mode,
  onPick,
}: {
  mode: StudioMode;
  onPick: (p: string) => void;
}) {
  const examples: Record<StudioMode, string[]> = {
    images: [
      "Genereer 4 Facebook ad-creatives voor het ergonomische slaapkussen",
      "Maak Pinterest pins voor de BH-lijn 50+",
      "4 Instagram story-mockups voor 60 nachten proef-actie",
    ],
    scripts: [
      "Schrijf 3 hooks + 30s scripts voor een Reel over de BH-lijn voor 50+",
      "Facebook ad scripts voor slaapkussens — Hook–Pain–Proof–CTA",
      "TikTok scripts voor vrouwen 50+ met nekpijn",
    ],
    ideas: [
      "Geef 5 video-ideeën voor TikTok over slaapkussens — natuurlijk en niet salesy",
      "Reel-ideeën voor de BH-lijn — focus op herkenning",
      "UGC-stijl video concepts voor 50+ doelgroep",
    ],
    reports: [
      "Schrijf wekelijks rapport voor klant Bol BH's — Spend €4.500, Revenue €13.200, ROAS 2.93, 142 conversies, vorige week ROAS 2.51",
      "Maandelijks rapport voor Slaapwijs — geef voorbeeld-data en typische learnings",
      "Wekelijks rapport voor Hopper Lingerie — focus op wat onderpresteerde",
    ],
    video: [
      "Vrouw van 55 wordt rustig wakker zonder nekpijn — UGC slow motion, soft morning light",
      "Close-up van een vrouw die een BH past en glimlacht — natuurlijk, herkenbaar, geen drama",
      "POV van slaapkussen unboxing in een gezellige slaapkamer, vrouw 50+ test het uit",
    ],
  };
  const titles: Record<StudioMode, string> = {
    images: "Beelden genereren",
    scripts: "Scripts schrijven",
    ideas: "Video-ideeën brainstormen",
    reports: "Rapport schrijven",
    video: "Video genereren",
  };
  return (
    <div className="max-w-2xl mx-auto pt-12 text-center">
      <div className="size-12 rounded-xl bg-[var(--bg-surface-2)] grid place-items-center mx-auto mb-4">
        <Sparkles className="size-6 text-[var(--accent-500)]" />
      </div>
      <h2 className="text-[20px] font-medium tracking-display mb-2">{titles[mode]}</h2>
      <p className="text-[var(--text-secondary)] text-[14px] mb-8">
        Je brand DNA is geladen. Stel een vraag of begin met één van deze prompts:
      </p>
      <div className="space-y-2 text-left">
        {examples[mode].map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onPick(ex)}
            className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[13px] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors text-left"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-[12px]">
      <div className="size-6 rounded-md bg-[var(--accent-500)] grid place-items-center">
        <Sparkles className="size-3.5 text-white animate-pulse" />
      </div>
      <span>Studio denkt na</span>
      <div className="flex gap-1">
        <span className="size-1 rounded-full bg-[var(--text-tertiary)] animate-pulse" />
        <span className="size-1 rounded-full bg-[var(--text-tertiary)] animate-pulse [animation-delay:150ms]" />
        <span className="size-1 rounded-full bg-[var(--text-tertiary)] animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col items-end gap-2">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {message.attachments.map((a) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={a.id}
                  src={a.dataUrl}
                  alt={a.name}
                  className="size-20 rounded-md object-cover border border-[var(--border-default)]"
                />
              ))}
            </div>
          )}
          {message.content && (
            <div className="bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] rounded-tr-sm px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (message.mode === "images") {
    return (
      <div>
        <AssistantHeader subtitle={`${message.images.length} beelden gegenereerd`} />
        {message.intro && (
          <div className="text-[var(--text-secondary)] text-[13px] mb-4 leading-relaxed">
            {message.intro}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 max-w-2xl">
          {message.images.map((img) => (
            <ImageCard key={img.id} img={img} />
          ))}
        </div>
      </div>
    );
  }

  if (message.mode === "video") {
    return <VideoRequestCard request={message.videoRequest} />;
  }

  return (
    <div>
      <AssistantHeader />
      <div className="text-[13px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap [&_strong]:text-[var(--text-primary)] [&_strong]:font-medium">
        {renderMarkdownish(message.content)}
      </div>
      {message.mode === "reports" && message.content.length > 100 && (
        <DownloadReportButton content={message.content} />
      )}
    </div>
  );
}

function VideoRequestCard({ request }: { request: VideoRequest }) {
  return (
    <div>
      <AssistantHeader subtitle="Video productie aangevraagd" />
      <div className="max-w-2xl border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)] overflow-hidden">
        <div
          className={cn(
            "aspect-[9/16] max-h-[400px] w-full bg-gradient-to-br grid place-items-center text-white text-center p-6",
            request.status === "done"
              ? "from-emerald-900/40 to-teal-700/30"
              : request.status === "failed"
              ? "from-red-900/40 to-rose-700/30"
              : "from-violet-900/40 to-indigo-700/30"
          )}
        >
          {request.videoUrl ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={request.videoUrl} controls className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="size-12 rounded-full bg-white/10 grid place-items-center mb-2">
                <Sparkles className="size-6 animate-pulse" />
              </div>
              <div className="text-[14px] font-medium">
                {request.status === "pending"
                  ? "In de wachtrij"
                  : request.status === "in_progress"
                  ? "Wordt nu gerendered"
                  : request.status === "done"
                  ? "Klaar"
                  : "Mislukt"}
              </div>
              <div className="text-[11px] text-white/60">
                ETA {request.estimatedTurnaround}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] font-medium">
            Prompt
          </div>
          <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed italic">
            &ldquo;{request.prompt}&rdquo;
          </div>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] pt-2 border-t border-[var(--border-default)]">
            <span>{request.aspectRatio}</span>
            <span>·</span>
            <span>{request.duration}s</span>
            <span>·</span>
            <span>Seedance 2.0</span>
            <span className="ml-auto">Request {request.requestId.slice(0, 8)}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-[var(--text-tertiary)] max-w-2xl">
        Video productie is operator-fulfilled. Je krijgt een notificatie zodra je video klaar is.
        Volg de status op{" "}
        <a href="/portal/requests" className="text-[var(--accent-500)] underline">
          /portal/requests
        </a>
        .
      </div>
    </div>
  );
}

function DownloadReportButton({ content }: { content: string }) {
  const [busy, setBusy] = useState(false);
  async function handle() {
    setBusy(true);
    try {
      const res = await fetch("/api/pdf/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdownReport: content,
          clientName: "Klant",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rapport.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("PDF download faalde: " + (e instanceof Error ? e.message : "onbekend"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className="mt-4 inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-60"
    >
      <Download className="size-3.5" />
      {busy ? "Genereert..." : "Download als PDF"}
    </button>
  );
}

function AssistantHeader({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 text-[var(--text-tertiary)] text-[11px]">
      <div className="size-6 rounded-md bg-[var(--accent-500)] grid place-items-center">
        <Sparkles className="size-3.5 text-white" />
      </div>
      <span className="font-medium text-[var(--text-secondary)]">Willoe Studio</span>
      {subtitle && <span className="tabular">· {subtitle}</span>}
    </div>
  );
}

function ImageCard({ img }: { img: GeneratedImage }) {
  const aspect = {
    hero: "aspect-square",
    square: "aspect-square",
    feed: "aspect-[3/4]",
    story: "aspect-[9/16]",
  }[img.format];
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--border-default)] overflow-hidden relative group cursor-pointer",
        aspect
      )}
    >
      {img.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img.imageUrl}
          alt={img.overlayText}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${img.placeholder.from} ${img.placeholder.to}`} />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.6)_0%,transparent_50%)]" />
      <div className="absolute inset-x-3 bottom-3">
        <div className="text-white text-[14px] font-medium tracking-display leading-tight drop-shadow-sm">
          {img.overlayText}
        </div>
        <div className="text-white/70 text-[10px] uppercase tracking-[0.06em] mt-1">
          {img.format} · {img.dimensions}
        </div>
      </div>
    </div>
  );
}

function renderMarkdownish(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}
