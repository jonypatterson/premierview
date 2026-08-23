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
  summary: Summary;
  /** season label -> league position by gameweek (index 0 = MW 1, null = not played) */
  series: Record<string, (number | null)[]>;
  players: PlayerRow[];
  form: FormResult[];
  seasons: { current: string; previous: string };
  lastSync: string | null;
};

/** Same-matchweek is the fair comparison; final-table is last season's finish. */
export type CompareMode = "same-matchweek" | "final-table";
