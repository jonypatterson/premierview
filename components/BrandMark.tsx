/**
 * The mark: two bars — last season short and quiet, this season tall and
 * accent. The comparison every screen in the app makes, reduced to two
 * rectangles.
 *
 * Geometry is fixed and never varies between grounds; only the fills change.
 * The corner radius lives on the ground rect in viewBox units (11/48), so it
 * scales with the mark instead of needing a wrapper with `overflow:hidden` —
 * that ratio reproduces the design sheet's own 4/7/11/15/30px at 16/32/48/64/
 * 132px.
 *
 * Vector at every size: the design sheet is explicit that there is no raster
 * master. The one exception is `app/apple-icon.png`, which iOS requires as a
 * bitmap; `scripts/build-icons.mjs` renders it from this same geometry.
 */

export type Ground = "ink" | "pink" | "quiet" | "cream";

type GroundSpec = {
  bg: string;
  /** Last season — the short left bar. */
  past: string;
  pastOpacity: number;
  /** This season — the tall right bar, always the accent. */
  now: string;
};

const GROUNDS: Record<Ground, GroundSpec> = {
  // The app icon and favicon. Holds against light and dark browser chrome.
  ink: { bg: "#14140F", past: "#FBF4E4", pastOpacity: 0.5, now: "#FFB0D6" },
  // Splash, store listing — anywhere the mark can be loud.
  pink: { bg: "#FFB0D6", past: "#14140F", pastOpacity: 0.32, now: "#14140F" },
  // In-app, beside the club tile. Ink at 7%, so it composites on whatever's behind.
  quiet: { bg: "rgba(20,20,15,.07)", past: "#14140F", pastOpacity: 0.32, now: "#FFB0D6" },
  // The lockup's mark when it sits on the ink surface — cream ground, accent bar.
  cream: { bg: "#FBF4E4", past: "#14140F", pastOpacity: 0.32, now: "#FFB0D6" },
};

export default function BrandMark({
  size = 48,
  ground = "ink",
  title = "Better Than The Last One",
}: {
  /** Rendered edge length in px. The mark is always square. */
  size?: number;
  ground?: Ground;
  /** Pass null where the mark sits beside the name and would repeat it. */
  title?: string | null;
}) {
  const g = GROUNDS[ground];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{ flex: "none", display: "block" }}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      <rect width="48" height="48" rx="11" fill={g.bg} />
      <rect x="10" y="24" width="11" height="15" rx="3" fill={g.past} fillOpacity={g.pastOpacity} />
      <rect x="27" y="9" width="11" height="30" rx="3" fill={g.now} />
    </svg>
  );
}
