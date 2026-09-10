// The landing route. A returning visitor is sent straight to their saved club;
// a first-time one gets the picker.

import Frame from "@/components/Frame";
import Landing from "@/components/Landing";
import { getClubs } from "@/lib/queries";

// Per request, for the same reason as the club route: a cached landing page
// hands a returning visitor a club list from before the last round of fixtures.
export const dynamic = "force-dynamic";

export default async function Page() {
  // The picker opens on the lockup now rather than a season line, so this route
  // no longer needs a sample club page to read the season pair out of — one
  // fewer round trip before the first paint.
  const clubs = await getClubs().catch(() => []);

  return (
    <Frame>
      <Landing clubs={clubs} />
    </Frame>
  );
}
