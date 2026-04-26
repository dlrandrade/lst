"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { Medication } from "@/lib/types";
import { SimpleHeader } from "@/components/SimpleHeader";
import { Plus, Pill, Check } from "@/components/Icons";

export default function RemediosPage() {
  const [items, setItems] = useState<Medication[]>([]);
  const [takenToday, setTakenToday] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [times, setTimes] = useState("08:00");

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      if (!supabase) return;
      const [m, l] = await Promise.all([
        supabase.from("medications").select("*").eq("active", true),
        supabase.from("med_logs").select("*").gte("taken_at", new Date(new Date().setHours(0,0,0,0)).toISOString()),
      ]);
      if (m.data) setItems(m.data as Medication[]);
      if (l.data) {
        const counts: Record<string, number> = {};
        for (const log of l.data as { medication_id: string }[]) {
          counts[log.medication_id] = (counts[log.medication_id] ?? 0) + 1;
        }
        setTakenToday(counts);
      }
    })();
  }, []);

  async function log(id: string) {
    setTakenToday((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
    const supabase = supabaseBrowser();
    if (supabase) await supabase.from("med_logs").insert({ medication_id: id });
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    const t = times.split(",").map((s) => s.trim()).filter(Boolean);
    const optimistic: Medication = {
      id: crypto.randomUUID(), name: n, dosage: dosage.trim() || null, times: t, active: true,
    };
    setItems((p) => [...p, optimistic]);
    setName(""); setDosage(""); setTimes("08:00"); setAdding(false);
    const supabase = supabaseBrowser();
    if (!supabase) return;
    const { data } = await supabase.from("medications").insert({
      name: n, dosage: optimistic.dosage, times: t,
    }).select().single();
    if (data) setItems((p) => p.map((x) => (x.id === optimistic.id ? (data as Medication) : x)));
  }

  return (
    <div>
      <SimpleHeader title="Remédios" subtitle="Rotina de medicação." />
      <ul className="flex flex-col gap-3 mt-4">
        {items.map((m) => {
          const taken = takenToday[m.id] ?? 0;
          const total = m.times.length || 1;
          const done = taken >= total;
          return (
            <li key={m.id} className="bg-white rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center text-ink">
                <Pill className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[16px]">{m.name}</div>
                <div className="text-muted text-[13px]">
                  {m.dosage ?? ""}{m.dosage && m.times.length ? " • " : ""}
                  {m.times.join(", ")}
                </div>
                <div className="text-muted text-[12px] mt-0.5">{taken}/{total} hoje</div>
              </div>
              <button
                onClick={() => log(m.id)}
                disabled={done}
                className={`h-9 px-3 rounded-xl font-medium text-[13px] flex items-center gap-1 ${
                  done ? "bg-bg text-faint" : "bg-ink text-white"
                }`}
              >
                <Check className="w-3.5 h-3.5" /> Tomei
              </button>
            </li>
          );
        })}
        {items.length === 0 && !adding && <li className="text-muted text-sm">Nenhum remédio cadastrado.</li>}
      </ul>

      {adding ? (
        <form onSubmit={addItem} className="mt-4 bg-white rounded-2xl p-4 flex flex-col gap-2">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome"
            className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]" />
          <input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Dosagem (ex: 500mg)"
            className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]" />
          <input value={times} onChange={(e) => setTimes(e.target.value)} placeholder="Horários (ex: 08:00, 20:00)"
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
