import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Public Supabase credentials. The anon key is safe to ship to the browser
// — row-level security policies enforce access in the database.
const DEFAULT_URL = "https://pfirxbvkombvzdeartqs.supabase.co";
const DEFAULT_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmaXJ4YnZrb21idnpkZWFydHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NDk3NTMsImV4cCI6MjA5MjIyNTc1M30.DJWyQR9VdMV-XRRpU9Cw6EHsKEnH4NxqbmySYzs9QmM";

let cached: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON;
  if (!url || !key) return null;
  cached = createBrowserClient(url, key);
  return cached;
}
