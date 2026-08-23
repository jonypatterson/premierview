import type { Club } from "./types";

/**
 * Used only when club_list() can't be reached, so the picker is never empty.
 * The live list is authoritative — promotions and relegations need no code
 * change there.
 */
export const FALLBACK_CLUBS: Club[] = [
  { code: "ARS", name: "Arsenal FC", short_name: "Arsenal", crest: null, colour: "#EF0107" },
  { code: "AVL", name: "Aston Villa FC", short_name: "Aston Villa", crest: null, colour: "#95BFE5" },
  { code: "BOU", name: "AFC Bournemouth", short_name: "Bournemouth", crest: null, colour: "#DA291C" },
  { code: "BRE", name: "Brentford FC", short_name: "Brentford", crest: null, colour: "#E30613" },
  { code: "BHA", name: "Brighton & Hove Albion FC", short_name: "Brighton Hove", crest: null, colour: "#0057B8" },
  { code: "CHE", name: "Chelsea FC", short_name: "Chelsea", crest: null, colour: "#034694" },
  { code: "COV", name: "Coventry City FC", short_name: "Coventry City", crest: null, colour: "#78D0F3" },
  { code: "CRY", name: "Crystal Palace FC", short_name: "Crystal Palace", crest: null, colour: "#1B458F" },
  { code: "EVE", name: "Everton FC", short_name: "Everton", crest: null, colour: "#003399" },
  { code: "FUL", name: "Fulham FC", short_name: "Fulham", crest: null, colour: "#CC0000" },
  { code: "HUL", name: "Hull City AFC", short_name: "Hull City", crest: null, colour: "#F5971D" },
  { code: "IPS", name: "Ipswich Town FC", short_name: "Ipswich Town", crest: null, colour: "#005EA5" },
  { code: "LEE", name: "Leeds United FC", short_name: "Leeds United", crest: null, colour: "#FFCD00" },
  { code: "LIV", name: "Liverpool FC", short_name: "Liverpool", crest: null, colour: "#C8102E" },
  { code: "MCI", name: "Manchester City FC", short_name: "Man City", crest: null, colour: "#6CABDD" },
  { code: "MUN", name: "Manchester United FC", short_name: "Man United", crest: null, colour: "#DA291C" },
  { code: "NEW", name: "Newcastle United FC", short_name: "Newcastle", crest: null, colour: "#241F20" },
  { code: "NOT", name: "Nottingham Forest FC", short_name: "Nottingham", crest: null, colour: "#DD0000" },
  { code: "SUN", name: "Sunderland AFC", short_name: "Sunderland", crest: null, colour: "#EB172B" },
  { code: "TOT", name: "Tottenham Hotspur FC", short_name: "Tottenham", crest: null, colour: "#132257" },
];
