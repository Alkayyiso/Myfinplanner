// src/lib/supabaseClient.js
// Single Supabase client instance for the whole app.
// Credentials come from Vite env vars — never hardcoded.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error(
    "[Supabase] Missing env vars. Create .env.local with " +
    "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    // Auto sign-in as anonymous user — no login required.
    // Supabase persists the anonymous session in localStorage automatically.
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});

// ── Session helpers ───────────────────────────────────────────────────────────

// Returns the current anonymous session ID (creates one if none exists).
// This is what we use as the "user identity" for vault rows.
export async function getSessionId() {
  // Check if we already have a session
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user?.id) return session.user.id;

  // No session — sign in anonymously
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("[Supabase] Anonymous sign-in failed:", error.message);
    // Fallback: use a localStorage UUID so the app still works
    const fallback = localStorage.getItem("jbk_fallback_session") ?? crypto.randomUUID();
    localStorage.setItem("jbk_fallback_session", fallback);
    return fallback;
  }

  return data.user.id;
}
