// Every number, label, bar width and chart point the page renders is derived
// here, so the components stay presentational. Ported from the design's
// renderVals() in `Season Comparison - Matchday.dc.html`.

import { initials, ord, places, short, signed } from "./format";
import { ACCENT, DOWN, FLAT, UP } from "./palette";
import type { CompareMode, LeagueTable, PlayedTeamPage } from "./types";

/** Chart geometry is authored against a 320x160 box and stretched to fit. */
export const VB_W = 320;
export const VB_H = 160;

export const pctX = (x: number) => `${((x / VB_W) * 100).toFixed(2)}%`;
export const pctY = (y: number) => `${((y / VB_H) * 100).toFixed(2)}%`;

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

export type SeasonVM = ReturnType<typeof seasonView>;
export type PlayersVM = ReturnType<typeof playersView>;

export function seasonView(d: PlayedTeamPage, mode: CompareMode) {
  const s = d.summary;
  const aligned = mode === "same-matchweek";

  const prevPos = aligned ? s.prev_position_same_mw : s.prev_final_position;
  const delta = prevPos != null ? prevPos - s.position : null;
  const pgf = aligned ? s.prev_gf_same_mw : s.prev_final_gf;
  const pga = aligned ? s.prev_ga_same_mw : s.prev_final_ga;
  const prevWon = aligned ? s.prev_won_same_mw : s.prev_final_won;
  const prevDrawn = aligned ? s.prev_drawn_same_mw : s.prev_final_drawn;
  const prevLost = aligned ? s.prev_lost_same_mw : s.prev_final_lost;
  const prevShort = short(d.seasons.previous);

  const cur = d.series[d.seasons.current] ?? [];
  const last = d.series[d.seasons.previous] ?? [];
  const lastIdx = cur.reduce<number>((a, p, i) => (p != null ? i : a), 0);
  const [mx, my] = xy(cur[lastIdx] ?? 1, lastIdx);

  const games = s.won + s.drawn + s.lost;
  const pts = s.won * 3 + s.drawn;
  const prevPts = (prevWon ?? 0) * 3 + (prevDrawn ?? 0);
  const ptsDelta = pts - prevPts;
  const gdNow = s.goals_for - s.goals_against;
  const gdPrev = (pgf ?? 0) - (pga ?? 0);

  // One sentence, declarative and causal: what happened, then why.
  const insight =
    delta == null
      ? `${d.team.short_name || d.team.name} were not in this division at the same stage of ${prevShort}.`
      : delta > 0
        ? `${places(delta)} up on this stage of ${prevShort}, and ${
            gdNow >= gdPrev ? "the goal difference is the reason" : "fewer defeats are the reason"
          }.`
        : delta < 0
          ? `${places(Math.abs(delta))} down on this stage of ${prevShort}, on ${
              ptsDelta === 0
                ? "the same points"
                : `${Math.abs(ptsDelta)} ${Math.abs(ptsDelta) === 1 ? "point" : "points"} ${
                    ptsDelta > 0 ? "more" : "fewer"
                  }`
            }.`
          : `Level with this stage of ${prevShort}, ${
              ptsDelta === 0
                ? "on the same points"
                : `on ${Math.abs(ptsDelta)} ${ptsDelta > 0 ? "more" : "fewer"}`
            }.`;

  // Both bars are scaled against the largest figure either season reached, so
  // the two are directly comparable.
  const maxSeen = Math.max(1, s.goals_for, s.goals_against, pgf ?? 0, pga ?? 0);

  return {
    matchweek: s.matchweek,
    headerMeta: `${short(d.seasons.current)} · matchweek ${s.matchweek}`,
    thisSeasonShort: short(d.seasons.current),
    lastSeasonShort: prevShort,

    heroValue: `${s.position}${ord(s.position)}`,
    // The chip reads the direction of travel: green up, pink down, yellow
    // level, blue for a club with no last-season position.
    heroFill:
      delta == null
        ? "var(--accent-4)"
        : delta > 0
          ? "var(--accent-3)"
          : delta < 0
            ? "var(--accent-1)"
            : "var(--accent-2)",
    deltaText:
      delta == null
        ? "no comparison"
        : delta > 0
          ? `${places(delta)} up`
          : delta < 0
            ? `${places(Math.abs(delta))} down`
            : "level",
    vsLabel: `on ${prevShort}`,
    insight,

    splits: [
      { label: "points", value: String(pts), previous: String(prevPts), fill: "var(--accent-3)" },
      {
        label: "goal difference",
        value: signed(gdNow),
        previous: signed(gdPrev),
        fill: "var(--accent-4)",
      },
      {
        // The projection replaces points per game, which was the same number
        // in a duller unit — 3.0 a game *is* 114 over a season, and the season
        // total is the one anybody quotes.
        //
        // It compares against last season's *finished* total, not the figure
        // at this stage, because a projection is itself a full-season number.
        // That is a like-for-like comparison and the row says "finished" so it
        // cannot be read as the same-stage "was" every other row means. Always
        // last season's final, whatever COMPARE_MODE is set to.
        label: "on pace for",
        value: String(Math.round((pts / Math.max(1, games)) * 38)),
        previous: String((s.prev_final_won ?? 0) * 3 + (s.prev_final_drawn ?? 0)),
        previousLabel: "finished",
        fill: "var(--accent-1)",
      },
    ],

    formNow: (d.form ?? []).slice(0, 6),
    formPast: (d.form_prev ?? []).slice(0, 6),
    formLegend: `${short(d.seasons.current)} above, ${prevShort} below, same stage`,
    /** A promoted club has no previous strip, so the legend would be a lie. */
    hasPastForm: (d.form_prev ?? []).length > 0,

    record: [
      { code: "W", value: String(s.won), fill: "var(--green-400)", caption: `was ${prevWon ?? 0}` },
      { code: "D", value: String(s.drawn), fill: "var(--yellow-400)", caption: `was ${prevDrawn ?? 0}` },
      { code: "L", value: String(s.lost), fill: "var(--pink-400)", caption: `was ${prevLost ?? 0}` },
    ],

    goals: [
      {
        tag: "GF",
        label: "goals scored",
        // Green scored, pink conceded — the reading everyone brings to a
        // scoreline. Both are still just identifying their own row, so this
        // stays a metric colour rather than a judgement.
        color: ACCENT[2],
        total: String(s.goals_for),
        prevTotal: String(pgf ?? 0),
        delta: s.goals_for === (pgf ?? 0) ? "level" : signed(s.goals_for - (pgf ?? 0)),
        deltaCol: s.goals_for === (pgf ?? 0) ? FLAT : s.goals_for > (pgf ?? 0) ? UP : DOWN,
        pct: `${Math.round((s.goals_for / maxSeen) * 100)}%`,
        prevPct: `${Math.round(((pgf ?? 0) / maxSeen) * 100)}%`,
      },
      {
        tag: "GA",
        label: "goals conceded",
        color: ACCENT[0],
        total: String(s.goals_against),
        prevTotal: String(pga ?? 0),
        delta: s.goals_against === (pga ?? 0) ? "level" : signed(s.goals_against - (pga ?? 0)),
        // Conceding fewer is the improvement, so the test inverts.
        deltaCol:
          s.goals_against === (pga ?? 0) ? FLAT : s.goals_against < (pga ?? 0) ? UP : DOWN,
        pct: `${Math.round((s.goals_against / maxSeen) * 100)}%`,
        prevPct: `${Math.round(((pga ?? 0) / maxSeen) * 100)}%`,
      },
    ],
    markerLegend: `marker shows ${prevShort} at the same stage`,

    chart: {
      lastLine: points(last),
      thisLine: points(cur),
      markerLeft: pctX(mx),
      markerTop: pctY(my),
      hasMarker: cur.some((p) => p != null),
    },
  };
}

