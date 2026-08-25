import type { Metadata, Viewport } from "next";
import { Roboto, Rubik } from "next/font/google";
import "./globals.css";
import { DESCRIPTION, OG_IMAGE, SITE, SITE_URL } from "@/lib/site";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
  display: "swap",
});

// Numbers only — bold, but not as heavy as Rubik 800.
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  // Makes the preview image's relative path absolute, which link previews need.
  metadataBase: new URL(SITE_URL),
  title: { default: SITE, template: `%s · ${SITE}` },
  description: DESCRIPTION,
  applicationName: SITE,
  // The site answers on several hosts (two of them still named for the old
  // project). This points every one of them at the canonical address.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE,
    title: SITE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_GB",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE }],
  },
  // Card type only: X and the rest fall back to the og: tags, so the per-club
  // title doesn't have to be repeated in two vocabularies.
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#EBE8E2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rubik.variable} ${roboto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
