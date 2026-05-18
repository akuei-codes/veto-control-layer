/**
 * Lazy Supabase singleton.
 *
 * Returns `null` when env vars are missing — in that case the app falls
 * back to mock/demo mode and uses the in-memory veto-store only.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isMockAuthMode = !url || !anonKey;

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (isMockAuthMode) return null;
  if (_client) return _client;
  _client = createClient(url!, anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}

export const AUTH_REDIRECT_URL =
  (import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined) ||
  (typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "");
