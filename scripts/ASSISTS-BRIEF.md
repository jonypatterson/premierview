# Brief: this season's assists are under-counted

**Status: diagnosed from the payload, not yet confirmed against the database.**
The session that wrote this had no database connection. Run step 1 before
changing anything.

Not the same defect as `DATA-FIX-BRIEF.md`, which was last season's *goals* and
is resolved. This is the *current* season's *assists*.

## The symptom

`betterthanthelast.one/MCI` at MW 2 reports:

| | app says | actually happened in MW 2 alone |
|---|---|---|
| Assists, total | **3** | **4** (Foden 2, Semenyo 1, Gvardiol 1) |
| Phil Foden | — | 2 (assisted Cherki 54', Haaland 84') |
| Rayan Cherki | 2 | 0 — he *scored* twice (54', 59') |
| Joško Gvardiol | 1 | 1 (assisted Cherki 59') |

Match: Crystal Palace 1–4 Man City. City's four goals were Haaland 17'
(Semenyo), Cherki 54' (Foden), Cherki 59' (Gvardiol), Haaland 84' (Foden).

## What that proves

**1. The season total is arithmetically impossible.** A cumulative two-matchweek
figure cannot be lower than a single matchweek inside it. 3 < 4. This holds
without needing to know any MW 1 value, so it is the fact to trust.

**2. Goals from the same matchweek did land.** The app's goalscorer list reads
Haaland 2, Cherki 2, Guéhi 1, Gvardiol 1 — six goals. Four of those (Haaland's
two, Cherki's two) are from MW 2 and are correct, leaving two for MW 1, which is
consistent.

So MW 2 *was* ingested and its **goals were written while its assists were
not**. That is the crux: goals and assists arrive in the same FPL fetch for the
same players in the same sync, so this is not a player that failed to match —
a name-match failure would zero a player's goals too. It points at the assists
value specifically: the field read from FPL, the column written, or a later
write that overwrites it.

**3. It is not the app.** `playersView` in `lib/view.ts` reads `p.assists`
straight from the `team_page` payload and sums it; the assists list is the same
`rank()` helper as the goals list with a different key. Nothing is transposed.
Confirm by eye if you like, but no app change will fix this.

## Please do this

**1. Confirm against the rows, before touching the sync.**

```sql
-- Does the stored row disagree with the match? Foden should hold >= 2 assists.
select pl.name, s.label, p.goals, p.assists
from players pl
join player_season_stats p on p.player_id = pl.id
join seasons s on s.id = p.season_id
join clubs c on c.id = pl.club_id
where c.tla = 'MCI' and s.label = '2026/27'
order by p.assists desc nulls last, p.goals desc;

-- Is `assists` null rather than 0? Null and 0 mean different things here:
-- null suggests never written, 0 suggests written as empty.
select count(*) filter (where assists is null) as null_assists,
       count(*) filter (where assists = 0)    as zero_assists,
       count(*) filter (where assists > 0)    as real_assists,
       count(*) filter (where goals   > 0)    as real_goals
from player_season_stats p
join seasons s on s.id = p.season_id
where s.label = '2026/27';

-- League-wide sanity: assists should be roughly 60-70% of goals, not ~0.
select sum(goals) as goals, sum(assists) as assists
from player_season_stats p
join seasons s on s.id = p.season_id
where s.label = '2026/27';
```

If `sum(assists)` is far below `sum(goals)` league-wide, the defect is
systematic rather than a few unmatched players.

**2. Read the sync.** `get_edge_function` on `sync-season`. Check, in order:

- The FPL field being read. Goals are `goals_scored` and assists are `assists`
  on an FPL element — reading `assist` or `expected_assists` silently yields
  nothing useful.
- Whether the football-data write runs *after* the FPL write and includes an
  `assists` column. football-data's free tier does not populate assists
  reliably — that is the stated reason FPL was chosen for it (`design/chats/
  chat1.md`) — so a later upsert carrying its empty assist value would erase the
  good one. Goals would survive because both sources agree on goals.
- Whether `assists` is in the upsert's conflict-update list at all. A column
  omitted from `do update set` keeps its first-ever value and never moves again,
  which would fit assists being stuck while goals advance each week.

**3. Fix, then verify** with the MW 2 facts above: Foden ≥ 2 assists for
2026/27, and the MCI season assist total ≥ 4.

> As with the last brief: `sync-season` exists only in Supabase and is still
> unversioned. Please paste the source into
> `supabase/functions/sync-season/index.ts` while you are in there.

## Still outstanding

The football-data API key was exposed in the design transcript and **has not
been rotated**. Treat it as compromised.
