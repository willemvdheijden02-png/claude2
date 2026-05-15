"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

interface Message {
  id: string;
  content: string;
  senderType: string;
  senderName: string;
  createdAt: string;
}

interface Props {
  roomId: string;
  initialMessages: Message[];
  clientName: string;
  agencyName: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function ChatWindow({
  roomId,
  initialMessages,
  clientName,
  agencyName,
  supabaseUrl,
  supabaseAnonKey,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mark agency messages as read on mount
  useEffect(() => {
    fetch("/api/chat/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    }).catch(() => {});
  }, [roomId]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const channel = supabase
      .channel(`chat_room_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            content: string;
            sender_type: string;
            sender_name: string;
            created_at: string;
          };
          const msg: Message = {
            id: row.id,
            content: row.content,
            senderType: row.sender_type,
            senderName: row.sender_name,
            createdAt: row.created_at,
          };
          setMessages((prev) => {
            // avoid duplicates
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Mark as read if agency message
          if (row.sender_type === "agency") {
            fetch("/api/chat/read", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomId }),
            }).catch(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabaseUrl, supabaseAnonKey]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);
    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          content,
          senderType: "client",
          senderName: clientName,
        }),
      });
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatTime(d: string) {
    return new Date(d).toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      className="flex flex-col"
      style={{
        background: "var(--bg-surface-2)",
        border: "1px solid var(--border-default)",
        borderRadius: "12px",
        height: "calc(100vh - 200px)",
        minHeight: "400px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div
          className="size-8 rounded-full grid place-items-center text-[12px] font-bold text-white"
          style={{ background: "var(--accent-500)" }}
        >
          {agencyName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
            {agencyName}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Direct contact
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              Stuur een bericht om het gesprek te starten.
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isClient = msg.senderType === "client";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isClient ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {isClient ? "Jij" : msg.senderName}
                </span>
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  · {formatTime(msg.createdAt)}
                </span>
              </div>
              <div
                className="max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13px] whitespace-pre-wrap"
                style={{
                  background: isClient ? "var(--accent-500)" : "var(--bg-surface)",
                  color: isClient ? "white" : "var(--text-primary)",
                  borderRadius: isClient
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
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
          placeholder="Typ een bericht… (Enter om te verzenden)"
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
            lineHeight: "1.5",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          style={{
            background: input.trim() ? "var(--accent-500)" : "var(--bg-surface-2)",
            color: input.trim() ? "white" : "var(--text-tertiary)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 600,
            border: "none",
            cursor: input.trim() ? "pointer" : "not-allowed",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {sending ? "…" : "Sturen"}
        </button>
      </div>
    </div>
  );
}
