"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  Dumbbell, Books, Fork, Drop, Calendar, Bell, Pill, Film, Flask,
} from "@/components/Icons";

const CATS = [
  { href: "/treino",       label: "Treino",       Icon: Dumbbell },
  { href: "/dieta",        label: "Dieta",        Icon: Fork },
  { href: "/livros",       label: "Livros",       Icon: Books },
  { href: "/agua",         label: "Água",         Icon: Drop },
  { href: "/compromissos", label: "Compromissos", Icon: Calendar },
  { href: "/lembretes",    label: "Lembretes",    Icon: Bell },
  { href: "/remedios",     label: "Remédios",     Icon: Pill },
  { href: "/filmes",       label: "Filmes",       Icon: Film },
  { href: "/exames",       label: "Exames",       Icon: Flask },
];

export default function CategoriasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Logo className="text-[26px]" />
      </div>

      <h1 className="text-[34px] leading-[1.05] font-extrabold tracking-tight">
        Categorias
        <br />
        <span className="font-normal text-muted">tudo num lugar só</span>
      </h1>

      <div className="grid grid-cols-2 gap-3">
        {CATS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="aspect-square rounded-2xl bg-white p-4 flex flex-col justify-between active:scale-[0.98] transition shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <div className="text-ink/80 w-7 h-7">
              <Icon className="w-full h-full" />
            </div>
            <div className="font-bold text-[15px] leading-tight">{label}</div>
          </Link>
        ))}
      </div>

      <form action="/auth/signout" method="post" className="mt-4">
        <button className="w-full h-12 rounded-2xl bg-white text-muted text-[14px] font-medium">
          Sair
        </button>
      </form>
    </div>
  );
}
