"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { Appointment } from "@/lib/types";
import { Checkbox } from "@/components/Checkbox";
import { SimpleHeader } from "@/components/SimpleHeader";
import { Plus } from "@/components/Icons";

function fmtDT(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) +
    " • " + dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function CompromissosPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [where, setWhere] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      if (!supabase) return;
      const { data } = await supabase.from("appointments").select("*").order("starts_at");
      if (data) setItems(data as Appointment[]);
    })();
  }, []);

  async function toggle(id: string, done: boolean) {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, done } : x)));
    const supabase = supabaseBrowser();
    if (supabase) await supabase.from("appointments").update({ done }).eq("id", id);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim(), w = when.trim();
    if (!t || !w) return;
    const iso = new Date(w).toISOString();
    const optimistic: Appointment = {
      id: crypto.randomUUID(), title: t, description: null, starts_at: iso,
      ends_at: null, location: where.trim() || null, done: false,
    };
    setItems((p) => [...p, optimistic].sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
    setTitle(""); setWhen(""); setWhere(""); setAdding(false);
    const supabase = supabaseBrowser();
    if (!supabase) return;
    const { data } = await supabase.from("appointments").insert({
      title: t, starts_at: iso, location: optimistic.location,
    }).select().single();
    if (data) setItems((p) => p.map((x) => (x.id === optimistic.id ? (data as Appointment) : x)));
  }

  return (
    <div>
      <SimpleHeader title="Compromissos" subtitle="Agenda da semana" />

      <ul className="flex flex-col gap-3 mt-4">
        {items.map((a) => (
          <li key={a.id} className="bg-white rounded-2xl p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className={`font-bold text-[16px] ${a.done ? "line-through text-faint" : ""}`}>{a.title}</div>
              <div className="text-muted text-[13px]">{fmtDT(a.starts_at)}</div>
              {a.location && <div className="text-muted text-[13px]">{a.location}</div>}
            </div>
            <Checkbox checked={a.done} onChange={(v) => toggle(a.id, v)} />
          </li>
        ))}
        {items.length === 0 && !adding && (
          <li className="text-muted text-sm">Nenhum compromisso cadastrado.</li>
        )}
      </ul>

      {adding ? (
        <form onSubmit={addItem} className="mt-4 bg-white rounded-2xl p-4 flex flex-col gap-2">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título"
            className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]" />
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)}
            className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]" />
          <input value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Local (opcional)"
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
