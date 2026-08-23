# Brief: fix last season's truncated player figures (PremierView)

Paste this to the Claude Design session that still has the Supabase connector.

---

## The bug

On the Players page, players who scored last season show **0 last**. Kai Havertz
scored 2 in 2025/26 and the app credits him with none. It is not one player —
it is everyone below a cutoff.

## The cause

Last season's per-player goals were ingested from football-data's
`/v4/competitions/PL/scorers` endpoint. That endpoint returns only the league's
leading scorers, and the request was capped well below the number of players who
actually score in a season (~300). Everyone below the cap kept `goals = 0` for
2025/26, and the app renders that 0 as fact.

The current season is unaffected: it comes from the FPL API, which returns every
player.

Supporting evidence, from a `team_page('MUN')` payload: only **6** Man United
players came back, the lowest on **4** goals. That is a top-N list, not a squad.

## Please do this

**1. Confirm it.** `scripts/diagnose-player-data.sql` in the repo has the
queries. The tell is the league-wide floor:

```sql
select count(*) as scorer_rows, min(goals) as fewest_goals
from player_season_stats p join seasons s on s.id = p.season_id
where s.label = '2025/26' and p.goals > 0;
```

A floor of 3 or 4 rather than 1 confirms truncation. Also check
`select * from players where name ilike '%havertz%'` joined to his stat row.

**2. Fix the ingestion.** Read the deployed `sync-season` Edge Function
(`get_edge_function`). Find the scorers fetch and raise its limit —
`?season=2025&limit=500`. Check whether the limit is applied per season or only
to the current one; last season is the one that matters here. Redeploy.

> The function's source exists **only** in Supabase — it was written through the
> connector and never landed in the repo. Please also paste the final source
> back into the repo at `supabase/functions/sync-season/index.ts` so it stops
> being unversioned. That is the reason this brief exists.

**3. Backfill 2025/26** by invoking the function for that season, the same way
the original backfill was run.

**4. Verify, in this order:**
- `fewest_goals` for 2025/26 is now 1, and `scorer_rows` is in the hundreds.
- Havertz reads 2.
- `team_page('MUN')` returns far more than 6 players.
- `team_page('ARS')->'players'` contains Havertz with `prev_goals = 2`.

**5. Watch for two things.**
- **Name matching.** FPL and football-data spell players differently; matching is
  by normalised name, so some will miss. Report any unmatched names rather than
  silently dropping them — `players.fpl_id` exists for manual correction.
- **Rate limits.** The free tier is 10 requests/minute. A larger `limit` is still
  one request, so this does not add load.

**6. If `limit=500` is refused or still comes back truncated**, say so rather
than working around it — that changes the fix to a different source (FPL
`element-summary` per player for history, or a paid feed) and is worth a
decision rather than a workaround.

## Fallback if you would rather not touch the function

`scripts/repair-player-season.mjs` in the repo repairs the stored rows directly
via PostgREST — it introspects the schema, refetches the complete list, and
updates in place, with `--dry`. It needs `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY` and `FD_API_KEY`. It has **never been run** — it was
written without access to the database, so expect one correction on first use.
It fixes stored data only; the hourly sync would keep re-truncating until the
function itself is fixed.

## Also outstanding

The football-data API key was exposed in the design chat transcript before being
redacted from this repo. It has not been rotated. New key →
`insert into app_config (key, value) values ('football_data_api_key', 'NEW_KEY')
on conflict (key) do update set value = excluded.value;`
