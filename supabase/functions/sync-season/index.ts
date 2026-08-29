// Deployed to Supabase project bgijzlomphztrxobsgiq as sync-season (v11).
// This file is the repo copy of the deployed source — keep them in step.
//
// Ingests one PL season from football-data.org (+ FPL for live-season player
// goals/assists) into the PremierView schema.
//   POST {"season":"2026/27"}  -> that season
//   POST {}                     -> seasons.is_current
// Standings are computed from the match list into team_gameweek_stats, one row
// per club per gameweek. Only clubs in THAT season's competition are ranked.
// goal_difference / xg_difference / duration_ms are GENERATED - never write them.
// Scorers limit is 500: the free /scorers endpoint truncates to its limit and
// ~300 players score in a season; 100 silently zeroed everyone below 3 goals.
//
// PRECEDENCE (v11) — differs by whether the season has finished.
//
// v10 made football-data authoritative for assists in every season. That fixed
// a real problem (FPL counts assists more liberally, and v8's max() inflated
// Bruno Fernandes' record 21 assists in 25/26 to 24) but it made the live
// season nearly empty, because the free tier reports assists for only about a
// sixth of scorers — 6 of 38 rows in 2026/27 — and /scorers lists nobody who
// has not scored. Phil Foden laid on two goals in GW2 and had no row at all.
//
// So the rule is now:
//   COMPLETED season -> football-data only, exactly as v10. The official record
//                       is what a finished season should show, and the Bruno
//                       case stays fixed.
//   LIVE season      -> FPL is authoritative for assists, and players with
//                       assists but no goals get a row of their own. Being a
//                       goal or two generous in-flight beats showing an em dash
//                       next to a player who set up two at the weekend.
// The two are separated by the same `maxGw < 38` test that already decides
// whether FPL is fetched at all, so a season flips to the official record by
// itself once its 38th gameweek completes.
//
// Goals are unchanged: football-data first, FPL only fills a gap.
//
// IDENTITY
// v10 matched FPL to football-data on the scorer's name alone, which failed for
// 20 players a run (Calafiori, Ben White, Evanilson…). Resolution now goes
// through players.full_name, players.display_name and the player_aliases table,
// the same path backfill-assists uses, and new FPL spellings are recorded as
// aliases so the next run resolves instead of inserting a duplicate.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const FD = "https://api.football-data.org/v4";
const FPL = "https://fantasy.premierleague.com/api";

let apiKey: string | null = null;
async function key() {
  if (apiKey) return apiKey;
  const env = Deno.env.get("FD_API_KEY");
  if (env) return (apiKey = env);
  const { data } = await db.from("app_config")
    .select("value").eq("key", "football_data_api_key").single();
  if (!data?.value) throw new Error("no football_data_api_key in app_config");
  return (apiKey = data.value);
}

async function fd<T>(path: string): Promise<T> {
  const res = await fetch(`${FD}${path}`, { headers: { "X-Auth-Token": await key() } });
  if (res.status === 429) throw new Error("football-data rate limit (10/min)");
  if (!res.ok) throw new Error(`football-data ${res.status} on ${path}`);
  return res.json();
}

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z ]/g, "").trim();

const STATUS: Record<string, string> = {
  FINISHED: "completed", AWARDED: "completed",
  IN_PLAY: "live", PAUSED: "live",
  TIMED: "scheduled", SCHEDULED: "scheduled",
  POSTPONED: "postponed", SUSPENDED: "postponed",
  CANCELLED: "cancelled",
};

const POSITION: Record<string, string> = {
  Goalkeeper: "goalkeeper", Defence: "defender", Midfield: "midfielder",
  Offence: "forward", Attacker: "forward", Defender: "defender",
  Midfielder: "midfielder", Forward: "forward",
};

// FPL element_type -> our position enum, matching backfill-assists.
const FPL_POS: Record<number, string> = {
  1: "goalkeeper", 2: "defender", 3: "midfielder", 4: "forward", 5: "forward",
};

