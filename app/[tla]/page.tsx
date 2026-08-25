// app/[tla]/page.tsx — one route per club.
//
// revalidate 60 means Vercel serves cached HTML for a minute at a time, so the
// common case never touches Postgres. The hourly sync is what makes the page
// current; this cache is what makes it instant. Data arrives with the HTML, so
// the skeleton only ever shows on client-side club switches.

import { notFound } from "next/navigation";
import Frame from "@/components/Frame";
import TeamApp from "@/components/TeamApp";
import { FALLBACK_CLUBS } from "@/lib/clubs";
import { OG_IMAGE, SITE, SITE_URL } from "@/lib/site";
import { getClubs, getLeagueTable, getTeamPage } from "@/lib/queries";
import type { LeagueTable, TeamPage } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const clubs = await getClubs();
    return clubs.map((c) => ({ tla: c.code }));
  } catch {
    return [];
  }
}

/**
 * A three-letter code is the only shape this route can ever serve. Without the
 * check it answers 200 to anything at the root — /robots.txt rendered as a club
 * called "ROBOTS.TXT" — which is both wrong and an invitation for a crawler to
 * index unlimited junk. The membership test stays with the data, not here: the
 * live club list moves with promotions, and a 404 for a real club is worse than
 * the "no data yet" screen.
 */
const isClubCode = (s: string) => /^[A-Z]{3}$/.test(s);

export async function generateMetadata({ params }: { params: Promise<{ tla: string }> }) {
  const { tla: raw } = await params;
  const tla = raw.toUpperCase();
  if (!isClubCode(tla)) return {};
  // The static list, not the database — metadata shouldn't cost a query, and
  // this only needs a display name.
  const club = FALLBACK_CLUBS.find((c) => c.code === tla);
  const name = club?.short_name || club?.name || tla;
  const title = `${name} this season vs last`;
  return {
    title,
    description: `How ${name} compare with the same point last season — position, form, goals and scorers.`,
    // Whichever host served the request, this names the real one.
    alternates: { canonical: `/${tla}` },
    openGraph: {
      // A route that sets `openGraph` replaces the layout's block outright, so
      // type/siteName/locale have to be repeated here — without siteName a
      // scraper labels the card with the hostname it was handed, which is how
      // the old name kept surfacing on shared club links.
      type: "website",
      siteName: SITE,
      locale: "en_GB",
      url: `${SITE_URL}/${tla}`,
      title,
      description: `${name} this season against last, matchweek by matchweek.`,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE }],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ tla: string }> }) {
  const { tla: raw } = await params;
  const tla = raw.toUpperCase();
  if (!isClubCode(tla)) notFound();

  // All three in parallel — the table is the same for every club, and ISR
  // means this costs one round of queries per minute per route, not per visit.
  let data: TeamPage | null = null;
  let error: string | null = null;
  const [clubs, page, table] = await Promise.all([
    getClubs().catch(() => []),
    getTeamPage(tla).then(
      (d) => ({ ok: true as const, d }),
      (e: unknown) => ({ ok: false as const, e }),
    ),
    getLeagueTable().catch((): LeagueTable | null => null),
  ]);
  if (page.ok) data = page.d;
  else error = page.e instanceof Error ? page.e.message : String(page.e);

  return (
    <Frame>
      <TeamApp tla={tla} data={data} error={error} clubs={clubs} table={table} />
    </Frame>
  );
}
