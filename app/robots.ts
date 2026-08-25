import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Without this file /robots.txt fell through to the [tla] route and answered
 * 200 with a club page, so crawlers were never given any rules at all.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
