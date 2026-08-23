// app/[tla]/page.tsx — the whole app is one route.
//
// revalidate 60 means Vercel serves a cached HTML page for a minute at a time,
// so the common case never touches Postgres. The hourly sync is what makes the
// page current; this cache is what makes it instant.

import { getTeamPage, getTeams } from "@/lib/queries";
import { notFound } from "next/navigation";
import SeasonComparison from "@/components/SeasonComparison";

export const revalidate = 60;

export async function generateStaticParams() {
  const teams = await getTeams();
  return teams.map((t) => ({ tla: t.tla }));
}

export default async function Page({ params }: { params: { tla: string } }) {
  const data = await getTeamPage(params.tla.toUpperCase());
  if (!data) notFound();

  // Data arrives with the HTML — the component's loading state only ever shows
  // on client-side team switches, never on first paint.
  return <SeasonComparison initialData={data} />;
}
