"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { Meal } from "@/lib/types";
import { Checkbox } from "@/components/Checkbox";
import { PageHeader } from "@/components/PageHeader";
import { Fork } from "@/components/Icons";

const FALLBACK: Meal[] = [
  { id: "1", label: "Café da manhã", month: null,
    items: ["3 ovos","1 fatia de pão de caixa","1 fruta","Café sem açúcar","Iogurte natural com granola"],
    done: false, position: 1 },
  { id: "2", label: "Almoço", month: null,
    items: ["300g de proteína","300g de carboidrato","Refrigerante sem açúcar"],
    done: false, position: 2 },
  { id: "3", label: "Lanche", month: null,
    items: ["Iogurte natural com granola"],
    done: false, position: 3 },
  { id: "4", label: "Jantar", month: null,
    items: ["200g de proteína","Salada à vontade"],
    done: false, position: 4 },
];

const MONTHS_PT = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export default function DietaPage() {
  const [meals, setMeals] = useState<Meal[]>(FALLBACK);

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      if (!supabase) return;
      const { data } = await supabase.from("meals").select("*").order("position");
      if (data?.length) setMeals(data as Meal[]);
    })();
  }, []);

  async function toggle(id: string, done: boolean) {
    setMeals((p) => p.map((m) => (m.id === id ? { ...m, done } : m)));
    const supabase = supabaseBrowser();
    if (supabase) await supabase.from("meals").update({ done }).eq("id", id);
  }

  const month = MONTHS_PT[new Date().getMonth()];

  return (
    <div>
      <PageHeader icon={<Fork className="w-full h-full" />} />

      <div className="bg-white rounded-3xl p-6 min-h-[70vh]">
        <h1 className="text-[34px] leading-[1.05] font-extrabold tracking-tight mb-8">
          Dieta
          <br />
          <span className="font-normal">{month}</span>
        </h1>

        <div className="flex flex-col gap-7">
          {meals.map((m) => (
            <section key={m.id}>
              <div className="flex items-center justify-between mb-2">
                <h2
                  className={`font-bold text-[19px] ${
                    m.done ? "text-faint" : "text-ink"
                  }`}
                >
                  {m.label}
                </h2>
                <Checkbox checked={m.done} onChange={(v) => toggle(m.id, v)} />
              </div>
              <ul className="flex flex-col gap-1">
                {m.items.map((it, i) => (
                  <li
                    key={i}
                    className={`text-[18px] leading-snug ${
                      m.done ? "text-faint line-through" : "text-ink/70"
                    }`}
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
