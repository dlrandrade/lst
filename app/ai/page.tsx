"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types";
import { SimpleHeader } from "@/components/SimpleHeader";
import { Send, Sparkles } from "@/components/Icons";

export default function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      if (!supabase) return;
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at")
        .limit(50);
      if (data) setMessages(data as ChatMessage[]);
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setStreaming(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), role: "user", content: text, created_at: new Date().toISOString(),
    };
    const assistantId = crypto.randomUUID();
    setMessages((p) => [...p, userMsg, {
      id: assistantId, role: "assistant", content: "", created_at: new Date().toISOString(),
    }]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        setMessages((p) =>
          p.map((m) => (m.id === assistantId ? { ...m, content: buf } : m))
        );
      }
    } catch (err: any) {
      setMessages((p) =>
        p.map((m) =>
          m.id === assistantId ? { ...m, content: `[erro: ${err?.message ?? "desconhecido"}]` } : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <SimpleHeader title="AI" subtitle="Pergunta o que quiser." />

      <div ref={scrollRef} className="flex-1 overflow-y-auto -mx-4 px-4 py-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-muted text-center mt-12">
            <Sparkles className="w-8 h-8 mb-2 text-ink/40" />
            <div className="text-[14px]">Sem conversas ainda.</div>
          </div>
        )}
        <ul className="flex flex-col gap-3 pb-4">
          {messages.map((m) => (
            <li key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-[15px] whitespace-pre-wrap break-words ${
                  m.role === "user" ? "bg-ink text-white" : "bg-white text-ink"
                }`}
              >
                {m.content || (streaming ? "…" : "")}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={send}
        className="mt-2 flex items-center gap-2 bg-white rounded-2xl px-4 h-12"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={streaming ? "respondendo…" : "Mande uma mensagem"}
          disabled={streaming}
          className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-muted disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          aria-label="Enviar"
          className="text-ink disabled:text-faint"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
