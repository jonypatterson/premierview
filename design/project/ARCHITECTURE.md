# PremierView — live backend

Supabase project **PremierView** (`bgijzlomphztrxobsgiq`, eu-west-1). Everything
below is deployed and running; nothing here is a plan.

## What's live

| Piece | Detail |
|---|---|
| Data source | football-data.org v4 (key in `app_config`, 10 req/min) + public FPL API |
| Schema | the project's existing one — `clubs`, `seasons`, `gameweeks`, `matches`, `team_gameweek_stats`, `players` |
| Added | `app_config` (locked down), `player_season_stats` (season totals) |
| Ingestion | Edge Function `sync-season` |
| Schedule | pg_cron job `sync-season-hourly`, every hour at :05 |
| Reads | `team_page(code)` and `club_list()` — one RPC each, public via RLS |

## Data loaded

- **2025/26** — 380 matches, 38 gameweeks of table positions, 100 player rows.
  Verified: Arsenal champions on 85, Man United 3rd on 71.
- **2026/27** — 380 fixtures, gameweek 1 played, 20 clubs (Coventry and Hull up).

## How it works

```
pg_cron :05 hourly
  └─ pg_net POST → sync-season
       ├─ football-data: teams, all matches, top scorers   (3 API calls)
       ├─ recompute the table after every gameweek played
       ├─ FPL: goals + assists for the live season
       ├─ upsert clubs / matches / team_gameweek_stats / player_season_stats
       └─ log to ingestion_runs

page load
  └─ team_page('MUN')  → one jsonb: summary, series, players, form, lastSync
```

League positions are **computed from the match list**, not read from a standings
endpoint. That's the only way to get position-after-every-gameweek for last
season, and it means both seasons are built by identical code.

## Things to know

**Only the season's own clubs are ranked.** Ranking across every club ever in
`clubs` put United 23rd of 23 on the opening weekend. The sync now seeds the
table from that season's competition only, and clubs yet to play rank last
rather than above sides that have lost.

**Generated columns.** `goal_difference`, `xg_difference` and `duration_ms` are
GENERATED — writing to them fails the whole upsert.

**Comparison mode.** `team_page` returns both `prev_*_same_mw` (same gameweek
last season — the fair comparison) and `prev_final_*` (last season's final
table). The UI's `compareMode` tweak switches between them.

**Rate limit.** One sync = 3 API calls, so hourly is comfortable. Don't add
per-user syncing.

## Operations

```sql
-- health
select status, notes, error_message, completed_at
from ingestion_runs order by started_at desc limit 10;

-- run now
select net.http_post(
  url := 'https://bgijzlomphztrxobsgiq.supabase.co/functions/v1/sync-season',
  body := '{"triggered_by":"manual"}'::jsonb,
  headers := '{"Content-Type":"application/json"}'::jsonb);

-- re-ingest a finished season
select net.http_post(
  url := 'https://bgijzlomphztrxobsgiq.supabase.co/functions/v1/sync-season',
  body := '{"season":"2025/26"}'::jsonb,
  headers := '{"Content-Type":"application/json"}'::jsonb);

-- rotate the API key
insert into app_config (key, value) values ('football_data_api_key', 'NEW_KEY')
on conflict (key) do update set value = excluded.value;

-- pause / resume the schedule
select cron.unschedule('sync-season-hourly');
```

## Not covered

Live in-match scores (hourly is too coarse), xG (columns exist, no free feed
fills them), and player photos. Season rollover needs one statement each August:
insert the new `seasons` row, move `is_current`, and insert its 38 gameweeks.

## For the Vercel app

```
NEXT_PUBLIC_SUPABASE_URL=https://bgijzlomphztrxobsgiq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

`lib/queries.ts` wraps the two RPCs. `app/[tla]/page.tsx` renders one route per
club with 60-second ISR, so most visits never reach Postgres.
