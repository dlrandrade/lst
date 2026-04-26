"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import type { WaterEntry } from "@/lib/types";
import { Back, Drop } from "@/components/Icons";

const QUICK = [250, 500];

export default function AguaPage() {
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [goal, setGoal] = useState(3000);

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      if (!supabase) return;
      const [e, p] = await Promise.all([
        supabase.from("water_entries").select("*").order("drank_at", { ascending: false }),
        supabase.from("prefs").select("*").eq("id", 1).single(),
      ]);
      if (e.data) setEntries(e.data as WaterEntry[]);
      if (p.data?.daily_water_goal_ml) setGoal(p.data.daily_water_goal_ml);
    })();
  }, []);

  const today = useMemo(() => new Date().toDateString(), []);
  const todayEntries = entries.filter((e) => new Date(e.drank_at).toDateString() === today);
  const todayMl = todayEntries.reduce((s, e) => s + e.amount_ml, 0);
  const pct = Math.min(100, (todayMl / goal) * 100);

  async function add(amount: number) {
    const supabase = supabaseBrowser();
    const now = new Date().toISOString();
    const optimistic: WaterEntry = { id: crypto.randomUUID(), amount_ml: amount, drank_at: now };
    setEntries((p) => [optimistic, ...p]);
    if (!supabase) return;
    const { data } = await supabase
      .from("water_entries")
      .insert({ amount_ml: amount, drank_at: now })
      .select().single();
    if (data) setEntries((p) => p.map((e) => (e.id === optimistic.id ? (data as WaterEntry) : e)));
  }

  const week = useMemo(() => {
    const days = ["D","S","T","Q","Q","S","S"];
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - now.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const ml = entries
        .filter((e) => new Date(e.drank_at).toDateString() === d.toDateString())
        .reduce((s, e) => s + e.amount_ml, 0);
      return { label: days[i], ml, today: d.toDateString() === now.toDateString() };
    });
  }, [entries]);

  const maxMl = Math.max(goal, ...week.map((w) => w.ml), 1);

  return (
    <div>
      <div className="flex items-center mb-4">
        <Link href="/" className="w-8 h-8 -ml-1 text-ink flex items-center"><Back className="w-6 h-6" /></Link>
      </div>

      <h1 className="text-[34px] leading-[1.05] font-extrabold tracking-tight">Água.</h1>
      <p className="text-muted mt-1 mb-6">Mantenha-se hidratado hoje.</p>

      <div className="flex justify-center my-4">
        <Ring pct={pct} ml={todayMl} goal={goal} />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {QUICK.map((q, i) => (
          <button
            key={q}
            onClick={() => add(q)}
            className={`h-12 rounded-2xl font-semibold text-[15px] ${
              i === QUICK.length - 1
                ? "bg-ink text-white"
                : "bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            }`}
          >
            + {q}ml
          </button>
        ))}
      </div>

      <h2 className="font-bold text-[19px] mt-8 mb-3">Hoje</h2>
      <ul className="flex flex-col gap-2">
        {todayEntries.length === 0 && (
          <li className="text-muted text-sm">Nenhum registro ainda hoje.</li>
        )}
        {todayEntries.map((e) => (
          <li key={e.id} className="flex items-center justify-between bg-white rounded-xl px-4 h-12">
            <span className="flex items-center gap-3 text-[15px]">
              <Drop className="w-4 h-4 text-ink" />
              {e.amount_ml}ml
            </span>
            <span className="text-muted text-[13px]">
              {new Date(e.drank_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </li>
        ))}
      </ul>

      <h2 className="font-bold text-[19px] mt-8 mb-3">Histórico</h2>
      <div className="bg-white rounded-2xl p-4">
        <div className="flex items-end justify-between gap-2 h-24">
          {week.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex-1 w-full flex items-end">
                <div
                  className={`w-full rounded-md ${w.today ? "bg-ink" : "bg-ink/20"}`}
                  style={{ height: `${Math.max(4, (w.ml / maxMl) * 100)}%` }}
                />
              </div>
              <span className={`text-[10px] ${w.today ? "font-bold text-ink" : "text-muted"}`}>{w.label}</span>
            </div>
          ))}
        </div>
        <div className="text-muted text-[13px] mt-3 text-center">
          Meta Diária: {(goal / 1000).toFixed(1)}L
        </div>
      </div>
    </div>
  );
}

function Ring({ pct, ml, goal }: { pct: number; ml: number; goal: number }) {
  const r = 90;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div className="relative w-[220px] h-[220px]">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r={r} stroke="#E5E5EA" strokeWidth="6" fill="none" />
        <circle
          cx="110" cy="110" r={r}
          stroke="#0A0A0A" strokeWidth="6" fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[28px] font-extrabold tracking-tight">{(ml / 1000).toFixed(1)}L</div>
        <div className="text-muted text-[12px]">de {(goal / 1000).toFixed(1)}L</div>
      </div>
    </div>
  );
}
