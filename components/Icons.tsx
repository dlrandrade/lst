import type { SVGProps } from "react";

export function Dumbbell(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 9v6M2 10.5v3M20 9v6M22 10.5v3M6 7v10M18 7v10M6 12h12" />
    </svg>
  );
}

export function Books(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <rect x="3" y="4" width="3" height="16" rx="0.5"/>
      <rect x="7" y="6" width="3" height="14" rx="0.5"/>
      <rect x="11" y="3" width="3" height="17" rx="0.5"/>
      <rect x="15" y="7" width="3" height="13" rx="0.5"/>
      <rect x="19" y="5" width="2.5" height="15" rx="0.5"/>
    </svg>
  );
}

export function Fork(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 3v8a2 2 0 0 0 2 2v8" />
      <path d="M5 3v5M9 3v5" />
      <path d="M17 3c-1.5 3-1.5 6 0 9v9" />
    </svg>
  );
}

export function Check(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="4 12 10 18 20 6" />
    </svg>
  );
}

export function Search(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function Plus(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
