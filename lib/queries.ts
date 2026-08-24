// Server-side reads for the Vercel app. Two RPCs, no joins in app code.
//
// Config comes from the environment, never from the source. Every read here
// runs on the server, so the unprefixed SUPABASE_* names are preferred: they
// stay out of the client bundle entirely. NEXT_PUBLIC_* is accepted as a
// fallback because ARCHITECTURE.md documents those names.
//
//   SUPABASE_URL       (or NEXT_PUBLIC_SUPABASE_URL)
//   SUPABASE_ANON_KEY  (or NEXT_PUBLIC_SUPABASE_ANON_KEY)

import { createClient } from "@supabase/supabase-js";
import type { Club, LeagueTable, TeamPage } from "./types";

// `||` not `??` — an empty string must fall through too.
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing SUPABASE_URL / SUPABASE_ANON_KEY. Copy .env.example to .env.local " +
      "for local work, or set them in the Vercel project's environment variables.",
  );
}

const db = createClient(url, anonKey, { auth: { persistSession: false } });

/**
 * Everything one club's page needs, in a single round trip.
 *
 * Returns null only when the code isn't a club at all. A known club that
 * hasn't finished a match yet comes back with `summary: null` — the two cases
 * get different copy on the problem screen, so they must stay distinguishable.
 */
export async function getTeamPage(code: string): Promise<TeamPage | null> {
  const { data, error } = await db.rpc("team_page", { p_code: code.toUpperCase() });
  if (error) throw error;
  if (!data || !(data as TeamPage).team) return null;
  return data as TeamPage;
}

/** Clubs with a fixture this season — the picker list. Promotions need no code change. */
export async function getClubs(): Promise<Club[]> {
  const { data, error } = await db.rpc("club_list");
  if (error) throw error;
  return (data ?? []) as Club[];
}

/** Standings for the latest matchweek, with each club's finish last season. */
export async function getLeagueTable(): Promise<LeagueTable | null> {
  const { data, error } = await db.rpc("league_table");
  if (error) throw error;
  return (data as LeagueTable) ?? null;
}
