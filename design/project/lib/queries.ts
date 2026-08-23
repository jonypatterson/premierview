// Server-side reads for the Vercel app. Two RPCs, no joins in app code.
// Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
);

export type Summary = {
  matchweek: number; position: number;
  won: number; drawn: number; lost: number;
  goals_for: number; goals_against: number; points: number;
  prev_position_same_mw: number | null;
  prev_won_same_mw: number | null; prev_drawn_same_mw: number | null;
  prev_lost_same_mw: number | null;
  prev_gf_same_mw: number | null; prev_ga_same_mw: number | null;
  prev_final_position: number | null;
  prev_final_won: number | null; prev_final_drawn: number | null;
  prev_final_lost: number | null;
  prev_final_gf: number | null; prev_final_ga: number | null;
};

export type PlayerRow = {
  player_name: string;
  goals: number; assists: number; appearances: number;
  prev_goals: number; prev_assists: number; prev_appearances: number;
};

export type TeamPage = {
  team: { name: string; short_name: string; tla: string; crest: string | null; colour: string | null };
  summary: Summary;
  series: Record<string, number[]>;      // season label -> position by gameweek
  players: PlayerRow[];
  form: ("W" | "D" | "L")[];
  seasons: { current: string; previous: string };
  lastSync: string | null;
};

/** Everything one club's page needs, in a single round trip. */
export async function getTeamPage(code: string): Promise<TeamPage | null> {
  const { data, error } = await db.rpc("team_page", { p_code: code.toUpperCase() });
  if (error) throw error;
  if (!data || !(data as TeamPage).summary) return null;
  return data as TeamPage;
}

/** Clubs with a fixture this season — the picker list. */
export async function getClubs() {
  const { data, error } = await db.rpc("club_list");
  if (error) throw error;
  return (data ?? []) as {
    name: string; short_name: string; code: string;
    crest: string | null; colour: string | null;
  }[];
}
