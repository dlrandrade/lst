"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { Task, Meal, Book, WorkoutDay, WorkoutExercise } from "@/lib/types";
import { Checkbox } from "@/components/Checkbox";
import { Logo } from "@/components/Logo";
import { CardLink } from "@/components/CardLink";
import { Dumbbell, Books, Fork, Search, Plus } from "@/components/Icons";

const FALLBACK_TASKS: Task[] = [
  { id: "1", title: "Beber água", done: false, position: 1 },
  { id: "2", title: "Tomar creatina", done: false, position: 2 },
  { id: "3", title: "Ler", done: false, position: 3 },
];

const DAY_LABELS = [
  "Domingo","Segunda-feira","Terça-feira","Quarta-feira",
  "Quinta-feira","Sexta-feira","Sábado",
];

function mealOfNow(): "Café da manhã" | "Almoço" | "Lanche" | "Jantar" {
  const h = new Date().getHours();
  if (h < 11) return "Café da manhã";
  if (h < 15) return "Almoço";
  if (h < 18) return "Lanche";
  return "Jantar";
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia,";
  if (h < 18) return "Boa tarde,";
  return "Boa noite,";
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(FALLBACK_TASKS);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null);
  const [workoutCount, setWorkoutCount] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [q, setQ] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      if (!supabase) { setLoaded(true); return; }

      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;
      if (u) {
        const meta = (u.user_metadata ?? {}) as { full_name?: string; name?: string };
        const fromMeta = meta.full_name || meta.name;
        setUserName(fromMeta || (u.email?.split("@")[0] ?? ""));
      }

      const todayDow = new Date().getDay();
      const wantedMeal = mealOfNow();

      const [tRes, mRes, bRes, wdRes] = await Promise.all([
        supabase.from("tasks").select("*").order("position"),
        supabase.from("meals").select("*").eq("label", wantedMeal).limit(1).maybeSingle(),
        supabase.from("books").select("*").eq("read", false).order("position").limit(1).maybeSingle(),
        supabase.from("workout_days").select("*").eq("day_of_week", todayDow).maybeSingle(),
      ]);

      if (tRes.data?.length) setTasks(tRes.data as Task[]);
      if (mRes.data) setMeal(mRes.data as Meal);
      if (bRes.data) setBook(bRes.data as Book);
      if (wdRes.data) {
        setWorkoutDay(wdRes.data as WorkoutDay);
        const { count } = await supabase
          .from("workout_exercises")
          .select("id", { count: "exact", head: true })
          .eq("day_id", (wdRes.data as WorkoutDay).id);
        setWorkoutCount(count ?? 0);
      }
      setLoaded(true);
    })();
  }, []);

  async function toggle(id: string, done: boolean) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    const supabase = supabaseBrowser();
    if (supabase) await supabase.from("tasks").update({ done }).eq("id", id);
  }

  async function addTask() {
    const title = q.trim();
    if (!title) return;
    const position = (tasks.at(-1)?.position ?? 0) + 1;
    const optimistic: Task = { id: crypto.randomUUID(), title, done: false, position };
    setTasks((p) => [...p, optimistic]);
    setQ("");
    const supabase = supabaseBrowser();
    if (!supabase) return;
    const { data } = await supabase
      .from("tasks")
      .insert({ title, position })
      .select()
      .single();
    if (data) setTasks((p) => p.map((t) => (t.id === optimistic.id ? (data as Task) : t)));
  }

  const filtered = q
    ? tasks.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()))
    : tasks;

  const treinoSubtitle = useMemo(() => {
    if (!workoutDay) return "de hoje";
    if (workoutCount === 0) return "descanso";
    return DAY_LABELS[workoutDay.day_of_week].replace("-feira", "");
  }, [workoutDay, workoutCount]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Logo className="text-[26px]" />
      </div>

      <h1 className="text-[34px] leading-[1.05] font-extrabold tracking-tight">
        <span className="text-muted font-bold">
          {greeting()} {userName || "você"},
        </span>
        <br />
        Muita coisa pra fazer hoje? Que tal começar agora?
      </h1>

      <ul className="flex flex-col gap-3 mt-2">
        {filtered.map((t) => (
          <li key={t.id} className="flex items-center gap-4">
            <Checkbox
              size="lg"
              checked={t.done}
              onChange={(v) => toggle(t.id, v)}
            />
            <span
              className={`text-[22px] leading-tight ${
                t.done ? "line-through text-faint" : "text-ink/80"
              }`}
            >
              {t.title}
            </span>
          </li>
        ))}
        {loaded && filtered.length === 0 && (
          <li className="text-muted text-sm">Sem tarefas por aqui.</li>
        )}
      </ul>

      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pt-2">
        <CardLink
          href="/treino"
          icon={<Dumbbell className="w-full h-full" />}
          title="Treino"
          subtitle={treinoSubtitle}
        />
        <CardLink
          href="/livros"
          icon={<Books className="w-full h-full" />}
          title={book?.title ?? "Livros"}
          subtitle={book?.author ?? "sua estante"}
        />
        <CardLink
          href="/dieta"
          icon={<Fork className="w-full h-full" />}
          title={meal?.label ?? mealOfNow()}
          subtitle={meal?.items[0] ?? "do dia"}
        />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); addTask(); }}
        className="mt-2 flex items-center gap-2 bg-white rounded-2xl px-4 h-12 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar ou adicionar…"
          className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-muted"
        />
        <button type="submit" aria-label="Adicionar" className="text-muted">
          {q.trim() ? <Plus className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
