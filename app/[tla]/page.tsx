// app/[tla]/page.tsx — one route per club.
//
// revalidate 60 means Vercel serves cached HTML for a minute at a time, so the
// common case never touches Postgres. The hourly sync is what makes the page
// current; this cache is what makes it instant. Data arrives with the HTML, so
// the skeleton only ever shows on client-side club switches.

import { notFound } from "next/navigation";
import Frame from "@/components/Frame";
import TeamApp from "@/components/TeamApp";
import { getClubs, getTeamPage } from "@/lib/queries";
import type { TeamPage } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const clubs = await getClubs();
    return clubs.map((c) => ({ tla: c.code }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ tla: string }> }) {
  const { tla } = await params;
  return { title: `${tla.toUpperCase()} — PremierView` };
}

export default async function Page({ params }: { params: Promise<{ tla: string }> }) {
  const { tla: raw } = await params;
  const tla = raw.toUpperCase();

  const clubs = await getClubs().catch(() => []);
  if (clubs.length && !clubs.some((c) => c.code === tla)) notFound();

  let data: TeamPage | null = null;
  let error: string | null = null;
  try {
    data = await getTeamPage(tla);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <Frame>
      <TeamApp tla={tla} data={data} error={error} clubs={clubs} />
    </Frame>
  );
}
