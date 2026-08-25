// The landing route. A returning visitor is sent straight to their saved club;
// a first-time one gets the picker.

import Frame from "@/components/Frame";
import Landing from "@/components/Landing";
import { getClubs, getTeamPage } from "@/lib/queries";
import { short } from "@/lib/format";

// Per request, for the same reason as the club route: a cached landing page
// hands a returning visitor a season label and club list from before the last
// round of fixtures.
export const dynamic = "force-dynamic";

export default async function Page() {
  const clubs = await getClubs().catch(() => []);

  // One club's page gives us the season pair for the picker's eyebrow line.
  let seasonLabel = "";
  if (clubs.length) {
    try {
      const sample = await getTeamPage(clubs[0].code);
      if (sample) seasonLabel = `${short(sample.seasons.current)} vs ${short(sample.seasons.previous)}`;
    } catch {
      /* the picker reads fine without it */
    }
  }

  return (
    <Frame>
      <Landing clubs={clubs} seasonLabel={seasonLabel} />
    </Frame>
  );
}
