/**
 * The two-line lockup: red badge, then the name stacked beside it.
 *
 * The badge is drawn rather than using assets/logo-badge-512px.png — BRAND.md
 * offers the vector route, and it's the better one here: the PNG's edges are
 * feathered (the corner pixel is only ~48% opaque), so a flat square rendered
 * from it looks soft. Inline SVG stays crisp at any size and matches the
 * tab-bar glyph's stroke style.
 *
 * The wordmark is live text, not the flat render, so it stays sharp and can
 * invert on the ink nav. Both lines are separate elements so the leading is
 * controllable, per the brand notes.
 */
export default function LogoLockup({
  size = 44,
  inverted = false,
}: {
  /** Badge height in px; the wordmark matches it. Below 40px use the badge alone. */
  size?: number;
  /** On the ink nav the wordmark inverts; the badge never changes. */
  inverted?: boolean;
}) {
  const badgeOnly = size < 40;

  const badge = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ flex: "none", display: "block" }}
      role="img"
      aria-label="Better than the last one"
    >
      <rect width="24" height="24" fill="#DA291C" />
      <polyline
        points="4.5 16.5 9.5 11.5 13 15 18.5 8.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="14.5 8.5 18.5 8.5 18.5 12.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (badgeOnly) return badge;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.45 }}>
      {badge}
      <div
        aria-hidden
        style={{
          // Two lines at 0.92 leading add up to the badge height.
          fontSize: size / 1.84,
          fontWeight: 800,
          lineHeight: 0.92,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: inverted ? "#F6F3EE" : "#191613",
          textAlign: "left",
        }}
      >
        <div>Better than</div>
        <div>The last one</div>
      </div>
    </div>
  );
}
