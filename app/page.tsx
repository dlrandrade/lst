"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { Task } from "@/lib/types";
import { Checkbox } from "@/components/Checkbox";
import { Logo } from "@/components/Logo";
import { CardLink } from "@/components/CardLink";
import { Dumbbell, Books, Fork, Search, Plus } from "@/components/Icons";

const FALLBACK_TASKS: Task[] = [
  { id: "1", title: "Beber água", done: false, position: 1 },
  { id: "2", title: "Tomar creatina", done: false, position: 2 },
  { id: "3", title: "Pagar carro", done: false, position: 3 },
  { id: "4", title: "Ler Mastria", done: false, position: 4 },
  { id: "5", title: "Hoje é Leg Day", done: false, position: 5 },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(FALLBACK_TASKS);
  const [q, setQ] = useState("");
  const [loaded, setLoaded] = useState(false);
  const supabase = supabaseBrowser();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("position");
      if (!error && data) setTasks(data as Task[]);
      setLoaded(true);
    })();
  }, []);

  async function toggle(id: string, done: boolean) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    await supabase.from("tasks").update({ done }).eq("id", id);
  }

  async function addTask() {
    const title = q.trim();
    if (!title) return;
    const position = (tasks.at(-1)?.position ?? 0) + 1;
    const optimistic: Task = { id: crypto.randomUUID(), title, done: false, position };
    setTasks((p) => [...p, optimistic]);
    setQ("");
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Logo className="text-[26px]" />
      </div>

      <h1 className="text-[34px] leading-[1.05] font-extrabold tracking-tight">
        <span className="text-muted font-bold">E aí, Daniel,</span>
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
          subtitle="de hoje"
        />
        <CardLink
          href="/livros"
          icon={<Books className="w-full h-full" />}
          title="Mastria"
          subtitle="Robert Grenee"
        />
        <CardLink
          href="/dieta"
          icon={<Fork className="w-full h-full" />}
          title="Café"
          subtitle="da Manhã"
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