export function playersView(d: PlayedTeamPage) {
  const s = d.summary;
  const prevShort = short(d.seasons.previous);

  /**
   * Last season's player figures are whole-season totals — `player_match_stats`
   * and `player_gameweek_stats` are empty, so there is no way to ask what a
   * player had scored by matchweek 3 of last season.
   *
   * That makes any delta against them a lie at this end of the season: two
   * goals in three matches against seven in thirty-eight came out as "-5" in
   * red, which reads as a collapse when it is a player on pace to beat it. So
   * no delta, no "was" — "was" means "at this stage" everywhere else in the
   * app — and no second bar, because a three-match bar beside a full-season
   * one says the same wrong thing in pictures.
   *
   * Last season stays on the row as context, stated with its scope. When the
   * sync backfills per-match player stats this can become a real same-stage
   * comparison, and the delta and the second bar can come back.
   */
  const rank = (
    key: "goals" | "assists",
    prevKey: "prev_goals" | "prev_assists",
    colour: string,
  ) => {
    const rows = d.players
      .filter((p) => (p[key] ?? 0) > 0 || (p[prevKey] ?? 0) > 0)
      .sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0) || (b[prevKey] ?? 0) - (a[prevKey] ?? 0))
      // Six, not the artboard's five: above 1180px each list is a full-width
      // section of two columns, and six divides into it evenly.
      .slice(0, 6);
    // Scaled against this season only, so the bars rank these players against
    // each other rather than against a season none of them has played yet.
    const top = Math.max(1, ...rows.map((p) => p[key] ?? 0));
    return rows.map((p) => {
      const now = p[key] ?? 0;
      const was = p[prevKey];
      return {
        name: p.player_name,
        initials: initials(p.player_name),
        bar: colour,
        value: String(now),
        meta: was == null ? "not reported" : `${was} in ${prevShort}`,
        pct: `${Math.round((now / top) * 100)}%`,
      };
    });
  };

  const scorers = rank("goals", "prev_goals", ACCENT[1]);
  const assisters = rank("assists", "prev_assists", ACCENT[3]);

  const topScorer = d.players.slice().sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))[0];
  const scored = (topScorer?.goals ?? 0) > 0;
  const prevTopScorer = d.players
    .slice()
    .sort((a, b) => (b.prev_goals ?? 0) - (a.prev_goals ?? 0))
    .find((p) => (p.prev_goals ?? 0) > 0);

  const assistTotal = d.players.reduce((n, p) => n + (p.assists ?? 0), 0);
  const prevAssistTotal = d.players.reduce((n, p) => n + (p.prev_assists ?? 0), 0);
  // Over the whole squad, not the ranked list, which is capped at five.
  const scorersUsed = d.players.filter((p) => (p.goals ?? 0) > 0).length;
  const prevScorersUsed = d.players.filter((p) => (p.prev_goals ?? 0) > 0).length;

  const matches = `${s.matchweek} ${s.matchweek === 1 ? "match" : "matches"}`;

  // With no goals yet the hero credits nobody — last season's leader is named
  // underneath as context instead. The figure carries the hero, so a long name
  // never has to hold the display tracking.
  const head = scored
    ? {
        topScorerLabel: "Top scorer",
        topScorerName: topScorer.player_name,
        topScorerGoals: `${topScorer.goals} ${topScorer.goals === 1 ? "goal" : "goals"} in ${matches}`,
        // Not "was": a whole-season total, so it is labelled as one.
        topScorerDelta: `${topScorer.prev_goals ?? 0} goals`,
        topScorerNote: `all of ${prevShort}`,
      }
    : {
        topScorerLabel: "Top scorer",
        topScorerName: "None yet",
        topScorerGoals: `no goals in ${matches}`,
        topScorerDelta: prevTopScorer ? `${prevTopScorer.prev_goals} goals` : "",
        topScorerNote: prevTopScorer
          ? `${prevTopScorer.player_name} led ${prevShort}`
          : `no goals in ${prevShort} either`,
      };

  return {
    ...head,
    headerMeta: `${short(d.seasons.current)} · matchweek ${s.matchweek}`,
    rowLegend: `bar is this season · ${prevShort} shown in full for context`,
    playerSummary: [
      {
        code: "Scorers used",
        fill: ACCENT[2],
        value: scored ? String(scorersUsed) : "—",
        caption: scored ? `${prevScorersUsed} across ${prevShort}` : "no goals yet",
      },
      {
        code: "Assisted",
        fill: ACCENT[3],
        value: scored ? String(assistTotal) : "—",
        caption: scored ? `${prevAssistTotal} across ${prevShort}` : "no goals yet",
      },
    ],
    scorers,
    assisters,
    noScorers: scorers.length === 0,
    noAssisters: assisters.length === 0,
  };
}

