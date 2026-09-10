/** 1 -> "st", 2 -> "nd", 11 -> "th" */
export function ord(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * "2026-27" -> "2026/27".
 *
 * The full form, not the "26/27" this used to return: the design system fixes
 * the house style as "Seasons are written 2025/26".
 */
export function short(season: string | null | undefined): string {
  return season ? season.replace("-", "/") : "";
}

/** "Bryan Mbeumo" -> "BM". Two letters at most. */
export function initials(name: string): string {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** "1 place" / "4 places" — the delta always carries its noun. */
export function places(n: number): string {
  return `${n} ${n === 1 ? "place" : "places"}`;
}

/** Always signed, so a gain reads as one: 5 -> "+5", -2 -> "-2". */
export function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

/**
 * The readable half of a thrown value.
 *
 * `String(e)` is not enough: supabase-js rejects with a PostgrestError, which
 * is a plain object rather than an Error, so it stringifies to "[object
 * Object]" — and that went straight onto the problem screen as the explanation.
 */
export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return String(e);
}
