/** 1 -> "st", 2 -> "nd", 11 -> "th" */
export function ord(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/** Per-game rate, one decimal. Guards the opening-weekend divide-by-zero. */
export function per(total: number | null | undefined, games: number): string {
  return games ? ((total ?? 0) / games).toFixed(1) : "0.0";
}

/** "2026-27" -> "26/27" */
export function short(season: string | null | undefined): string {
  return season ? season.slice(2).replace("-", "/") : "";
}

/**
 * Readable text on a club colour. Light clubs — Leeds, Wolves, Hull, City,
 * Coventry, Villa — get near-black rather than white.
 */
export function textOn(hex: string | null | undefined): string {
  const h = (hex || "#000").replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0);
  return r * 0.299 + g * 0.587 + b * 0.114 > 165 ? "#191613" : "#fff";
}

export const DEFAULT_ACCENT = "#DA291C";
export const STORAGE_KEY = "plc.team";
