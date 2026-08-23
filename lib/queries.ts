// Server-side reads for the Vercel app. Two RPCs, no joins in app code.
// Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

import { createClient } from "@supabase/supabase-js";
import type { Club, TeamPage } from "./types";

// The PremierView defaults, so a fresh clone or deploy works with no setup.
// The anon key is public by design: every table is read-only through RLS and
// writes only happen inside the sync Edge Function. Set the env vars to point
// this at a different instance — they take precedence.
const DEFAULT_URL = "https://bgijzlomphztrxobsgiq.supabase.co";
const DEFAULT_ANON_KEY =
  "REDACTED-SUPABASE-ANON-KEY";

// `||` not `??` — an empty env var must fall back too.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

const db = createClient(url, anonKey, { auth: { persistSession: false } });

/** Everything one club's page needs, in a single round trip. */
export async function getTeamPage(code: string): Promise<TeamPage | null> {
  const { data, error } = await db.rpc("team_page", { p_code: code.toUpperCase() });
  if (error) throw error;
  if (!data || !(data as TeamPage).summary) return null;
  return data as TeamPage;
}

/** Clubs with a fixture this season — the picker list. Promotions need no code change. */
export async function getClubs(): Promise<Club[]> {
  const { data, error } = await db.rpc("club_list");
  if (error) throw error;
  return (data ?? []) as Club[];
}