// FPL and football-data disagree on Nottingham Forest's code.
const CODE_ALIAS: Record<string, string> = { NFO: "NOT", NOT: "NOT" };

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const started = Date.now();

  const { data: run } = await db.from("ingestion_runs").insert({
    source: "football_data_org",
    triggered_by: body.triggered_by ?? "cron",
    status: "running",
  }).select("id").single();

  const finish = async (
    status: string,
    counts: { fetched?: number; inserted?: number; api?: number },
    notes: string,
    error?: string,
  ) => {
    await db.from("ingestion_runs").update({
      status,
      completed_at: new Date().toISOString(),
      records_fetched: counts.fetched ?? 0,
      records_inserted: counts.inserted ?? 0,
      api_requests_made: counts.api ?? 0,
      error_message: error ?? null,
      notes,
    }).eq("id", run?.id);
  };

  try {
    const label = body.season ?? await currentSeasonLabel();
    const { data: season } = await db.from("seasons")
      .select("id, label, year_start").eq("label", label).single();
    if (!season) throw new Error(`unknown season ${label}`);
    const fdYear = season.year_start;
    let api = 0;

    const teamsJson = await fd<{ teams: any[] }>(`/competitions/PL/teams?season=${fdYear}`);
    api++;
    await db.from("clubs").upsert(
      teamsJson.teams.map((t) => ({
        name: t.name,
        short_name: t.shortName ?? t.name,
        code: t.tla,
        crest_url: t.crest,
        external_id_fdorg: t.id,
        is_active: true,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "external_id_fdorg" },
    );

    const seasonFdIds = new Set<number>(teamsJson.teams.map((t) => t.id));

    const { data: clubRows } = await db.from("clubs")
      .select("id, name, short_name, code, external_id_fdorg");
    const clubByFd = new Map<number, { id: string; name: string }>();
    for (const c of clubRows ?? []) {
      if (c.external_id_fdorg && seasonFdIds.has(c.external_id_fdorg)) {
        clubByFd.set(c.external_id_fdorg, { id: c.id, name: c.name });
      }
    }
    // Name/code -> club id, for placing FPL players who never reach /scorers.
    const clubByCode = new Map<string, string>();
    for (const c of clubRows ?? []) {
      if (c.code) clubByCode.set(c.code, c.id);
      if (c.short_name) clubByCode.set(norm(c.short_name), c.id);
      if (c.name) clubByCode.set(norm(c.name), c.id);
    }

    const { data: gwRows } = await db.from("gameweeks")
      .select("id, number").eq("season_id", season.id);
    const gwByNumber = new Map<number, string>();
    for (const g of gwRows ?? []) gwByNumber.set(g.number, g.id);

    const matchesJson = await fd<{ matches: any[] }>(`/competitions/PL/matches?season=${fdYear}`);
    api++;
    const feed = matchesJson.matches.filter(
      (m) => clubByFd.has(m.homeTeam?.id) && clubByFd.has(m.awayTeam?.id),
    );

    const matchRows = feed.map((m) => ({
      season_id: season.id,
      gameweek_id: gwByNumber.get(m.matchday) ?? null,
      home_club_id: clubByFd.get(m.homeTeam.id)!.id,
      away_club_id: clubByFd.get(m.awayTeam.id)!.id,
      kickoff_time: m.utcDate,
      status: STATUS[m.status] ?? "scheduled",
      home_score: m.score?.fullTime?.home ?? null,
      away_score: m.score?.fullTime?.away ?? null,
      home_score_ht: m.score?.halfTime?.home ?? null,
      away_score_ht: m.score?.halfTime?.away ?? null,
      external_id_fdorg: m.id,
      updated_at: new Date().toISOString(),
    }));

    for (let i = 0; i < matchRows.length; i += 200) {
      const { error } = await db.from("matches")
        .upsert(matchRows.slice(i, i + 200), { onConflict: "external_id_fdorg" });
      if (error) throw new Error(`matches upsert: ${error.message}`);
    }

    const stats = buildTable(feed, clubByFd);
    const tgsRows = stats
      .filter((r) => gwByNumber.has(r.gw))
      .map((r) => ({
        club_id: r.clubId,
        season_id: season.id,
        gameweek_id: gwByNumber.get(r.gw)!,
        gameweek_number: r.gw,
        league_position: r.position,
        points: r.points,
        points_per_game: r.played ? +(r.points / r.played).toFixed(2) : 0,
        played: r.played,
        wins: r.won,
        draws: r.drawn,
        losses: r.lost,
        goals_scored: r.gf,
        goals_conceded: r.ga,
        goals_per_game: r.played ? +(r.gf / r.played).toFixed(2) : 0,
        goals_conceded_per_game: r.played ? +(r.ga / r.played).toFixed(2) : 0,
        form: r.form,
        data_source: "football_data_org",
        is_complete: true,
        updated_at: new Date().toISOString(),
      }));

    for (let i = 0; i < tgsRows.length; i += 400) {
      const { error } = await db.from("team_gameweek_stats")
        .upsert(tgsRows.slice(i, i + 400), { onConflict: "club_id,season_id,gameweek_id" });
      if (error) throw new Error(`team_gameweek_stats upsert: ${error.message}`);
    }

    // limit=500: /scorers truncates to its limit; ~300 players score per season
    const scorers = await fd<{ scorers: any[] }>(
      `/competitions/PL/scorers?season=${fdYear}&limit=500`,
    ).then((j) => j.scorers).catch(() => []);
    api++;

    // The live-season test. Also the switch that decides whether FPL may supply
    // assists at all — a finished season keeps the official record.
    const maxGw = stats.reduce((a, r) => Math.max(a, r.gw), 0);
    const isLive = maxGw > 0 && maxGw < 38;
    let fpl: FplPlayer[] | null = null;
    if (isLive) {
      try { fpl = await fetchFpl(); } catch (_) { fpl = null; }
    }
    const fplByName = new Map((fpl ?? []).flatMap((p) =>
      [[norm(p.name), p], [norm(p.web), p]] as [string, FplPlayer][]
    ));

    const playerRows = scorers.map((s) => ({
      full_name: s.player.name,
      display_name: s.player.name,
      position: POSITION[s.player.position ?? ""] ?? "unknown",
      nationality: s.player.nationality ?? null,
      date_of_birth: s.player.dateOfBirth ?? null,
      club_id: clubByFd.get(s.team.id)?.id ?? null,
      external_id_fdorg: s.player.id,
      updated_at: new Date().toISOString(),
    })).filter((p) => p.club_id);

    if (playerRows.length) {
      const { error } = await db.from("players")
        .upsert(playerRows, { onConflict: "external_id_fdorg" });
      if (error) throw new Error(`players upsert: ${error.message}`);
    }

    const { data: playerIdRows } = await db.from("players")
      .select("id, external_id_fdorg, club_id");
    const playerByFd = new Map(
      (playerIdRows ?? []).filter((p) => p.external_id_fdorg)
        .map((p) => [p.external_id_fdorg as number, p]),
    );

    const pssRows = scorers.map((s) => {
      const p = playerByFd.get(s.player.id);
      if (!p) return null;
      const f = fplByName.get(norm(s.player.name));
      // goals: football-data first, FPL only fills a gap.
      // assists: FPL while the season runs, because football-data's free tier
      // reports them for a small minority of scorers; the official figure once
      // it has finished. NULL only when neither source has one — that means
      // "not reported" and the UI renders an em dash, where 0 would assert the
      // player got none.
      const goals = s.goals ?? f?.goals ?? 0;
      const assists = isLive ? (f?.assists ?? s.assists ?? null) : (s.assists ?? null);
      return {
        player_id: p.id,
        season_id: season.id,
        club_id: clubByFd.get(s.team.id)?.id ?? p.club_id,
        appearances: s.playedMatches ?? f?.appearances ?? 0,
        minutes: f?.minutes ?? null,
        goals,
        assists,
        data_source: assists == null
          ? "football_data_org_goals_only"
          : (isLive && f ? "football_data_org+fpl_assists" : "football_data_org"),
        updated_at: new Date().toISOString(),
      };
    }).filter(Boolean) as Record<string, unknown>[];

    if (pssRows.length) {
      const { error } = await db.from("player_season_stats")
        .upsert(pssRows, { onConflict: "player_id,season_id" });
      if (error) throw new Error(`player_season_stats upsert: ${error.message}`);
    }

    // Players who have assisted but not scored are absent from /scorers, so
    // without this they have no row and read as an em dash all season. Live
    // season only, and only for players football-data has not already placed.
    let assistOnly = 0;
    const unmatched: string[] = [];
    if (isLive && fpl) {
      const scoredFdIds = new Set(
        scorers.map((s) => playerByFd.get(s.player.id)?.id).filter(Boolean) as string[],
      );
      const contributors = fpl.filter((p) => (p.assists ?? 0) > 0 && (p.goals ?? 0) === 0);

      let lookup = await buildLookup();
      const resolve = (p: FplPlayer) =>
        lookup.get(norm(p.name)) ?? lookup.get(norm(p.web)) ?? null;

      // Create records for genuine newcomers, and remember the FPL spelling so
      // the next run resolves rather than inserting a second row for them.
      const unknown = contributors.filter((p) => !resolve(p) && clubOf(p));
      if (unknown.length) {
        const { data: ins, error } = await db.from("players").insert(
          unknown.map((p) => ({
            full_name: p.name,
            display_name: p.web,
            position: FPL_POS[p.elementType] ?? "unknown",
            club_id: clubOf(p),
            updated_at: new Date().toISOString(),
          })),
        ).select("id, full_name, display_name");
        if (error) throw new Error(`players insert (fpl): ${error.message}`);
        const aliases = (ins ?? []).flatMap((p) => {
          const out = [{ player_id: p.id, alias_norm: norm(p.full_name ?? ""), source: "fpl" }];
          if (p.display_name) {
            out.push({ player_id: p.id, alias_norm: norm(p.display_name), source: "fpl" });
          }
          return out;
        });
        if (aliases.length) {
          await db.from("player_aliases").upsert(aliases, { onConflict: "alias_norm" });
        }
        lookup = await buildLookup();
      }

      const seen = new Set<string>();
      const rows: Record<string, unknown>[] = [];
      for (const p of contributors) {
        const rec = resolve(p);
        const club = clubOf(p) ?? rec?.club_id ?? null;
        if (!rec || !club) { unmatched.push(p.name); continue; }
        if (scoredFdIds.has(rec.id) || seen.has(rec.id)) continue;
        seen.add(rec.id);
        rows.push({
          player_id: rec.id,
          season_id: season.id,
          club_id: club,
          appearances: p.appearances ?? 0,
          minutes: p.minutes ?? null,
          goals: 0,
          assists: p.assists,
          data_source: "fpl",
          updated_at: new Date().toISOString(),
        });
      }
      for (let i = 0; i < rows.length; i += 300) {
        const { error } = await db.from("player_season_stats")
          .upsert(rows.slice(i, i + 300), { onConflict: "player_id,season_id" });
        if (error) throw new Error(`player_season_stats insert (fpl): ${error.message}`);
      }
      assistOnly = rows.length;

      function clubOf(p: FplPlayer) {
        return clubByCode.get(CODE_ALIAS[p.teamCode] ?? p.teamCode) ??
          clubByCode.get(norm(p.teamName)) ?? null;
      }
    }

    async function buildLookup() {
      const [{ data: ps }, { data: al }] = await Promise.all([
        db.from("players").select("id, full_name, display_name, club_id"),
        db.from("player_aliases").select("player_id, alias_norm"),
      ]);
      const byId = new Map((ps ?? []).map((p) => [p.id, p]));
      const m = new Map<string, any>();
      for (const p of ps ?? []) {
        m.set(norm(p.full_name ?? ""), p);
        if (p.display_name) m.set(norm(p.display_name), p);
      }
      for (const a of al ?? []) {
        const p = byId.get(a.player_id);
        if (p) m.set(a.alias_norm, p);
      }
      return m;
    }

    try { await db.rpc("prune_phantom_standings"); } catch (_) { /* best effort */ }

    const notes = `${label}: ${matchRows.length} matches, ${tgsRows.length} ` +
      `team-gameweek rows through GW ${maxGw}, ${pssRows.length} player season rows` +
      (isLive ? `, ${assistOnly} assist-only rows from FPL` : ", completed season (official assists)") +
      (unmatched.length ? `; unresolved FPL names: ${unmatched.slice(0, 20).join(", ")}` : "");
    await finish("success", {
      fetched: feed.length + scorers.length,
      inserted: matchRows.length + tgsRows.length + pssRows.length + assistOnly,
      api,
    }, notes);

    return Response.json({
      ok: true, season: label, live: isLive, clubs: clubByFd.size,
      gameweeks_written: maxGw, matches: matchRows.length, team_rows: tgsRows.length,
      player_rows: pssRows.length, assist_only_rows: assistOnly,
      scorers_returned: scorers.length,
      unresolved_fpl_names: unmatched, ms: Date.now() - started,
    });
  } catch (err) {
    const msg = String((err as Error)?.message ?? err);
    await finish("failed", {}, "aborted", msg);
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
});

async function currentSeasonLabel() {
  const { data } = await db.from("seasons")
    .select("label").eq("is_current", true).single();
  if (!data) throw new Error("no season flagged is_current");
  return data.label as string;
}

type FplPlayer = {
  fpl_id: number;
  name: string;
  web: string;
  teamCode: string;
  teamName: string;
  elementType: number;
  minutes: number;
  goals: number;
  assists: number;
  appearances: number;
};

async function fetchFpl(): Promise<FplPlayer[]> {
  const res = await fetch(`${FPL}/bootstrap-static/`);
  if (!res.ok) throw new Error(`FPL ${res.status}`);
  const j = await res.json();
  const teams = new Map<number, { code: string; name: string }>(
    (j.teams as any[]).map((t) => [t.id, { code: t.short_name, name: t.name }]),
  );
  return (j.elements as any[])
    .filter((e) => teams.has(e.team))
    .map((e) => ({
      fpl_id: e.id,
      name: `${e.first_name} ${e.second_name}`.trim(),
      web: e.web_name as string,
      teamCode: teams.get(e.team)!.code,
      teamName: teams.get(e.team)!.name,
      elementType: e.element_type,
      minutes: e.minutes,
      goals: e.goals_scored,
      assists: e.assists,
      appearances: e.starts,
    }));
}

/** Cumulative table after every gameweek, PL tie-break order. */
function buildTable(
  matches: any[],
  clubByFd: Map<number, { id: string; name: string }>,
) {
  type Acc = {
    clubId: string; name: string; played: number; won: number; drawn: number;
    lost: number; gf: number; ga: number; points: number; results: string[];
  };

  const done = matches.filter(
    (m) => m.status === "FINISHED" &&
      m.score?.fullTime?.home !== null && m.score?.fullTime?.away !== null,
  );
  if (!done.length) return [];

  const acc = new Map<number, Acc>();
  for (const [fdId, c] of clubByFd) {
    acc.set(fdId, {
      clubId: c.id, name: c.name, played: 0, won: 0, drawn: 0, lost: 0,
      gf: 0, ga: 0, points: 0, results: [],
    });
  }

  const weeks = [...new Set(done.map((m) => m.matchday))].sort((a, b) => a - b);
  const out: (Acc & { gw: number; position: number; form: string })[] = [];

  for (const gw of weeks) {
    for (const m of done.filter((x) => x.matchday === gw)) {
      const h = acc.get(m.homeTeam.id), a = acc.get(m.awayTeam.id);
      if (!h || !a) continue;
      const hg = m.score.fullTime.home, ag = m.score.fullTime.away;

      h.played++; a.played++;
      h.gf += hg; h.ga += ag; a.gf += ag; a.ga += hg;

      if (hg > ag) {
        h.won++; h.points += 3; a.lost++;
        h.results.push("W"); a.results.push("L");
      } else if (hg < ag) {
        a.won++; a.points += 3; h.lost++;
        h.results.push("L"); a.results.push("W");
      } else {
        h.drawn++; a.drawn++; h.points++; a.points++;
        h.results.push("D"); a.results.push("D");
      }
    }

    // clubs yet to play rank last, not above sides that have lost
    const ranked = [...acc.values()].sort((x, y) =>
      (y.played > 0 ? 1 : 0) - (x.played > 0 ? 1 : 0) ||
      y.points - x.points ||
      (y.gf - y.ga) - (x.gf - x.ga) ||
      y.gf - x.gf ||
      x.name.localeCompare(y.name)
    );

    ranked.forEach((r, i) => {
      out.push({
        ...r, gw, position: i + 1,
        form: r.results.slice(-5).join("").padEnd(5, " ").slice(0, 5),
      });
    });
  }

  return out;
}
