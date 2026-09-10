# The HTML reference here is superseded outright

> **Superseded.** The app has since been rebuilt on the Matchday design system,
> from `Season Comparison - Matchday.dc.html` in a later Claude Design export.
> `Season Comparison.dc.html` in this folder describes a design the app no
> longer has — a different palette, a different typeface and a different
> layout. It is kept only as the record of what the first build was made from.
>
> The current source of truth is the design system's own tokens, transcribed
> into `app/globals.css`, and the components in `components/ds/`.

Everything below concerns that earlier design, and is retained for history.

---

`Season Comparison.dc.html` in this folder is the Claude Design snapshot taken
at commit `276d2361`. A later design revision was implemented in the app, and
that prototype file was **not** regenerated — so where the two disagree, the
components were correct and this file was not.

Landed after this snapshot:

1. **Responsive layout.** Below 1000px there is no card frame at all — the app
   fills the viewport. At 1000px and up it is a centred card up to 1100px wide,
   with both screens re-flowed onto a two-column grid.
2. **Charts stretch to full width.** `preserveAspectRatio="none"` with
   `vector-effect="non-scaling-stroke"`, and the marker and pulse halo moved out
   of the SVG into positioned HTML.
3. **Goals by matchweek** — a second chart on the Players page, fed by the
   `goals_series` field on `team_page`.
4. **Club picker redesigned** — logo lockup, and a tile grid (4 columns, 5 at
   1000px and up) in place of the list.
5. **Problem screens offer two ways out**, and a known club with no completed
   match gets its own copy rather than the generic empty state.

The design source of truth is the Claude Design project; this file is kept for
the visual lineage of the earlier revision only.
