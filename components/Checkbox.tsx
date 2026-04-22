"use client";
import { Check } from "./Icons";

export function Checkbox({
  checked,
  onChange,
  size = "md",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  size?: "md" | "lg";
}) {
  const cls = size === "lg" ? "chk-lg" : "chk";
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cls}
      data-checked={checked ? "true" : "false"}
    >
      {checked && <Check className="w-3.5 h-3.5" />}
    </button>
  );
}
