"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { Book } from "@/lib/types";
import { Checkbox } from "@/components/Checkbox";
import { PageHeader } from "@/components/PageHeader";
import { Books as BooksIcon, Plus } from "@/components/Icons";

const FALLBACK: Book[] = [
  { id: "1", title: "Maestria", author: "Robert Greene", year: 2026, read: false, position: 1 },
  { id: "2", title: "Dom Quixote", author: "Miguel de Cervantes", year: 2026, read: false, position: 2 },
  { id: "3", title: "1984", author: "George Orwell", year: 2026, read: false, position: 3 },
  { id: "4", title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", year: 2026, read: false, position: 4 },
  { id: "5", title: "Dom Casmurro", author: "Machado de Assis", year: 2026, read: false, position: 5 },
  { id: "6", title: "Cem Anos de Solidão", author: "Gabriel García Márquez", year: 2026, read: false, position: 6 },
  { id: "7", title: "Orgulho e Preconceito", author: "Jane Austen", year: 2026, read: false, position: 7 },
];

export default function LivrosPage() {
  const [books, setBooks] = useState<Book[]>(FALLBACK);
  const [year, setYear] = useState<number>(2026);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const supabase = supabaseBrowser();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("books")
        .select("*")
        .order("position");
      if (data?.length) setBooks(data as Book[]);
    })();
  }, []);

  async function toggle(id: string, read: boolean) {
    setBooks((p) => p.map((b) => (b.id === id ? { ...b, read } : b)));
    await supabase.from("books").update({ read }).eq("id", id);
  }

  async function addBook(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim(); const a = author.trim();
    if (!t) return;
    const position = (books.at(-1)?.position ?? 0) + 1;
    const optimistic: Book = {
      id: crypto.randomUUID(), title: t, author: a || "—",
      year, read: false, position,
    };
    setBooks((p) => [...p, optimistic]);
    setTitle(""); setAuthor(""); setAdding(false);
    const { data } = await supabase
      .from("books")
      .insert({ title: t, author: a || "—", year, position })
      .select().single();
    if (data) setBooks((p) => p.map((b) => (b.id === optimistic.id ? (data as Book) : b)));
  }

  const visible = books.filter((b) => b.year === year);
  const firstBook = visible[0];
  const rest = visible.slice(1);

  return (
    <div>
      <PageHeader icon={<BooksIcon className="w-full h-full" />} />

      <div className="bg-white rounded-3xl p-6 min-h-[70vh] flex flex-col">
        <h1 className="text-[34px] leading-[1.05] font-extrabold tracking-tight mb-8">
          Livros
          <br />
          <span className="font-normal">{year}</span>
        </h1>

        {firstBook && (
          <section className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-bold text-[19px] leading-tight">
                  {firstBook.title}
                </div>
                <div className="text-ink/60 text-[18px]">{firstBook.author}</div>
              </div>
              <Checkbox
                checked={firstBook.read}
                onChange={(v) => toggle(firstBook.id, v)}
              />
            </div>
          </section>
        )}

        <ul className="flex flex-col gap-4 flex-1">
          {rest.map((b) => (
            <li key={b.id} className="flex items-start justify-between gap-4">
              <div>
                <div
                  className={`font-bold text-[19px] leading-tight ${
                    b.read ? "text-faint line-through" : "text-faint"
                  }`}
                >
                  {b.title}
                </div>
                <div className="text-faint text-[18px]">{b.author}</div>
              </div>
              <Checkbox
                checked={b.read}
                onChange={(v) => toggle(b.id, v)}
              />
            </li>
          ))}
        </ul>

        {adding && (
          <form onSubmit={addBook} className="mt-4 flex flex-col gap-2">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]"
            />
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Autor"
              className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="flex-1 h-10 rounded-xl bg-bg text-muted"
              >
                Cancelar
              </button>
              <button className="flex-1 h-10 rounded-xl bg-ink text-white font-medium">
                Adicionar
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setYear(year === 2026 ? 2025 : 2026)}
            className="px-3 h-8 rounded-full bg-bg text-muted text-[14px]"
          >
            {year === 2026 ? "Lidos, 2025" : "Meta, 2026"}
          </button>
          <button
            onClick={() => setAdding((v) => !v)}
            aria-label="Adicionar livro"
            className="w-8 h-8 rounded-full bg-bg text-muted flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
