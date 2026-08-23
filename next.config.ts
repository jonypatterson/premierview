import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // Club crests come straight from football-data.org.
  images: { remotePatterns: [{ protocol: "https", hostname: "crests.football-data.org" }] },
};

export default config;
