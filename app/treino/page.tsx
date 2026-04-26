"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { WorkoutDay, WorkoutExercise } from "@/lib/types";
import { Checkbox } from "@/components/Checkbox";
import { PageHeader } from "@/components/PageHeader";
import { Dumbbell } from "@/components/Icons";

const FALLBACK_DAYS: WorkoutDay[] = [
  { id: "1", day_of_week: 1, label: "Segunda-feira" },
  { id: "2", day_of_week: 2, label: "Terça-feira" },
  { id: "3", day_of_week: 3, label: "Quarta-feira" },
  { id: "4", day_of_week: 4, label: "Quinta-feira" },
  { id: "5", day_of_week: 5, label: "Sexta-feira" },
  { id: "6", day_of_week: 6, label: "Sábado" },
  { id: "7", day_of_week: 0, label: "Domingo" },
];

const FALLBACK_EX: WorkoutExercise[] = [
  { id: "e1", day_id: "1", name: "Supino reto", done: false, position: 1 },
  { id: "e2", day_id: "1", name: "Supino inclinado", done: false, position: 2 },
  { id: "e3", day_id: "1", name: "Supino reclinado", done: false, position: 3 },
  { id: "e4", day_id: "1", name: "Voador", done: false, position: 4 },
  { id: "e5", day_id: "1", name: "Tríceps máquina", done: false, position: 5 },
  { id: "e6", day_id: "1", name: "Tríceps na polia", done: false, position: 6 },
];

export default function TreinoPage() {
  const [days, setDays] = useState<WorkoutDay[]>(FALLBACK_DAYS);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(FALLBACK_EX);

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      if (!supabase) return;
      const [d, e] = await Promise.all([
        supabase.from("workout_days").select("*").order("day_of_week"),
        supabase.from("workout_exercises").select("*").order("position"),
      ]);
      if (d.data?.length) {
        // order so today's day-of-week first? keep week order Mon..Sun
        const ordered = [...d.data].sort((a, b) => {
          const rank = (x: number) => (x === 0 ? 7 : x);
          return rank(a.day_of_week) - rank(b.day_of_week);
        });
        setDays(ordered as WorkoutDay[]);
      }
      if (e.data) setExercises(e.data as WorkoutExercise[]);
    })();
  }, []);

  async function toggle(id: string, done: boolean) {
    setExercises((p) => p.map((e) => (e.id === id ? { ...e, done } : e)));
    const supabase = supabaseBrowser();
    if (supabase) await supabase.from("workout_exercises").update({ done }).eq("id", id);
  }

  const today = new Date().getDay();
  const activeDay = days.find((d) => d.day_of_week === today) ?? days[0];

  return (
    <div>
      <PageHeader icon={<Dumbbell className="w-full h-full" />} />

      <div className="bg-white rounded-3xl p-6 min-h-[70vh]">
        <h1 className="text-[34px] leading-[1.05] font-extrabold tracking-tight mb-8">
          Treino
          <br />
          <span className="font-normal">de hoje</span>
        </h1>

        {days.map((day) => {
          const isActive = day.id === activeDay?.id;
          const items = exercises.filter((e) => e.day_id === day.id);
          return (
            <section key={day.id} className="mb-6">
              <h2
                className={`font-bold text-[19px] mb-2 ${
                  isActive ? "text-ink" : "text-faint"
                }`}
              >
                {day.label}
              </h2>
              {isActive && (
                <ul className="flex flex-col gap-2">
                  {items.map((ex) => (
                    <li
                      key={ex.id}
                      className="flex items-center justify-between"
                    >
                      <span
                        className={`text-[19px] ${
                          ex.done ? "line-through text-faint" : "text-ink/80"
                        }`}
                      >
                        {ex.name}
                      </span>
                      <Checkbox
                        checked={ex.done}
                        onChange={(v) => toggle(ex.id, v)}
                      />
                    </li>
                  ))}
                  {items.length === 0 && (
                    <li className="text-muted text-sm">
                      Descanso ou sem exercícios cadastrados.
                    </li>
                  )}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
