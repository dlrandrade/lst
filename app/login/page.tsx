"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setLoading(true);
    setErr(null);
    const supabase = supabaseBrowser();
    if (!supabase) {
      setErr("Supabase não está configurado.");
      setLoading(false);
      return;
    }
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center gap-8">
      <div className="flex justify-center">
        <Logo className="text-[40px] text-ink" />
      </div>

      <div>
        <h1 className="text-[28px] leading-[1.1] font-extrabold tracking-tight text-center">
          Entre no seu lst
        </h1>
        <p className="text-muted text-center mt-2 text-[14px]">
          Mandamos um link mágico no seu e-mail.
        </p>
      </div>

      {sent ? (
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="font-bold text-[16px] mb-1">Link enviado</div>
          <div className="text-muted text-[14px]">
            Abra <span className="text-ink">{email}</span> e clique no link para entrar.
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="bg-white rounded-2xl px-4 h-12 outline-none text-[15px]"
          />
          <button
            disabled={loading}
            className="h-12 rounded-2xl bg-ink text-white font-medium disabled:opacity-50"
          >
            {loading ? "Enviando…" : "Enviar link"}
          </button>
          {err && <div className="text-red-600 text-[13px] text-center">{err}</div>}
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
