import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";

function publicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return { url, key };
}

let cachedBrowser: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (cachedBrowser) return cachedBrowser;
  const { url, key } = publicEnv();
  cachedBrowser = createBrowserClient(url, key);
  return cachedBrowser;
}

/** Middleware client — refreshes the session and forwards cookies on the response. */
export function supabaseMiddleware(req: NextRequest, res: NextResponse) {
  const { url, key } = publicEnv();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        for (const { name, value, options } of toSet) {
          req.cookies.set(name, value);
          res.cookies.set(name, value, options as any);
        }
      },
    },
  });
}
