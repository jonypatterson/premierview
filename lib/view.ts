// Every number, label, bar width and chart point the page renders is derived
// here, so the components stay presentational. Ported from the design's
// renderVals() — the animation delays are part of the design and are kept.

import { DEFAULT_ACCENT, ord, per, short, textOn } from "./format";
import type { CompareMode, TeamPage } from "./types";

/**
 * x is inset from the axes so a single opening-week point sits inside the plot
 * rather than straddling the y-axis. 38 matchweeks across, positions 1-20 down.
 */
export function xy(position: number, index: number): [number, number] {
  return [8 + (index / 37) * 304, 10 + ((position - 1) / 19) * 140];
}

export function points(positions: (number | null)[]): string {
  return positions
    .map((p, i) => {
      if (p == null) return null;
      const [x, y] = xy(p, i);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");
}

/** Real polyline length, so the draw animation reveals exactly the whole line. */
export function lineLength(positions: (number | null)[]): number {
  const pts = positions
    .map((p, i) => (p == null ? null : xy(p, i)))
    .filter((p): p is [number, number] => p != null);
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return Math.ceil(len) + 1;
}

export type SeasonVM = ReturnType<typeof seasonView>;
export type PlayersVM = ReturnType<typeof playersView>;

export function seasonView(d: TeamPage, mode: CompareMode, accent: string) {
  const s = d.summary;
  const games = s.won + s.drawn + s.lost;
  const aligned = mode === "same-matchweek";

  const prevPos = aligned ? s.prev_position_same_mw : s.prev_final_position;
  const delta = prevPos != null ? prevPos - s.position : null;
  const prevGames = aligned
    ? (s.prev_won_same_mw ?? 0) + (s.prev_drawn_same_mw ?? 0) + (s.prev_lost_same_mw ?? 0)
    : 38;
  const pgf = aligned ? s.prev_gf_same_mw : s.prev_final_gf;
  const pga = aligned ? s.prev_ga_same_mw : s.prev_final_ga;
  const prevTag = aligned ? "last season" : `in ${short(d.seasons.previous)}`;

  const cur = d.series[d.seasons.current] ?? [];
  const last = d.series[d.seasons.previous] ?? [];
  const lastIdx = cur.reduce<number>((a, p, i) => (p != null ? i : a), 0);
  const played = cur.filter((p) => p != null).length;
  const [mx, my] = xy(cur[lastIdx] ?? 1, lastIdx);

  return {
    matchweek: s.matchweek,
    position: s.position,
    positionSuffix: ord(s.position),
    deltaLabel:
      delta == null ? "—" : delta > 0 ? `▲ ${delta}` : delta < 0 ? `▼ ${Math.abs(delta)}` : "level",
    deltaBg: delta == null || delta === 0 ? "#E4DFD6" : delta > 0 ? accent : "#191613",
    deltaFg: delta == null || delta === 0 ? "#8b857c" : delta > 0 ? textOn(accent) : "#fff",
    comparisonNote: aligned
      ? `${prevPos ? prevPos + ord(prevPos) : "Unplaced"} at this stage last season`
      : `Finished ${prevPos}${prevPos ? ord(prevPos) : ""} last season`,

    // Six slots: played matches fill in, the rest stay as dashed placeholders.
    form: Array.from({ length: 6 }, (_, i) => {
      const r = d.form[i];
      const filled = r === "W" || r === "L" || r === "D";
      return {
        letter: filled ? r : "",
        bg: r === "W" ? accent : r === "L" ? "#191613" : r === "D" ? "#E4DFD6" : "#F0ECE5",
        fg: r === "W" ? textOn(accent) : r === "D" ? "#8b857c" : "#fff",
        border: filled ? "0" : "1.5px dashed #d9d3c9",
        delay: 0.66 + i * 0.07,
      };
    }),

    record: [
      { label: "Wins", value: s.won, prev: `${aligned ? s.prev_won_same_mw : s.prev_final_won} ${prevTag}`, delay: 1.0 },
      { label: "Draws", value: s.drawn, prev: `${aligned ? s.prev_drawn_same_mw : s.prev_final_drawn} ${prevTag}`, delay: 1.08 },
      { label: "Losses", value: s.lost, prev: `${aligned ? s.prev_lost_same_mw : s.prev_final_lost} ${prevTag}`, delay: 1.16 },
    ],

    // Bars are normalised against 3 goals/game.
    goals: [
      {
        label: "Goals scored",
        total: s.goals_for,
        perGame: `${per(s.goals_for, games)} / game`,
        pct: `${Math.min(100, Math.round(((s.goals_for / (games || 1)) / 3) * 100))}%`,
        color: accent,
        prev: `${per(pgf, prevGames)} / game ${prevTag}`,
        delay: 1.24,
      },
      {
        label: "Goals conceded",
        total: s.goals_against,
        perGame: `${per(s.goals_against, games)} / game`,
        pct: `${Math.min(100, Math.round(((s.goals_against / (games || 1)) / 3) * 100))}%`,
        color: "#191613",
        prev: `${per(pga, prevGames)} / game ${prevTag}`,
        delay: 1.32,
      },
    ],

    chart: {
      lastLine: points(last),
      thisLine: points(cur),
      thisLineLen: lineLength(cur),
      markerX: mx.toFixed(1),
      markerY: my.toFixed(1),
      // The legend swatch is a dot while there's only one point, so it doesn't
      // advertise a line that isn't drawn yet.
      legendW: played > 1 ? "14px" : "7px",
      legendH: played > 1 ? "3px" : "7px",
      legendR: played > 1 ? "2px" : "50%",
    },
  };
}

export function playersView(d: TeamPage, accent: string) {
  const s = d.summary;

  const rank = (key: "goals" | "assists", prevKey: "prev_goals" | "prev_assists", isGoals: boolean) => {
    const rows = d.players
      .filter((p) => (p[key] ?? 0) > 0 || (p[prevKey] ?? 0) > 0)
      .sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0) || (b[prevKey] ?? 0) - (a[prevKey] ?? 0))
      .slice(0, 5);
    const top = Math.max(1, ...rows.map((p) => p[key] ?? 0));
    const bd = isGoals ? 1.0 : 1.62;
    const rd = isGoals ? 0.86 : 1.48;
    return rows.map((p, i) => ({
      rank: i + 1,
      name: p.player_name,
      value: (p[key] ?? 0) > 0 ? String(p[key]) : "—",
      pct: `${Math.round(((p[key] ?? 0) / top) * 100)}%`,
      prev: `${p[prevKey] ?? 0} last`,
      delay: rd + i * 0.07,
      barDelay: bd + i * 0.07,
    }));
  };

  const scorers = rank("goals", "prev_goals", true);
  const assisters = rank("assists", "prev_assists", false);

  const topScorer = d.players.slice().sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))[0];
  const scored = (topScorer?.goals ?? 0) > 0;
  const prevTopScorer = d.players
    .slice()
    .sort((a, b) => (b.prev_goals ?? 0) - (a.prev_goals ?? 0))
    .find((p) => (p.prev_goals ?? 0) > 0);
  const assists = d.players.reduce((n, p) => n + (p.assists ?? 0), 0);
  const assistedShare = s.goals_for ? Math.round((assists / s.goals_for) * 100) : 0;

  // With no goals yet the headline credits nobody — last season's leader is
  // named underneath as context instead.
  const head = scored
    ? {
        topScorerLabel: `Top scorer · MW ${s.matchweek}`,
        topScorerName: topScorer.player_name.split(" ").slice(-1)[0],
        topScorerGoals: `${topScorer.goals} ${topScorer.goals === 1 ? "goal" : "goals"}`,
        topScorerNote: `${topScorer.prev_goals ?? 0} in ${short(d.seasons.previous)}`,
      }
    : {
        topScorerLabel: `Goalscorers · MW ${s.matchweek}`,
        topScorerName: "None yet",
        topScorerGoals: `0 goals in ${s.matchweek} ${s.matchweek === 1 ? "game" : "games"}`,
        topScorerNote: prevTopScorer
          ? `${prevTopScorer.player_name} led the scoring in ${short(d.seasons.previous)} with ${prevTopScorer.prev_goals}`
          : `No goals in ${short(d.seasons.previous)} either`,
      };

  return {
    ...head,
    accent,
    summary: [
      {
        label: "Scorers used",
        value: scored ? String(d.players.filter((p) => (p.goals ?? 0) > 0).length) : "—",
        unit: scored ? `of ${s.goals_for} goals` : "no goals yet",
        prev: `${d.players.filter((p) => (p.prev_goals ?? 0) > 0).length} across ${short(d.seasons.previous)}`,
        delay: 0.62,
      },
      {
        label: "Assisted goals",
        value: scored ? String(assists) : "—",
        unit: scored ? `${assistedShare}%` : "no goals yet",
        prev: `${short(d.seasons.previous)} squad total`,
        delay: 0.7,
      },
    ],
    scorers,
    assisters,
    noScorers: scorers.length === 0,
    noAssisters: assisters.length === 0,
  };
}
