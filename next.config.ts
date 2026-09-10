import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // Club crests come straight from football-data.org.
  images: { remotePatterns: [{ protocol: "https", hostname: "crests.football-data.org" }] },

  // The share card reads its font files off disk, and nothing imports them, so
  // tracing cannot see them on its own — without this they are missing from
  // the deployed bundle and the card 500s in production but not locally.
  outputFileTracingIncludes: {
    "/[tla]/opengraph-image": ["./assets/fonts/**"],
  },

  async redirects() {
    return [
      // The project's stable *.vercel.app aliases still carry the old name, and
      // a link preview shows the host it was given — so a shared alias link
      // reads "premierview.vercel.app" no matter what the page's tags say.
      // Sending them to the canonical host means the scraper follows the 308
      // and shows the real domain. The apex is already redirected by Vercel.
      //
      // Deliberately anchored: per-deployment URLs (premierview-<hash>-…) do
      // not match, so preview builds stay reachable for testing.
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "premierview(|-git-main)(|-jonypattersons-projects).vercel.app",
          },
        ],
        destination: "https://www.betterthanthelast.one/:path*",
        permanent: true,
      },
    ];
  },
};

export default config;
