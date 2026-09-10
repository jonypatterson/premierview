import type { Metadata, Viewport } from "next";
import { DM_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { DESCRIPTION, OG_IMAGE, SITE, SITE_URL } from "@/lib/site";

// "Outfit for everything read, DM Mono for everything labelled." Rubik and
// Roboto are gone with the old palette — the system has one text family.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

// Eyebrows, metadata and units only. The system forbids it for body copy, so
// the two weights it actually sets are all that's loaded.
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
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
  // The desk the app sits on, so the browser chrome matches the page edge.
  themeColor: "#EDE4CE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
