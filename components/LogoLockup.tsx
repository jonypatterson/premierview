/**
 * The lockup: the mark, then the name stacked beside it in two lines.
 *
 * The wordmark is live text rather than a flat render, so it stays sharp and
 * can invert on the ink surface. The design sheet permits no substitute for
 * Outfit 600 at −2px tracking, stacked "Better Than" over "The Last One" —
 * tracking is expressed in em (−2px at 44px, −1.2px at 26px both work out to
 * ≈ −0.046em) so it holds at whatever size the caller asks for.
 *
 * Proportions come from the sheet's primary lockup — a 64px mark against 44px
 * text with a 28px gap — kept as ratios of `size`.
 */
import BrandMark from "./BrandMark";

/** Below this the wordmark is unreadable, so the mark stands alone. */
const MIN_LOCKUP = 40;

export default function LogoLockup({
  size = 64,
  inverted = false,
}: {
  /** Mark height in px; the wordmark scales with it. */
  size?: number;
  /** On the ink surface the wordmark inverts and the mark takes a cream ground. */
  inverted?: boolean;
}) {
  const mark = (
    <BrandMark
      size={size}
      ground={inverted ? "cream" : "ink"}
      // Below the threshold the mark is the whole lockup, so it carries the
      // name; otherwise the wordmark beside it already says it.
      title={size < MIN_LOCKUP ? undefined : null}
    />
  );

  if (size < MIN_LOCKUP) return mark;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.4375 }}>
      {mark}
      <div
        style={{
          fontFamily: "var(--font-outfit), system-ui, sans-serif",
          fontSize: size * 0.6875,
          fontWeight: 600,
          lineHeight: 1.02,
          letterSpacing: "-0.046em",
          color: inverted ? "#FBF4E4" : "#14140F",
          textAlign: "left",
        }}
      >
        {/* Separate elements, not a <br>, so the leading stays controllable. */}
        <div>Better Than</div>
        <div>The Last One</div>
      </div>
    </div>
  );
}
