"use client";

import { useEffect, useState } from "react";
import type { Message, StudioMode } from "@/lib/studio/types";

export type ChatSummary = {
  id: string;
  mode: StudioMode;
  title: string; // afgeleid van eerste user message
  updatedAt: number;
};

export type ChatRecord = ChatSummary & {
  messages: Message[];
};

const KEY = "willoe.studio.chats";

function readAll(): ChatRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatRecord[];
  } catch {
    return [];
  }
}

function writeAll(chats: ChatRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(chats));
  // notify other components
  window.dispatchEvent(new CustomEvent("willoe-chats-updated"));
}

export function deriveTitle(message: Message | undefined): string {
  if (!message || message.role !== "user") return "Nieuwe chat";
  const text = message.content.trim();
  if (text.length === 0) return "Nieuwe chat";
  return text.length > 48 ? text.slice(0, 48) + "…" : text;
}

export function saveChat(chat: ChatRecord) {
  const all = readAll();
  const existing = all.findIndex((c) => c.id === chat.id);
  if (existing >= 0) {
    all[existing] = chat;
  } else {
    all.unshift(chat);
  }
  // sort by updatedAt desc
  all.sort((a, b) => b.updatedAt - a.updatedAt);
  // cap to 100 chats om localStorage niet vol te knallen
  writeAll(all.slice(0, 100));
}

export function deleteChat(id: string) {
  const all = readAll().filter((c) => c.id !== id);
  writeAll(all);
}

export function loadChat(id: string): ChatRecord | null {
  return readAll().find((c) => c.id === id) ?? null;
}

export function clearAllChats() {
  writeAll([]);
}

// Hook voor sidebar — luistert naar updates
export function useChatSummaries(): ChatSummary[] {
  const [chats, setChats] = useState<ChatSummary[]>([]);

  useEffect(() => {
    function refresh() {
      setChats(
        readAll().map((c) => ({
          id: c.id,
          mode: c.mode,
          title: c.title,
          updatedAt: c.updatedAt,
        }))
      );
    }
    refresh();
    window.addEventListener("willoe-chats-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("willoe-chats-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return chats;
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "nu";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(ts).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}
