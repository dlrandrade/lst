"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { Exam } from "@/lib/types";
import { Checkbox } from "@/components/Checkbox";
import { SimpleHeader } from "@/components/SimpleHeader";
import { Plus } from "@/components/Icons";

export default function ExamesPage() {
  const [items, setItems] = useState<Exam[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      if (!supabase) return;
      const { data } = await supabase
        .from("exams")
        .select("*")
        .order("scheduled_for", { ascending: true, nullsFirst: false });
      if (data) setItems(data as Exam[]);
    })();
  }, []);

  async function toggle(id: string, done: boolean) {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, done } : x)));
    const supabase = supabaseBrowser();
    if (supabase) await supabase.from("exams").update({ done }).eq("id", id);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const iso = when ? new Date(when).toISOString() : null;
    const optimistic: Exam = {
      id: crypto.randomUUID(), title: t, scheduled_for: iso,
      result: null, notes: notes.trim() || null, done: false,
    };
    setItems((p) => [...p, optimistic]);
    setTitle(""); setWhen(""); setNotes(""); setAdding(false);
    const supabase = supabaseBrowser();
    if (!supabase) return;
    const { data } = await supabase.from("exams").insert({
      title: t, scheduled_for: iso, notes: optimistic.notes,
    }).select().single();
    if (data) setItems((p) => p.map((x) => (x.id === optimistic.id ? (data as Exam) : x)));
  }

  return (
    <div>
      <SimpleHeader title="Exames" subtitle="Saúde em dia." />

      <ul className="flex flex-col gap-3 mt-4">
        {items.map((x) => (
          <li key={x.id} className="bg-white rounded-2xl p-4 flex items-start gap-3">
            <Checkbox checked={x.done} onChange={(v) => toggle(x.id, v)} />
            <div className="flex-1 min-w-0">
              <div className={`font-bold text-[16px] ${x.done ? "line-through text-faint" : ""}`}>{x.title}</div>
              {x.scheduled_for && (
                <div className="text-muted text-[13px]">
                  {new Date(x.scheduled_for).toLocaleString("pt-BR", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              )}
              {x.notes && <div className="text-muted text-[13px] mt-1">{x.notes}</div>}
              {x.result && <div className="text-ink text-[13px] mt-1">Resultado: {x.result}</div>}
            </div>
          </li>
        ))}
        {items.length === 0 && !adding && (
          <li className="text-muted text-sm">Nenhum exame cadastrado.</li>
        )}
      </ul>

      {adding ? (
        <form onSubmit={addItem} className="mt-4 bg-white rounded-2xl p-4 flex flex-col gap-2">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exame"
            className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]" />
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)}
            className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)"
            className="bg-bg rounded-xl px-3 py-2 outline-none text-[15px] min-h-[60px]" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdding(false)} className="flex-1 h-10 rounded-xl bg-bg text-muted">Cancelar</button>
            <button className="flex-1 h-10 rounded-xl bg-ink text-white font-medium">Salvar</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)}
          className="fixed right-6 bottom-24 w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center shadow-lg z-20"
          aria-label="Adicionar exame">
          <Plus className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
