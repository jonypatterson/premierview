// Club colours, snapped onto the system's chalk palette.
//
// The design system allows no colour outside its own five chalks, so a club's
// real kit hex is not used directly — it selects the nearest chalk instead.
// That is why Arsenal reads pink rather than red: the mark identifies the club,
// it does not reproduce the badge.

/** The chalks a club mark may take. Cream is the no-hue fallback. */
const PALETTE = ["#FFB0D6", "#F6D34A", "#A8BE6E", "#A9C9F0", "#9FD3E8", "#FBF4E4"] as const;

/** Below this saturation a kit has no usable hue — black, white, grey. */
const ACHROMATIC = 0.18;
const CREAM = "#FBF4E4";

function hue(hex: string): { h: number; s: number } {
  const clean = (hex || "#000").replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => (parseInt(clean.slice(i, i + 2), 16) || 0) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const c = max - min;
  if (c === 0) return { h: 0, s: 0 };
  const h = max === r ? ((g - b) / c + 6) % 6 : max === g ? (b - r) / c + 2 : (r - g) / c + 4;
  return { h: h * 60, s: c / max };
}

const PALETTE_HUE = PALETTE.map((hex) => ({ hex, ...hue(hex) }));

/**
 * Nearest chalk by hue angle, not by RGB distance — a navy kit has to land on
 * the blue chalk, not on whichever pastel happens to sit closest in raw RGB.
 */
export function snap(hex: string | null | undefined): string {
  const { h, s } = hue(hex ?? "");
  if (s < ACHROMATIC) return CREAM;
  let best: string = PALETTE[0];
  let nearest = Infinity;
  for (const p of PALETTE_HUE) {
    if (p.s < ACHROMATIC) continue;
    const gap = Math.min(Math.abs(p.h - h), 360 - Math.abs(p.h - h));
    if (gap < nearest) {
      nearest = gap;
      best = p.hex;
    }
  }
  return best;
}

/**
 * Every chalk is light, so initials on a club mark are always ink. This exists
 * as a named export so the rule is stated once rather than inlined per call.
 */
export const MARK_INK = "var(--ink-900)";

/** Chalk accents, rotated in order. Colour identifies a metric, never a value. */
export const ACCENT = [
  "var(--accent-1)",
  "var(--accent-2)",
  "var(--accent-3)",
  "var(--accent-4)",
] as const;

export const UP = "var(--delta-up)";
export const DOWN = "var(--delta-down)";
export const FLAT = "var(--delta-flat)";
