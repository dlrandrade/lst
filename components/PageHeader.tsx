import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function PageHeader({ icon }: { icon: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <Link href="/" className="w-8 h-8 text-ink/60">{icon}</Link>
      <Logo className="text-[26px]" />
    </div>
  );
}
