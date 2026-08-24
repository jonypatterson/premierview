// Shapes returned by the two Postgres RPCs. See design/project/ARCHITECTURE.md.

export type Summary = {
  matchweek: number;
  position: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
  prev_position_same_mw: number | null;
  prev_won_same_mw: number | null;
  prev_drawn_same_mw: number | null;
  prev_lost_same_mw: number | null;
  prev_gf_same_mw: number | null;
  prev_ga_same_mw: number | null;
  prev_final_position: number | null;
  prev_final_won: number | null;
  prev_final_drawn: number | null;
  prev_final_lost: number | null;
  prev_final_gf: number | null;
  prev_final_ga: number | null;
};

export type PlayerRow = {
  player_name: string;
  goals: number;
  assists: number;
  appearances: number;
  prev_goals: number;
  prev_assists: number;
  prev_appearances: number;
};

export type FormResult = "W" | "D" | "L";

export type Club = {
  name: string;
  short_name: string | null;
  code: string;
  crest: string | null;
  colour: string | null;
};

export type TeamPage = {
  team: {
    name: string;
    short_name: string | null;
    tla: string;
    crest: string | null;
    colour: string | null;
  };
  /** null for a known club that hasn't completed a match this season. */
  summary: Summary | null;
  /** season label -> league position by gameweek (index 0 = MW 1, null = not played) */
  series: Record<string, (number | null)[]>;
  /** season label -> *cumulative* goals by gameweek; the UI diffs it to per-week. */
  goals_series?: Record<string, (number | null)[]> | null;
  players: PlayerRow[];
  form: FormResult[];
  seasons: { current: string; previous: string };
  lastSync: string | null;
};

/** A team page that has a summary — what the Season and Players screens need. */
export type PlayedTeamPage = TeamPage & { summary: Summary };

/** Same-matchweek is the fair comparison; final-table is last season's finish. */
export type CompareMode = "same-matchweek" | "final-table";

/** One club's row in the league table, from the league_table() RPC. */
export type LeagueRow = {
  pos: number;
  code: string;
  name: string;
  short_name: string | null;
  colour: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  /** Final position last season; null for a promoted club. */
  prev_pos: number | null;
  /** prev_pos - pos, so positive means higher up than last season's finish. */
  delta: number | null;
  /** Oldest to newest, and shorter than five early in the season. */
  last5: FormResult[];
};

export type LeagueTable = {
  season: string;
  prevSeason: string;
  matchweek: number;
  rows: LeagueRow[];
};
