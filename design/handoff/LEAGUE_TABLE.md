# League table — new page + 4th nav button

A league-wide standings page, reached from a new fourth button in the floating
nav. Detailed on desktop, reduced on mobile so every column fits without
scrolling sideways.

Reference implementation: `design/project/Season Comparison.dc.html` — search
`showTable`, `tableRows()`, `loadTable()`, and the `.tbl-row` / `.tbl-head`
rules in the `<style>` block.

## 1. Backend — already live, no work needed

New RPC `league_table()` on the Supabase project (`bgijzlomphztrxobsgiq`),
granted to `anon`. Takes no arguments; POST an empty body like the others.

```
POST /rest/v1/rpc/league_table   body: {}
```

Returns one object:

```json
{
  "season": "2026/27",
  "prevSeason": "2025/26",
  "matchweek": 1,
  "rows": [
    {
      "pos": 1, "code": "BHA",
      "name": "Brighton & Hove Albion FC", "short_name": "Brighton Hove",
      "colour": "#0057B8",
      "played": 1, "wins": 1, "draws": 0, "losses": 0,
      "gf": 4, "ga": 0, "gd": 4, "points": 3,
      "prev_pos": 8, "delta": 7,
      "last5": ["W"]
    }
  ]
}
```

Notes on the shape:

- `rows` is already sorted by `pos`.
- `colour` always carries the leading `#` (the `clubs` table stores it without).
- `delta` = `prev_pos - pos`, so **positive means the club is higher up the
  table than it finished last season**. `null` for promoted clubs that have no
  previous-season row.
- `last5` is oldest → newest, derived from real match scores, and is **shorter
  than 5 early in the season** (one entry at MW1). Pad on the client, at the
  front.

The function definition lives at `supabase/functions/league_table.sql` in this
handoff for reference; it is already applied as a migration, so don't re-run it
unless you're rebuilding the database from scratch.

Fetch once per session, lazily on first visit to the tab (the design also
warms it on mount). Cache it in component state; don't refetch on every tab
switch.

## 2. Nav — fourth button

The floating nav goes from three buttons to four (change club, Season,
Players, Table). Everything else about it is unchanged: 42×42 buttons, 4px
gap, 5px padding, active button fills with the club colour and takes
contrast-aware text, idle glyphs `rgba(255,255,255,.62)`, 220ms ease on
background and colour.

Table icon, matching the existing 2.1-stroke outline set:

```html
<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4.5" width="18" height="15" rx="2.4"></rect>
  <path d="M3 9.5h18"></path>
  <path d="M3 14.5h18"></path>
  <path d="M9.5 9.5v10"></path>
</svg>
```

`aria-label="League table"`. Four buttons at 42px + gaps still clears the
390px canvas comfortably.

## 3. Page header

Same pattern as the Season and Players headers, so the club badge stays a
persistent way back into the picker:

- Left: club badge button (38px circle, club colour, contrast-aware initials) →
  opens the picker. Title line is **"League table"**, 700/15px. Meta line
  below, 11px `#8b857c`: `26/27 · MW 1` plus the existing chevron glyph.
- Right: hairline pill (`1px solid #d9d3c9`, 99px radius, 10.5px/600,
  `#6f695f`) reading **"Move vs 25/26"**.

Season labels use the app's existing two-digit shorthand helper.

## 4. The table

One flat white card, 16px radius, `padding: 8px 14px 12px`. No border, no
shadow — the system's standard card.

Both the header row and each data row are the same CSS grid, so columns line
up without a `<table>`:

```css
.tbl-row, .tbl-head {
  display: grid;
  align-items: center;
  gap: 0 6px;
  /* mobile */
  grid-template-columns: 22px 14px minmax(0,1fr) 30px 38px 34px;
}
.tbl-d { display: none }              /* desktop-only cells */

@media (min-width: 1000px) {
  .tbl-row, .tbl-head {
    grid-template-columns:
      26px 16px minmax(0,1fr) 34px 30px 30px 30px 34px 34px 38px 42px 100px;
  }
  .tbl-d { display: flex }
}
```

Twelve cells are always in the DOM, in this order — the six marked `.tbl-d`
simply don't render on mobile:

