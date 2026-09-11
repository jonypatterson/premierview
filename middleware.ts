import { NextResponse, type NextRequest } from "next/server";

/**
 * The [tla] route sits at the root, so it catches every single-segment path.
 * The page itself already refuses anything that isn't a three-letter code, but
 * `notFound()` inside a route with `revalidate` set still answers 200 — a soft
 * 404, which invites a crawler to index an unbounded set of junk URLs.
 *
 * Rejecting here, before the route renders, gives the real status. The test is
 * on shape only: which three-letter codes are actual clubs is a data question
 * that changes with promotion, and 404ing a real club would be far worse than
 * the page's own "no data yet" screen.
 */
export function middleware(req: NextRequest) {
  const segment = req.nextUrl.pathname.slice(1);
  // Single-segment paths only. [tla] catches those and nothing deeper, so a
  // nested path is a route in its own right — /ARS/opengraph-image renders the
  // club's share card — and testing it against a three-letter code 404s it.
  if (segment && !segment.includes("/") && !/^[A-Za-z]{3}$/.test(segment)) {
    // Rewritten to a two-segment path, which no route matches — so Next serves
    // app/not-found.tsx with a genuine 404 rather than a blank body.
    return NextResponse.rewrite(new URL("/_/not-a-club", req.url));
  }
  return NextResponse.next();
}

export const config = {
  // An explicit list, not "anything with a dot in it": the served files are a
  // known, short set, and exempting every dotted path would hand /.env and
  // friends the same soft 200 this exists to remove.
  // `opengraph-image` is the site's share card — a real single-segment route,
  // and one that is not three letters, so without this it is rewritten to the
  // 404 and every link to the domain previews nothing. The club card at
  // /ARS/opengraph-image is nested and was never at risk. The old og.png that
  // used to be listed here has gone: both cards are rendered now.
  matcher: [
    "/((?!_next/|robots\\.txt|sitemap\\.xml|favicon\\.ico|opengraph-image|icon\\.svg|apple-icon\\.png).*)",
  ],
};
