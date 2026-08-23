import type { Metadata, Viewport } from "next";
import { Roboto, Rubik } from "next/font/google";
import "./globals.css";

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
  title: "PremierView — season comparison",
  description: "Your club's Premier League season so far, against the same point last season.",
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
