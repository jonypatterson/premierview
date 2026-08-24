# Design changes since design/project snapshot @ commit 276d2361

Source of truth: `design/project/Season Comparison.dc.html` (replace with the
copy in this folder). Implement each in the Next.js components.

Brand work — new name, logo and favicon — is in **`BRAND.md`** in this folder,
with the assets under `assets/`. Do that alongside §4.

## 1. Responsive layout (new)
- ≤999px: NO card frame — no border, radius, or shadow; app fills the viewport
  (100% width, min-height 100dvh). Picker + loading/error columns cap at 520px
  centred.
- ≥1000px: centred card up to 1100px wide on the #EBE8E2 canvas. Screens
  re-flow onto a 2-column grid (gap 36px 52px, padding 48px 60px 140px):
  - Season areas: "hdr hdr" / "pos rec" / "form goals" / "chart chart"
  - Players areas: "hdr hdr" / "top sum" / "scorers assists" / "gchart gchart"

## 2. Charts (both pages)
- SVG viewBox 0 0 320 160, preserveAspectRatio="none", width:100%, all strokes
  vector-effect="non-scaling-stroke" → gridlines/lines span the full width.
- Marker + pulse halo are HTML divs over the svg (percentage left/top,
  centred by negative margins, NOT transform — entrance animations own
  transform). Wrapper: flex:1, position:relative, height:160px,
  align-self:flex-start.
- x positions inset: x = 8 + (i/37)*304.
- 14px extra margin above each chart block.

## 3. Goals by matchweek (new, players page, full width)
- Data: `goals_series` field on the team_page RPC (already live in Supabase):
  cumulative goals per gameweek per season label; client diffs to per-GW.
- Dashed grey #B9B2A6 = last season, club-colour solid line + pulsing dot =
  this season. Y axis 0 → max(4, best week), gridlines at max/mid/0; bottom
  gridline IS 0. Hidden when no series data.

## 4. Club picker (redesigned)
- Logo lockup top-centre: "2nd" numeral (800, 64px) + red ▲4 pill +
  the "Better than the last one" lockup (see BRAND.md; it replaces the
  MATCHDAY letter-spaced caption).
- 20 clubs in a 4-col tile grid (5-col ≥1000px): white tiles, 14px radius,
  badge circle + name, pop-in stagger; current club ringed in ink.
- 36px gaps between lockup / heading / grid; padding 56px 24px 40px.
- Club list from club_list() RPC (fallback constant list).

## 5. States
- Problem/empty screen has TWO actions: "Try again" + "Choose another club"
  (opens picker — never a dead end).
- Known club with no completed match: "No completed matches yet — {club}
  haven't finished a match this season yet…" (team_page returns team but
  summary null). Unknown club keeps generic copy.

## 6. Copy + type
- Typeface: Rubik (300..900) everywhere.
- Prev-season notes read "N last season" (aligned mode) or "N in 25/26"
  (final-table mode). Delta pill / form dots / tab glyphs use contrast-aware
  text colour on the club colour (luminance > 165 → #191613 else #fff).
