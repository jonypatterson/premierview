import type { MetadataRoute } from "next";
import { FALLBACK_CLUBS } from "@/lib/clubs";
import { getClubs } from "@/lib/queries";
import { SITE_URL } from "@/lib/site";

// Rebuilt on the same cadence as the pages it lists.
export const revalidate = 60;

/**
 * The picker navigates with router.push rather than <a>, so a crawler that
 * lands on / finds no links to the twenty club pages. This is what tells it
 * they exist.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const clubs = await getClubs().catch(() => FALLBACK_CLUBS);
  const list = clubs.length ? clubs : FALLBACK_CLUBS;
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "daily", priority: 1 },
    ...list.map((c) => ({
      url: `${SITE_URL}/${c.code}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
