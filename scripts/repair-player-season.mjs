#!/usr/bin/env node
/**
 * Repair last season's per-player goals and assists.
 *
 * WHY THIS EXISTS
 * ---------------
 * Last season's player figures were ingested from football-data's
 * /competitions/PL/scorers endpoint, which returns only the league's leading
 * scorers — the request was capped well below the number of players who
 * actually scored. Every player below that cutoff kept prev_goals = 0, so the
 * app reports "0 last season" for someone who scored two or three. It is not
 * one player: it is everyone outside the top of the list.
 *
 * A full season has roughly 300 distinct scorers, so asking for limit=500
 * returns all of them and the truncation disappears.
 *
 * WHAT IT DOES
 * ------------
 *   1. Introspects player_season_stats / players / seasons / clubs, and prints
 *      the columns it finds. It maps names rather than assuming them, and
 *      stops with a clear message if something it needs isn't there.
 *   2. Fetches the complete scorers list for the season.
 *   3. Matches players by normalised name and updates goals / assists.
 *   4. Reports what it changed and what it could not match.
 *
 * It is idempotent — safe to run more than once — and touches only the season
 * you name. Run with --dry to see the plan without writing.
 *
 * USAGE
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<service role key> \
 *   FD_API_KEY=<football-data key> \
 *   node scripts/repair-player-season.mjs --season 2025/26 --fd-season 2025 [--dry]
 *
 * The service role key bypasses RLS, which is required to write these tables.
 * Never put it in the app or commit it.
 */

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const DRY = args.includes("--dry");
const SEASON = flag("season", "2025/26");
const FD_SEASON = flag("fd-season", "2025");
const LIMIT = Number(flag("limit", "500"));

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FD = process.env.FD_API_KEY;

if (!URL || !KEY || !FD) {
  console.error(
    "Missing env. Need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and FD_API_KEY.",
  );
  process.exit(1);
}

const rest = `${URL.replace(/\/$/, "")}/rest/v1`;
const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

async function db(path, init = {}) {
  const res = await fetch(`${rest}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  if (!res.ok) throw new Error(`${res.status} ${path} — ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

/** Accents, punctuation and case all vary between the two feeds. */
const norm = (s) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim();

/** Finds the real column name for a concept, so we adapt to the schema. */
function pick(columns, ...patterns) {
  for (const p of patterns) {
    const hit = columns.find((c) => new RegExp(`^${p}$`).test(c));
    if (hit) return hit;
  }
  return null;
}

async function sample(table) {
  const rows = await db(`/${table}?limit=1`);
  return rows.length ? Object.keys(rows[0]) : [];
}

async function main() {
  console.log(`Season ${SEASON} (football-data season ${FD_SEASON}), limit ${LIMIT}`);
  if (DRY) console.log("DRY RUN — nothing will be written\n");

  // ---- 1. what does this schema actually look like? ----------------------
  const statCols = await sample("player_season_stats");
  const playerCols = await sample("players");
  if (!statCols.length) throw new Error("player_season_stats is empty — nothing to repair.");

  console.log("player_season_stats columns:", statCols.join(", "));
  console.log("players columns:            ", playerCols.join(", "), "\n");

  const cGoals = pick(statCols, "goals");
  const cAssists = pick(statCols, "assists");
  const cPlayerRef = pick(statCols, "player_id", "player");
  const cSeasonRef = pick(statCols, "season_id", "season");
  const cStatId = pick(statCols, "id");
  const pName = pick(playerCols, "name", "player_name", "full_name", "web_name");
  const pId = pick(playerCols, "id");

  const missing = Object.entries({ cGoals, cAssists, cPlayerRef, cSeasonRef, cStatId, pName, pId })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error(
      `\nCouldn't map these to real columns: ${missing.join(", ")}.\n` +
        "The column lists above are what the script can see — send them over and " +
        "the mapping can be pinned explicitly.",
    );
    process.exit(2);
  }

  // ---- 2. resolve the season reference ------------------------------------
  let seasonValue = SEASON;
  if (cSeasonRef.endsWith("_id")) {
    const seasons = await db(`/seasons?select=*`);
    const row = seasons.find((s) => Object.values(s).includes(SEASON));
    if (!row) throw new Error(`No seasons row matching "${SEASON}". Rows: ${JSON.stringify(seasons)}`);
    seasonValue = row.id;
    console.log(`Season "${SEASON}" resolves to id ${seasonValue}`);
  }

  // ---- 3. the complete scorers list ---------------------------------------
  const url = `https://api.football-data.org/v4/competitions/PL/scorers?season=${FD_SEASON}&limit=${LIMIT}`;
  const res = await fetch(url, { headers: { "X-Auth-Token": FD } });
  if (!res.ok) throw new Error(`football-data ${res.status}: ${await res.text()}`);
  const { scorers = [] } = await res.json();
  console.log(`football-data returned ${scorers.length} scorers`);
  if (scorers.length >= LIMIT) {
    console.warn("Hit the requested limit exactly — raise --limit, the list may still be cut short.");
  }
  const fewest = Math.min(...scorers.map((s) => s.goals ?? 0));
  console.log(`fewest goals in the list: ${fewest} ${fewest > 1 ? "← still truncated!" : "(complete)"}\n`);

  // ---- 4. match and update -------------------------------------------------
  const players = await db(`/players?select=${pId},${pName}`);
  const byName = new Map(players.map((p) => [norm(p[pName]), p[pId]]));

  const stats = await db(`/player_season_stats?select=${cStatId},${cPlayerRef},${cGoals},${cAssists}&${cSeasonRef}=eq.${seasonValue}`);
  const byPlayer = new Map(stats.map((s) => [s[cPlayerRef], s]));
  console.log(`${players.length} players, ${stats.length} stat rows for this season`);

  let updated = 0;
  const unmatched = [];

  for (const s of scorers) {
    const id = byName.get(norm(s.player?.name));
    if (!id) {
      unmatched.push(s.player?.name);
      continue;
    }
    const existing = byPlayer.get(id);
    const goals = s.goals ?? 0;
    const assists = s.assists ?? 0;
    if (existing && existing[cGoals] === goals && existing[cAssists] === assists) continue;

    if (!DRY) {
      if (existing) {
        await db(`/player_season_stats?${cStatId}=eq.${existing[cStatId]}`, {
          method: "PATCH",
          body: JSON.stringify({ [cGoals]: goals, [cAssists]: assists }),
        });
      } else {
        await db(`/player_season_stats`, {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            [cPlayerRef]: id,
            [cSeasonRef]: seasonValue,
            [cGoals]: goals,
            [cAssists]: assists,
          }),
        });
      }
    }
    updated++;
  }

  console.log(`\n${DRY ? "would update" : "updated"}: ${updated} rows`);
  if (unmatched.length) {
    console.log(`unmatched names (${unmatched.length}): ${unmatched.slice(0, 20).join(", ")}`);
    console.log("These need a manual name fix in `players` — the two feeds spell them differently.");
  }
}

main().catch((e) => {
  console.error("\nFailed:", e.message);
  process.exit(1);
});
