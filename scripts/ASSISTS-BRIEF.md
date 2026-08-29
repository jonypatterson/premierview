# Assists were missing for the live season

**Status: diagnosed and fixed in source. Awaiting deploy of `sync-season` v11.**

Not the defect in `DATA-FIX-BRIEF.md`, which was last season's *goals*.

## The symptom

`betterthanthelast.one/MCI` at MW 2 reported three assists for the season. The
MW 2 match alone produced four — Foden twice, Semenyo and Gvardiol once each —
and a cumulative figure cannot be lower than one matchweek inside it. Phil Foden
read "—" despite setting up two goals.

## The cause

Two things, both confirmed against the database and the deployed source.

**1. Only goalscorers ever get a row.** `sync-season` builds
`player_season_stats` with `scorers.map(...)`, and football-data's `/scorers`
endpoint lists nobody who has not scored. A player who assists but does not
score is therefore absent from the table entirely, not stored as zero. Foden had
**no 2026/27 row at all** — his `players` record exists and his 2025/26 row is
fine, so this was never a name-matching failure.

Confirmed: every 2026/27 row sourced from football-data had `goals > 0`. Not one
had zero.

**2. football-data's free tier barely reports assists.** Of 38 scorer rows,
**6** carried an assist figure; the other 32 were NULL. v10 had deliberately made
football-data authoritative for assists and refused to take them from FPL, for a
good reason recorded in its header — FPL counts assists more liberally, and v8's
`max(existing, fpl)` had inflated Bruno Fernandes' record 21 assists in 25/26 to
24. Correct for a finished season; it left the live one nearly empty.

The only reason any assists showed at all was **19 stale rows carrying
`data_source = 'fpl'`**, left behind by v8 and contradicting v10's own policy.

## The fix (v11)

Precedence now depends on whether the season has finished, using the same
`maxGw < 38` test that already decided whether FPL was fetched:

| | goals | assists | assist-only players |
|---|---|---|---|
| Completed season | football-data | football-data only — as v10 | not added |
| Live season | football-data, FPL fills gaps | **FPL** | **inserted** |

A season therefore reverts to the official record by itself once its 38th
gameweek completes, so the Bruno case cannot come back.

Identity resolution for the new inserts goes through `players.full_name`,
`players.display_name` and `player_aliases` — the path `backfill-assists`
already uses — rather than v10's match on the scorer's name alone, which was
failing for 20 players a run (Calafiori, Ben White, Evanilson…). New FPL
spellings are recorded as aliases so the next run resolves instead of creating a
duplicate.

The 19 stale `fpl` rows are corrected in place by the upsert on
`(player_id, season_id)` — they do not need deleting.

## Deploy and verify

```
deploy supabase/functions/sync-season/index.ts as sync-season
POST {"season":"2026/27","triggered_by":"manual"}
```

Then check, in order:

```sql
-- Foden should now hold >= 2 assists for 2026/27
select pl.display_name, p.goals, p.assists, p.data_source
from player_season_stats p
join players pl on pl.id = p.player_id
join seasons s on s.id = p.season_id
join clubs c on c.id = p.club_id
where c.code = 'MCI' and s.label = '2026/27'
order by p.goals desc nulls last, p.assists desc nulls last;

-- MCI's season total must be >= 4, and league-wide assists should be
-- roughly 60-70% of goals rather than a handful.
select sum(goals) as goals, sum(assists) as assists
from player_season_stats p join seasons s on s.id = p.season_id
where s.label = '2026/27';

-- 2025/26 must be UNCHANGED: Bruno Fernandes still 21, not 24.
select pl.display_name, p.goals, p.assists, p.data_source
from player_season_stats p
join players pl on pl.id = p.player_id
join seasons s on s.id = p.season_id
where s.label = '2025/26' and pl.full_name ilike '%fernandes%';
```

The run's `ingestion_runs.notes` reports the assist-only row count and any
unresolved FPL names.

## No app changes needed

`playersView` in `lib/view.ts` reads `p.assists` from the payload and sums it;
the assists list is the same `rank()` helper as the goals list with a different
key. It renders whatever the RPC returns.

## Still outstanding

The football-data API key was exposed in the design transcript and **has not
been rotated**. Treat it as compromised.