/**
 * League table rows, ready to render.
 *
 * Movement is measured against last season's *final* position, not the
 * previous matchweek — that's the product's premise, it's defined at MW1 where
 * a week-over-week delta wouldn't be, and the header line says so.
 */
export function leagueRows(table: LeagueTable, myTla?: string) {
  const zone = (pos: number, total: number) => {
    if (pos <= 5) return "var(--zone-europe)";
    if (pos <= 8) return "var(--zone-chasing)";
    if (pos > total - 3) return "var(--zone-relegation)";
    return "var(--zone-neutral)";
  };

  return table.rows.map((r) => {
    const d = r.delta;
    const mine = !!myTla && r.code === myTla;
    // Oldest to newest, and shorter than five early in the season. Padded at
    // the front with blanks so played matches stay flush right and the column
    // lines up down the table.
    const form: (string | null)[] = [...(r.last5 ?? [])];
    while (form.length < 5) form.unshift(null);
    return {
      form,
      pos: r.pos,
      code: r.code,
      name: r.short_name || r.name,
      played: r.played,
      wins: r.wins,
      draws: r.draws,
      losses: r.losses,
      gf: r.gf,
      ga: r.ga,
      points: r.points,
      gdText: signed(r.gd),
      zone: zone(r.pos, table.rows.length),
      me: mine,
      // Exactly one row may be highlighted — the user's own club.
      rowBg: mine ? "var(--accent-1)" : "transparent",
      moveText: d == null ? "—" : d > 0 ? `▲${d}` : d < 0 ? `▼${Math.abs(d)}` : "–",
      moveCol: d == null ? "var(--ink-35)" : d > 0 ? UP : d < 0 ? DOWN : FLAT,
    };
  });
}

export type LeagueRowVM = ReturnType<typeof leagueRows>[number];
