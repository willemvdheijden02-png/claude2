"use client";
import { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function BotChat({ agencyId }: { agencyId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ask() {
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: question }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/bot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, agencyId }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.answer ?? "Sorry, ik weet het niet." }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Er ging iets mis. Probeer het opnieuw." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-surface-2)",
        border: "1px solid var(--border-default)",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 220px)",
        minHeight: "400px",
      }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div
              className="size-12 rounded-full grid place-items-center"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
            >
              <Bot className="size-5" style={{ color: "var(--accent-500)" }} />
            </div>
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              Stel een vraag over onze diensten, jouw opdrachten of de samenwerking.
            </p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] px-4 py-3 rounded-2xl text-[13px] whitespace-pre-wrap"
                style={{
                  background: isUser ? "var(--accent-500)" : "var(--bg-surface)",
                  color: isUser ? "white" : "var(--text-primary)",
                  borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  lineHeight: 1.6,
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl text-[13px]"
              style={{
                background: "var(--bg-surface)",
                color: "var(--text-tertiary)",
                borderRadius: "18px 18px 18px 4px",
              }}
            >
              Even denken…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-end gap-2 px-4 py-3 border-t"
        style={{ borderColor: "var(--border-default)" }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Stel je vraag… (Enter om te versturen)"
          rows={1}
          style={{
            flex: 1,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "8px",
            padding: "8px 12px",
            color: "var(--text-primary)",
            fontSize: "13px",
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={ask}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading ? "var(--accent-500)" : "var(--bg-surface-2)",
            color: input.trim() && !loading ? "white" : "var(--text-tertiary)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 600,
            border: "none",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          Sturen
        </button>
      </div>
    </div>
  );
}
