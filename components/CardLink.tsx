import Link from "next/link";
import type { ReactNode } from "react";

export function CardLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex-none w-[150px] h-[150px] rounded-2xl bg-white p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:scale-[0.98] transition"
    >
      <div className="text-ink/80 w-8 h-8">{icon}</div>
      <div>
        <div className="font-bold text-[15px] leading-tight">{title}</div>
        <div className="text-muted text-[14px] leading-tight">{subtitle}</div>
      </div>
    </Link>
  );
}
