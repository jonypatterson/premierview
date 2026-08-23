/** One place for the things that appear in link previews and page titles. */
export const SITE = "Better Than The Last One";
export const SITE_URL = "https://www.betterthanthelast.one";
export const DESCRIPTION =
  "Your club's Premier League season so far, against the same point last season.";

/**
 * Served from /public rather than the app/opengraph-image file convention: a
 * route that sets its own `openGraph` block replaces the inherited one, and the
 * club pages — the ones people actually share — lost the image that way.
 */
export const OG_IMAGE = "/og.png";
