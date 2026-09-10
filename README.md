# PremierView

Your Premier League club's season so far, against the same point last season —
league position, form, record, goals, a position-by-matchweek chart, and a
goalscorers/assists page.

Next.js App Router on Vercel, reading a Supabase/Postgres database that a
scheduled job keeps current. The app never calls a football API at request time.

## Running it

```bash
npm install
cp .env.example .env.local     # fill in SUPABASE_URL and SUPABASE_ANON_KEY
npm run dev
```

Both are required — `lib/queries.ts` throws at import without them. Find them in
the Supabase dashboard under Project Settings → API.

Every read runs on the server, so the unprefixed names are used deliberately:
the key never reaches the client bundle. `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are accepted as a fallback, since
`ARCHITECTURE.md` documents those, but prefer the unprefixed pair.

**On Vercel**, set the same two variables in the project's Environment Variables
for Production, Preview and Development. The build fails without them.

## Analytics

Google Analytics 4, wired in `app/layout.tsx` via `@next/third-parties`. It is
driven by one optional variable:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Unset, no tag is rendered at all — which is how local runs and preview
deployments stay out of the numbers without a second property. Set it on
Production only. The measurement ID is public by design: it names the property,
it does not grant access to it, and gtag runs in the browser, so it cannot be a
server-only value the way the Supabase key is.

Club switches are `router.push`, and GA4's enhanced measurement counts a history
change as a page view, so `/ARS`, `/MUN` and the rest are counted without any
manual `send`. The three tabs within a club are React state rather than routes,
so they are not — if you want them, they need an explicit `event`.

**Consent.** GA4 sets cookies, and in the UK/EU that needs consent before the
tag runs, not after. There is no consent banner in this app yet, so this is
worth settling before the site gets meaningful traffic — either a banner gating
the tag, or Google's consent mode with analytics storage denied by default.

## Shape

```
app/page.tsx        landing — saved club → /TLA, otherwise the picker
app/[tla]/page.tsx  one route per club, rendered per request
app/globals.css     the design system's tokens, transcribed, then the shell
components/ds/      the design system primitives, ported from the handoff
components/         one file per screen, composed from components/ds
lib/queries.ts      the three RPCs: team_page(code), club_list(), league_table()
lib/view.ts         every derived number, label, bar width and chart point
lib/palette.ts      club colour → nearest chalk, and the accent rotation
lib/config.ts       COMPARE_MODE — same-matchweek or final-table
```

**Layout.** Screens are absolutely positioned inside `.mw-inner` and scroll
independently, because the tab bar is the one fixed element and everything else
passes under it — that is what the 132px of bottom clearance on each screen is
for. Anything rendered outside a screen can never be scrolled to, which is why
the footer sits inside each one.

**Why it's current.** Both routes are `force-dynamic`, so the RPCs run on every
request. They used to be ISR, which was wrong for live results: `revalidate` on
Vercel is stale-while-revalidate, so the first visitor after a fixture was
reliably served yesterday's table while regeneration happened behind them. The
queries are indexed RPCs issued in parallel and the pages are small. Data still
arrives with the HTML, so the loading screen only appears on a client-side club
switch.

**Club memory.** The chosen club is written to `localStorage` and the route is
the source of truth — `/` redirects to it on later visits. Visiting `/ARS`
directly also sets it.

**Comparison basis.** `COMPARE_MODE` switches the whole page between
"same matchweek last season" (the fair comparison, and the default) and "last
season's final table". The insight sentence, the hero's delta and every
*was …* figure move together.

**The two form strips** come from `team_page`'s `form` and `form_prev`. The
second was added to the RPC for this design — see
`supabase/migrations/20260910_team_page_form_prev.sql`. It is capped by
gameweek number, not by count, so matchweek 3 is set against matchweek 3 rather
than against the end of last season. A promoted club returns `[]` and the
screen drops the strip and its legend rather than showing an empty row.

**Club colour.** The club mark does *not* use `clubs.colour` directly. The
design system allows no colour outside its own five chalks, so `lib/palette.ts`
snaps the kit hex to the nearest chalk **by hue** — which is why Arsenal reads
pink rather than red, and why a navy kit lands on the blue chalk instead of
whichever pastel is closest in raw RGB. Initials are always ink: every chalk is
light enough that no contrast test is needed.

**Colour means metric, not value.** The four accents rotate in order down a
list; they never encode good or bad. Judgement is carried only by
`--delta-up` / `--delta-down` on small bold text, never by a fill.

## Type

Outfit for everything read, DM Mono for everything labelled — mono is never used
for a sentence. The signature is the display figure: Outfit 700 with tracking
that tightens as size grows and returns to zero by 15px.

## Backend

Documented in [`design/project/ARCHITECTURE.md`](design/project/ARCHITECTURE.md):
schema, the `sync-season` Edge Function, the hourly pg_cron job, and the two
gotchas worth remembering (generated columns can't be written to; the table must
only rank clubs from that season).

## Design source

`design/` holds the Claude Design handoff the **first** build was made from —
the `.dc.html` prototype, its chat transcript, and the architecture notes. It
isn't part of the build (excluded in `tsconfig.json`).

The current design is a later export, the **Matchday design system**, and the
app was rebuilt on it: `Brand Mark.dc.html` for the mark and
`Season Comparison - Matchday.dc.html` for the screens. That bundle is *not*
committed — see the note below — so the tokens are transcribed into
`app/globals.css` and the components ported into `components/ds/`, each marked
as a transcription so a later revision can be diffed against them.
`design/project/STALE.md` says which parts of the older handoff no longer apply.

### Credentials in the handoff bundles

Two appeared in the first bundle — a football-data.org API key pasted into the
transcript, and the Supabase anon key hardcoded in the prototype. Both are
redacted from the files and purged from git history. The football-data key was
live at the time and should be treated as compromised: rotate it, using the
statement in `ARCHITECTURE.md`.

**The Matchday bundle carries the Supabase anon key too**, hardcoded in
`Season Comparison - Matchday.dc.html` so the prototype could call the RPCs
directly from the browser. That is why it is not in this repo. The key is the
publishable one and RLS is what actually guards the data, but this app has
always kept it server-side — `lib/queries.ts` reads the unprefixed
`SUPABASE_ANON_KEY` deliberately, so it never reaches the client bundle — and
committing the prototype would undo that. Keep it out.
