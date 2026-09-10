// The landing route. A returning visitor is sent straight to their saved club;
// a first-time one gets the picker.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Frame from "@/components/Frame";
import Landing from "@/components/Landing";
import { CLUB_COOKIE, isClubCode } from "@/lib/club-memory";
import { getClubs } from "@/lib/queries";

// Per request, for the same reason as the club route: a cached landing page
// hands a returning visitor a club list from before the last round of fixtures.
export const dynamic = "force-dynamic";

export default async function Page() {
  // The redirect happens before any query. A returning visitor never waits for
  // the club list they are not going to see, never downloads the bundle to be
  // told where to go, and never sees the loading screen — the club arrives
  // with the request, so this is one server round trip instead of two.
  //
  // The code is checked for shape only, not membership. Membership is a data
  // question that moves with promotion, and testing it here would cost the
  // very query this exists to skip; an unknown code lands on the club route's
  // own "no data yet" screen, which is the better answer anyway.
  const saved = (await cookies()).get(CLUB_COOKIE)?.value?.toUpperCase();
  if (isClubCode(saved)) redirect(`/${saved}`);

  const clubs = await getClubs().catch(() => []);

  return (
    <Frame>
      <Landing clubs={clubs} />
    </Frame>
  );
}
