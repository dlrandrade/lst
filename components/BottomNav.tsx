"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Sparkles } from "./Icons";

export function BottomNav() {
  const p = usePathname();
  if (p === "/login" || p?.startsWith("/auth")) return null;
  const items = [
    { href: "/", label: "HOME", icon: Home, active: p === "/" },
    { href: "/categorias", label: "CATEGORIAS", icon: Grid, active: p === "/categorias" },
    { href: "/ai", label: "AI CHAT", icon: Sparkles, active: p === "/ai", primary: true },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[460px] px-4 pb-4 pt-2 pointer-events-none z-30">
      <div className="pointer-events-auto bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-stretch p-1.5 gap-1.5">
        {items.map((it) => {
          const Icon = it.icon;
          const base = "flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-semibold tracking-wider";
          const cls = it.primary
            ? `${base} bg-ink text-white`
            : `${base} ${it.active ? "text-ink" : "text-muted"}`;
          return (
            <Link key={it.href} href={it.href} className={cls}>
              <Icon className="w-5 h-5" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
