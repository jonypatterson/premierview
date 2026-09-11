/** One place for the things that appear in link previews and page titles. */
export const SITE = "Better Than The Last One";
export const SITE_URL = "https://www.betterthanthelast.one";
export const DESCRIPTION =
  "Your club's Premier League season so far, against the same point last season.";

// The share cards are no longer here. Both are rendered by the
// app/opengraph-image file convention — one at the root for the site, one under
// [tla] for each club — so neither can fall behind the design the way a PNG
// checked into /public did. There is no shared constant to point at, because
// each route supplies its own and none of them names a URL.
