# PremierView

Your Premier League club's season so far, against the same point last season —
league position, form, record, goals, a position-by-matchweek chart, and a
goalscorers/assists page.

Next.js App Router on Vercel, reading a Supabase/Postgres database that a
scheduled job keeps current. The app never calls a football API at request time.

## Running it

```bash
npm install
cp .env.example .env.local     # add NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Both env vars are required — `lib/queries.ts` throws at import without them.

## Shape

```
app/page.tsx        landing — saved club → /TLA, otherwise the picker
app/[tla]/page.tsx  one route per club, ISR 60s, prerendered for all 20
components/         the design, split by screen
lib/queries.ts      the two RPCs: team_page(code), club_list()
lib/view.ts         every derived number, label, bar width and chart point
lib/config.ts       COMPARE_MODE — same-matchweek or final-table
```

**Why it's fast.** `revalidate = 60` means Vercel serves cached HTML for a minute
at a time, so the common case never reaches Postgres. Data arrives with the
HTML; the skeleton only ever appears on a client-side club switch. The hourly
sync is what makes the page current, the cache is what makes it instant.

**Club memory.** The chosen club is written to `localStorage` and the route is
the source of truth — `/` redirects to it on later visits. Visiting `/ARS`
directly also sets it.

**Comparison basis.** `COMPARE_MODE` switches the whole page between
"same matchweek last season" (the fair comparison, and the default) and "last
season's final table". The note, the delta pill and every *last season* figure
move together.

**Club colour.** The accent — position pill, form dots, goals bar, chart line and
marker, active tab icon — comes from `clubs.colour`. Anything sitting on that
colour takes a computed foreground, so light clubs (Leeds, Hull, City, Coventry,
Villa) get near-black text rather than unreadable white.

## Type

Rubik throughout, with figures set in Roboto 700 — a little narrower and quieter
than Rubik's 800.

## Backend

Documented in [`design/project/ARCHITECTURE.md`](design/project/ARCHITECTURE.md):
schema, the `sync-season` Edge Function, the hourly pg_cron job, and the two
gotchas worth remembering (generated columns can't be written to; the table must
only rank clubs from that season).

## Design source

`design/` holds the Claude Design handoff this was built from — the
`.dc.html` prototype, its chat transcript, and the architecture notes. It isn't
part of the build (excluded in `tsconfig.json`); it's there as the reference for
what the screens are meant to look like.
