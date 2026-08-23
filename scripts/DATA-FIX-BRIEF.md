# Brief: last season's player figures read as 0

**Status: resolved by the owner.** Kept for the diagnostic queries and for the
one outstanding item at the bottom. Nothing here needs doing.

Neither theory below was ever verified — the session that wrote this had no
database access at the time.

---

## The symptom

On the Players page, players who scored last season show **0 last**. Kai Havertz
scored 2 in 2025/26 and the app credits him with none. The current season looks
right; it is the previous-season figures that are wrong.

## Theory A — the scorers feed is capped

Last season's per-player goals come from football-data's
`/v4/competitions/PL/scorers`, which returns only the league's leading scorers.
If the request's `limit` is below the ~300 players who score in a season,
everyone underneath keeps `goals = 0`.

Supporting: a `team_page('MUN')` payload returned only **6** Man United players,
the lowest on 4 goals.

Against: Bournemouth's page shows scorers on 2, 3, 5 and 6 goals — below the
cutoff that theory implies. So it does not fit every club, and may be wrong or
only part of the story.

## Theory B — the same player exists as two rows

FPL and football-data spell players differently and the sync matches them by
normalised name. Where that match fails, one player can end up as two rows —
one holding this season's figures, the other last season's — and the page shows
whichever it finds, with the other season reading 0.

Supporting: Bournemouth's **assists list** shows "Francisco Evanilson de Lima
Barbosa" at #1 (1 this season, 0 last) and "Evanilson" at #5 (—, 2 last) — two
entries in the same list. (A player legitimately appears in both the goals and
the assists list; this is two rows within one list, which is different.)

Not verified: it may be two genuinely different players, or a display quirk.
Check before acting on it.

## Please do this

**1. Establish which, if either, is true.**

```sql
-- A: is the 2025/26 scorer list cut off? A floor above 1 goal says yes.
select count(*) as scorer_rows, min(goals) as fewest_goals
from player_season_stats p join seasons s on s.id = p.season_id
where s.label = '2025/26' and p.goals > 0;

-- B: players whose name collapses to the same surname within a club
select club_id, lower(regexp_replace(name, '.* ', '')) as surname,
       count(*), array_agg(id), array_agg(name)
from players group by 1, 2 having count(*) > 1 order by 3 desc;

-- B: players carrying figures in only one of the two seasons
select pl.id, pl.name, count(distinct s.label) as seasons_present
from players pl
join player_season_stats p on p.player_id = pl.id
join seasons s on s.id = p.season_id
group by 1, 2 having count(distinct s.label) = 1;

-- the specific case
select pl.id, pl.name, s.label, p.goals, p.assists
from players pl
join player_season_stats p on p.player_id = pl.id
join seasons s on s.id = p.season_id
where pl.name ilike '%havertz%' or pl.name ilike '%evanilson%';
```

Report what these return before making changes.

**2. Read the sync.** `get_edge_function` on `sync-season`. Find where
football-data scorers are fetched (note the `limit`) and where FPL players are
matched to football-data players. Establish what happens when a match fails.

> The function's source exists **only** in Supabase — it was written through the
> connector and never landed in the repo. Please paste the final source back to
> `supabase/functions/sync-season/index.ts` so it stops being unversioned. That
> is why this handoff is needed at all.

**3. Fix whichever the queries implicate.**
- If A: raise the scorers `limit` to 500 and re-run the 2025/26 backfill.
- If B: match on a stable key — `players.fpl_id` already exists — rather than a
  display name; merge duplicate rows onto one `player_id`; add a unique
  constraint so it cannot recur.
- If both, do B first: merging after a re-ingest is harder than before it.

**4. Verify.** Havertz reads 2 for 2025/26; `team_page('MUN')` returns a
realistic squad rather than 6 players; no club lists the same player twice in
one list; the "players who scored / last season" figure is in the teens for a
typical club.

**5. If the queries support neither theory, say so** and report what you found
rather than applying a fix that doesn't match the evidence.

## No app changes needed

The Players page renders whatever `team_page` returns and needs no change once
the rows are right. `scripts/repair-player-season.mjs` was written for Theory A
and has never been run — **do not run it before step 1**; if B is the real cause
it would write into duplicated rows and make things worse.

## Also outstanding

The football-data API key was exposed in the design chat transcript before being
redacted from this repo, and has not been rotated. New key →
`insert into app_config (key, value) values ('football_data_api_key', 'NEW_KEY')
on conflict (key) do update set value = excluded.value;`
