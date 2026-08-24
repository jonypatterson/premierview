# Brand: "Better than the last one" — logo + favicon

New name. The app is called **Better than the last one**. Replace the working
title "Matchday" / "Season Comparison" everywhere it appears in UI copy,
`<title>`, and metadata.

Sentence case in prose ("Better than the last one"). The logo lockup sets it in
uppercase — that is `text-transform`, not the name's real casing.

## 1. Logo — two-line lockup

A red badge on the left, the name stacked in two lines to its right.

Reference render: `assets/logo-lockup-flat.png` (1535×341, transparent).

**Do not ship that PNG as the header logo.** It came out of an image generator,
so its letterforms carry faint red edge artifacts and it can't recolour or
reflow. Build the lockup as a badge image + live text:

### Badge
- `assets/logo-badge-512px.png` (also 128px, and `logo-badge.png` at native
  322×339). Flat `#DA291C` square, white rising arrow, transparent outside.
- Square, no corner radius, no shadow. Height = the wordmark's full two-line
  height (1:1 aspect).
- If you'd rather have vector: it is a plain square plus a 5-point polyline
  with an arrowhead — trivial to redraw as inline SVG at
  `stroke: #fff; stroke-width: 2.1; stroke-linecap: round`, matching the
  existing tab-bar icon style.

### Wordmark
- Two lines, uppercase: `BETTER THAN` / `THE LAST ONE`.
- Rubik 800, `letter-spacing: -0.02em`, `line-height: 0.92`, colour `#191613`.
- Left-aligned, flush left against the badge with a gap of ~0.45× the badge
  width.
- Set the two lines as separate elements (not a `<br>` inside one string) so
  the leading is controllable.

### Lockup rules
- Minimum clear space around the whole lockup: 0.25× badge width.
- Minimum lockup height 40px — below that use the badge alone.
- On the `#EBE8E2` canvas and on white cards, ink stays `#191613`. On the ink
  nav (`#191613`) invert the wordmark to `#F6F3EE`; the badge does not change.
- Never recolour the badge to a club colour. The red is the product's, not a
  team's.

## 2. Favicon — the wordless mark

Reference: `assets/favicon-source.png` (1230×1230), exported at
`favicon-512px.png`, `favicon-180px.png`, `favicon-32px.png`.

A solid `#DA291C` rounded square. Inside, in white: a line rising to a dot in
the upper right, and a dashed horizontal line low in the tile — this season
against last, the same two strokes the charts use. No text (the name is far too
long to set at 32px).

Wire up in the Next.js app:

- `app/icon.png` → the 512px export (Next generates the rest), or explicitly:
- `favicon.ico` from the 32px export
- `apple-icon.png` from the 180px export
- `metadata.icons` in `app/layout.tsx`

The tile's own corner radius is baked into the PNG, so don't add a mask or a
second radius in CSS.

## 3. Where the logo goes

- **Club picker**, replacing the current "MATCHDAY" letter-spaced caption
  above the heading (CHANGES.md §4): the full lockup, top-centre, badge height
  44px.
- **Browser tab / installed icon**: the favicon above.
- The Season and Players screens keep no logo. They open on the club's own
  header, and a second mark there would compete with it.

## Assets in this folder

| File | Use |
|---|---|
| `logo-badge-512px.png` | badge for the lockup (also 128px, native) |
| `logo-lockup-flat.png` | full-lockup reference render — layout only, do not ship |
| `favicon-512px.png` | `app/icon.png` |
| `favicon-180px.png` | `apple-icon.png` |
| `favicon-32px.png` | `favicon.ico` |
| `favicon-source.png` | full-resolution favicon master |

Colours are exact: `#DA291C` red, `#191613` ink, `#EBE8E2` canvas,
`#F6F3EE` screen surface. Every asset here is already snapped to those values.
