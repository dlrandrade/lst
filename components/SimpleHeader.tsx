import Link from "next/link";
import { Back } from "./Icons";

export function SimpleHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <div className="flex items-center mb-4">
        <Link href="/" className="w-8 h-8 -ml-1 text-ink flex items-center"><Back className="w-6 h-6" /></Link>
      </div>
      <h1 className="text-[34px] leading-[1.05] font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="text-muted mt-1 mb-6">{subtitle}</p>}
    </>
  );
}
