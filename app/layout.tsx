import type { Metadata, Viewport } from "next";
import { DM_Mono, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { DESCRIPTION, SITE, SITE_URL } from "@/lib/site";

/**
 * Google Analytics 4, or nothing at all.
 *
 * A measurement ID is public by design — it identifies the property, it does
 * not grant access to it — so unlike the Supabase key this one is deliberately
 * NEXT_PUBLIC_: gtag runs in the browser and cannot read a server-only value.
 *
 * Unset, the tag is not rendered. That keeps local development and preview
 * deployments out of the numbers without a second property, and means the app
 * still builds and runs for anyone who clones it without a Google account.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Consent mode v2, denied on every storage type, permanently.
 *
 * Denied is not a placeholder waiting for a banner to grant it. It is the
 * setting: GA4 then measures without writing a cookie or reading one, which is
 * what makes this lawful in the UK and the EU with nothing for the reader to
 * dismiss. A cookie banner on a screen that is one card and four buttons costs
 * more than the data it would buy.
 *
 * What that buys and what it costs: page views and events are still collected
 * and still report, per club route. Anything that needs a returning visitor to
 * be recognised — unique users, retention, any session stitched across visits
 * — is modelled at best and should not be quoted as fact.
 *
 * Flip this to "granted" ONLY behind a real consent banner, never on its own.
 * It is what turns the cookies on.
 */
const CONSENT = "denied";

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
    // No `images` here on purpose, in both directions. app/opengraph-image.tsx
    // supplies this one, and naming a URL here would override it; the club
    // routes set their own openGraph block, which replaces this one entirely,
    // and their own file-convention card fills it back in.
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
      {/* Both after the body and afterInteractive, so nothing here delays first
          paint. Club switches are router.push, and GA4's enhanced measurement
          counts a history change as a page view, so the per-club routes are
          counted without a manual send. The three tabs within a club are state
          rather than routes — those go through track() in lib/analytics.ts.

          Order is the point of writing this out rather than taking a component
          for it: gtag reads dataLayer in the order it was pushed, and a
          consent default only counts if it is pushed before the config that
          starts measuring. Both live in one block here so they cannot be
          separated by accident. */}
      {GA_ID ? (
        <>
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'${CONSENT}',ad_user_data:'${CONSENT}',ad_personalization:'${CONSENT}',analytics_storage:'${CONSENT}'});
gtag('js',new Date());
gtag('config','${GA_ID}');`}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
        </>
      ) : null}
    </html>
  );
}