| # | Cell | Mobile | Desktop |
|---|---|---|---|
| 1 | Position | ✓ | ✓ |
| 2 | Movement arrow | ✓ | ✓ |
| 3 | Badge + club name | ✓ | ✓ |
| 4 | P | ✓ | ✓ |
| 5–7 | W, D, L | — | ✓ |
| 8–9 | GF, GA | — | ✓ |
| 10 | GD | ✓ | ✓ |
| 11 | Pts | ✓ | ✓ |
| 12 | Last 5 | — | ✓ |

### Header row
9.5px, 600, uppercase, `letter-spacing: .8px`, `#b9b2a6`,
`padding: 8px 0 9px`, `border-bottom: 1px solid #E7E2D9`. Labels:
`#`, (blank), `Club`, `P`, `W`, `D`, `L`, `GF`, `GA`, `GD`, `Pts`, `Last 5`.
Numeric headers centre; `Last 5` is right-aligned.

### Data rows
- `padding: 7px 0`, `border-bottom: 1px solid #EFEBE3`; the last row's rule is
  transparent.
- Base 12.5px/400. Numeric cells `#6f695f`, centred. **Pts** is 800 ink.
- **GD** is signed: `+4`, `0`, `-2`.
- Position: 11.5px/700 `#b9b2a6` — the rank is a locator, not a figure.
- Club cell: 24px badge circle in the club colour with contrast-aware 8.5px/800
  initials, 8px gap, then `short_name` with
  `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` and a
  `min-width: 0` parent so long names truncate instead of pushing the grid.
- **The user's saved club** gets `background: #F6F3EE` and `font-weight: 700`.
- Row entrance: `rise .4s cubic-bezier(.2,.7,.3,1)`, delay `0.16 + i*0.022`s —
  the same 22ms stagger the leaderboards use, so 20 rows finish around 0.6s.

### Movement arrow (column 2)
Driven by `delta`. 9px glyph, centred, with a `title` for the tooltip:

| `delta` | Glyph | Colour | Title |
|---|---|---|---|
| `> 0` | `▲` | `#2F7A47` | "N places higher than last season" |
| `< 0` | `▼` | `#DA291C` | "N places lower than last season" |
| `0` | `–` | `#b9b2a6` | "Same position as last season" |
| `null` | `—` | `#d9d3c9` | "Promoted — no last-season position" |

Singular "place" when `|delta| === 1`.

**Movement is measured against last season's final position, not the previous
matchweek.** That is the product's premise, it is defined at MW1 where a
matchweek-over-matchweek delta would not be, and the header pill says so
explicitly ("Move vs 25/26"). Don't quietly switch it to week-over-week.

### Last 5 (desktop only)
Five 17px circles, 3px gap, right-aligned, oldest → newest. 8.5px/800 letter,
using the design system's result tokens:

- `W` → `#DA291C` bg, white text
- `D` → `#E4DFD6` bg, `#191613` text
- `L` → `#191613` bg, white text
- no match yet → transparent with `1.5px dashed #d9d3c9`, no letter

Pad the array **at the front** so played matches stay flush right and the
column reads chronologically left to right.

### Legend
Under the rows, `padding-top: 11px`, 10px `#b9b2a6`, wrapping flex with 14px
gaps: green ▲ "Risen since last season", red ▼ "Fallen", and
"— Promoted, no comparison".

## 5. Page container

- Mobile: `padding: 28px 20px 96px`, `gap: 22px`, column flex — the 96px
  bottom clears the floating nav, as every other screen does.
- Desktop (≥1000px): `padding: 48px 60px 140px`, `max-width: 1000px`, centred.
  The table is a single full-width block, so it does **not** join the
  two-column grid the Season and Players pages use.

## 6. One new colour

`#2F7A47` — a muted forest green for upward movement. The design system has no
positive/green token (red is the *accent*, used for wins, so it can't read as
"bad" on its own), and the arrows need a two-way signal. This green is
deliberately desaturated to sit with the warm paper palette rather than a
bright UI green.

Add it to the token file as `--move-up`, with `--move-down: var(--accent)`, and
use the tokens rather than repeating the hex.
