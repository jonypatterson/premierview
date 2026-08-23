import type { CompareMode } from "./types";

/**
 * "same-matchweek" compares against the same point last season — the fair
 * comparison, and what every "last season" figure on the page then means.
 * "final-table" compares against last season's finish instead. The whole page
 * (note, delta pill, stat cards) follows this one switch.
 */
export const COMPARE_MODE: CompareMode = "same-matchweek";
