# Handoff for Claude Code

Repo: `jonypatterson/premierview`, branch `main`.

Read in this order:

1. **`CHANGES.md`** — the six-point work order against the design snapshot.
2. **`BRAND.md`** — the new name, logo lockup and favicon, plus the assets in
   `assets/`.
3. **`design/project/Season Comparison.dc.html`** — the design itself. This is a *reference
   prototype*, not production code: it's a single inline-styled HTML file.
   Recreate it in the repo's existing Next.js + React components and patterns.
   Fidelity is high — colours, type, spacing and animation timings in it are
   final, so match them exactly.

The Supabase backend is live and needs no work. Consume the `team_page(tla)`
RPC and `club_list()`; both already return everything the design shows,
including `goals_series`.

## Getting this to Claude Code

Either:

**Copy the folder in.** Download this folder, drop it at the root of your local
`premierview` checkout, then in Claude Code:

> Read design_handoff/README.md and implement it. Start with BRAND.md, then
> work through CHANGES.md in order. Build and check the browser before you
> commit.

**Or point it at the repo.** The handoff also lives in the repo under
`design/handoff/` once pushed — then just:

> Read design/handoff/README.md and implement it.

Ask it to run the build and open the app before committing; the responsive grid
and the two charts are the parts most likely to need a visual pass.
