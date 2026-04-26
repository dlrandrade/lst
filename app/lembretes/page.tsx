"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { Reminder } from "@/lib/types";
import { Checkbox } from "@/components/Checkbox";
import { SimpleHeader } from "@/components/SimpleHeader";
import { Plus } from "@/components/Icons";

export default function LembretesPage() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      if (!supabase) return;
      const { data } = await supabase.from("reminders").select("*").order("remind_at");
      if (data) setItems(data as Reminder[]);
    })();
  }, []);

  async function toggle(id: string, done: boolean) {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, done } : x)));
    const supabase = supabaseBrowser();
    if (supabase) await supabase.from("reminders").update({ done }).eq("id", id);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim(), w = when.trim();
    if (!t || !w) return;
    const iso = new Date(w).toISOString();
    const optimistic: Reminder = {
      id: crypto.randomUUID(), title: t, remind_at: iso, recurrence: null, done: false,
    };
    setItems((p) => [...p, optimistic].sort((a, b) => a.remind_at.localeCompare(b.remind_at)));
    setTitle(""); setWhen(""); setAdding(false);
    const supabase = supabaseBrowser();
    if (!supabase) return;
    const { data } = await supabase.from("reminders").insert({ title: t, remind_at: iso }).select().single();
    if (data) setItems((p) => p.map((x) => (x.id === optimistic.id ? (data as Reminder) : x)));
  }

  return (
    <div>
      <SimpleHeader title="Lembretes" subtitle="Não deixe passar nada." />
      <ul className="flex flex-col gap-3 mt-4">
        {items.map((r) => (
          <li key={r.id} className="bg-white rounded-2xl p-4 flex items-center gap-3">
            <Checkbox checked={r.done} onChange={(v) => toggle(r.id, v)} />
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-[15px] ${r.done ? "line-through text-faint" : ""}`}>{r.title}</div>
              <div className="text-muted text-[13px]">
                {new Date(r.remind_at).toLocaleString("pt-BR", {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && !adding && <li className="text-muted text-sm">Nenhum lembrete.</li>}
      </ul>
      {adding ? (
        <form onSubmit={addItem} className="mt-4 bg-white rounded-2xl p-4 flex flex-col gap-2">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="O que lembrar"
            className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]" />
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)}
            className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdding(false)} className="flex-1 h-10 rounded-xl bg-bg text-muted">Cancelar</button>
            <button className="flex-1 h-10 rounded-xl bg-ink text-white font-medium">Salvar</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)}
          className="fixed right-6 bottom-24 w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center shadow-lg z-20">
          <Plus className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
