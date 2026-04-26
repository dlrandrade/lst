"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import type { Movie } from "@/lib/types";
import { Back, Bookmark, Check, Film, Plus } from "@/components/Icons";

const FALLBACK: Movie[] = [
  { id: "1", title: "Oppenheimer", year: 2023, genres: ["Biography","Drama"], poster_url: null, rating: null, watched: false, watched_at: null, position: 1 },
  { id: "2", title: "Dune: Part Two", year: 2024, genres: ["Sci-Fi","Drama"], poster_url: null, rating: null, watched: false, watched_at: null, position: 2 },
  { id: "3", title: "Inception", year: 2010, genres: ["Sci-Fi","Action"], poster_url: null, rating: 4.5, watched: true, watched_at: null, position: 3 },
  { id: "4", title: "Interstellar", year: 2014, genres: ["Sci-Fi","Drama"], poster_url: null, rating: 5.0, watched: true, watched_at: null, position: 4 },
];

export default function FilmesPage() {
  const [movies, setMovies] = useState<Movie[]>(FALLBACK);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState<string>("");

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      if (!supabase) return;
      const { data } = await supabase.from("movies").select("*").order("position");
      if (data?.length) setMovies(data as Movie[]);
    })();
  }, []);

  async function toggleWatched(m: Movie) {
    const watched = !m.watched;
    setMovies((p) => p.map((x) => (x.id === m.id ? { ...x, watched } : x)));
    const supabase = supabaseBrowser();
    if (supabase) await supabase.from("movies").update({ watched, watched_at: watched ? new Date().toISOString() : null }).eq("id", m.id);
  }

  async function addMovie(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const position = (movies.at(-1)?.position ?? 0) + 1;
    const optimistic: Movie = {
      id: crypto.randomUUID(), title: t, year: year ? Number(year) : null,
      genres: [], poster_url: null, rating: null, watched: false, watched_at: null, position,
    };
    setMovies((p) => [...p, optimistic]);
    setTitle(""); setYear(""); setAdding(false);
    const supabase = supabaseBrowser();
    if (!supabase) return;
    const { data } = await supabase.from("movies")
      .insert({ title: t, year: optimistic.year, position }).select().single();
    if (data) setMovies((p) => p.map((x) => (x.id === optimistic.id ? (data as Movie) : x)));
  }

  const toWatch = movies.filter((m) => !m.watched);
  const watched = movies.filter((m) => m.watched);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="w-9 h-9 text-ink"><Back className="w-6 h-6" /></Link>
        <span className="font-black text-[20px] tracking-tight text-ink">lst</span>
        <div className="w-9 h-9 rounded-full bg-ink/10" />
      </div>

      <h1 className="text-[34px] leading-[1.05] font-extrabold tracking-tight mb-6">Filmes</h1>

      <section>
        <h2 className="font-bold text-[15px] mb-3">Para Assistir</h2>
        <ul className="flex flex-col gap-3">
          {toWatch.map((m) => (
            <li key={m.id} className="bg-white rounded-2xl p-3 flex items-center gap-3">
              <Poster title={m.title} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] truncate">{m.title}</div>
                <div className="text-muted text-[13px] truncate">
                  {m.year ? `${m.year} • ` : ""}{m.genres.join(", ")}
                </div>
              </div>
              <button
                onClick={() => toggleWatched(m)}
                aria-label="Marcar como assistido"
                className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center text-ink"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </li>
          ))}
          {toWatch.length === 0 && <li className="text-muted text-sm">Nada na fila.</li>}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-bold text-[15px] mb-3">Assistidos</h2>
        <ul className="flex flex-col gap-3">
          {watched.map((m) => (
            <li key={m.id} className="bg-white rounded-2xl p-3 flex items-center gap-3">
              <Poster title={m.title} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] truncate">{m.title}</div>
                <div className="text-muted text-[13px] truncate">
                  {m.year ? `${m.year} • ` : ""}{m.genres.join(", ")}
                </div>
                {m.rating != null && (
                  <div className="text-ink text-[12px] mt-0.5">
                    {"★".repeat(Math.round(m.rating))}{"☆".repeat(5 - Math.round(m.rating))} {m.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleWatched(m)}
                className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center"
              >
                <Check className="w-4 h-4" />
              </button>
            </li>
          ))}
          {watched.length === 0 && <li className="text-muted text-sm">Nada assistido ainda.</li>}
        </ul>
      </section>

      {adding ? (
        <form onSubmit={addMovie} className="mt-6 bg-white rounded-2xl p-4 flex flex-col gap-2">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título"
            className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]" />
          <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Ano"
            inputMode="numeric" className="bg-bg rounded-xl px-3 h-10 outline-none text-[15px]" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdding(false)} className="flex-1 h-10 rounded-xl bg-bg text-muted">Cancelar</button>
            <button className="flex-1 h-10 rounded-xl bg-ink text-white font-medium">Adicionar</button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="fixed right-6 bottom-24 w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center shadow-lg z-20"
          aria-label="Adicionar filme"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

function Poster({ title }: { title: string }) {
  return (
    <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-ink/80 to-ink/30 flex items-center justify-center flex-none">
      <Film className="w-6 h-6 text-white/70" />
      <span className="sr-only">{title}</span>
    </div>
  );
}
