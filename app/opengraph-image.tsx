// The site's share card — the one a link to the domain itself previews.
//
// Its predecessor was a PNG in /public, drawn in the red-on-grey Rubik design
// the app no longer uses, and it went on being served for a month after
// everything else changed. A checked-in image cannot be wrong by a compiler, so
// it was the one surface with no way of noticing. This is rendered from the
// same tokens as the screens, by the same renderer as the club card next door,
// so the next time the palette moves it moves with it.
//
// A club link previews that club's real season — see [tla]/opengraph-image.
// This one has no club to speak for, so it says what the app is instead, and
// invents no figures to look busy.
//
// Satori, which renders this, has no CSS variables and no cascade — every
// value here is literal, and every element that holds more than one child
// declares `display: flex`.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SITE;

const INK = "#14140F";
const CREAM = "#FBF4E4";
const PAGE = "#EDE4CE";
const PINK = "#FFB0D6";

/** The mark, drawn with boxes — the same geometry as app/icon.svg, scaled. */
function Mark({ size: s }: { size: number }) {
  const u = s / 48;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 6 * u,
        width: s,
        height: s,
        paddingBottom: 9 * u,
        background: INK,
        borderRadius: 11 * u,
      }}
    >
      <div style={{ width: 11 * u, height: 15 * u, borderRadius: 3 * u, background: "#8B8A80" }} />
      <div style={{ width: 11 * u, height: 30 * u, borderRadius: 3 * u, background: PINK }} />
    </div>
  );
}

/** The three screens, on the three chalks that are not the hero's. */
const SECTIONS = [
  ["Position & form", "#F6D34A"],
  ["Goals", "#A8BE6E"],
  ["Scorers", "#A9C9F0"],
] as const;

export default async function Image() {
  // Read from disk, not `fetch(new URL(…, import.meta.url))`: that pattern
  // resolves to a root-relative "/_next/static/media/…" path here, which fetch
  // cannot parse. next.config.ts traces these files into the bundle — this
  // route needs its own entry there, or it 500s in production and nowhere else.
  const font = (f: string) => readFile(path.join(process.cwd(), "assets/fonts", f));
  const [semibold, bold] = await Promise.all([
    font("Outfit-SemiBold.ttf"),
    font("Outfit-Bold.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAGE,
          padding: 44,
          fontFamily: "Outfit",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: CREAM,
            borderRadius: 40,
            padding: 52,
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Mark size={54} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 30,
                fontWeight: 600,
                letterSpacing: -1.4,
                lineHeight: 1.02,
                color: INK,
              }}
            >
              <div>Better Than</div>
              <div>The Last One</div>
            </div>
          </div>

          {/* The proposition, on the hero chip the club card uses for a position */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              marginTop: 30,
              background: PINK,
              borderRadius: 34,
              padding: "30px 40px 28px",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 600,
                  letterSpacing: 2.4,
                  color: "rgba(20,20,15,.62)",
                }}
              >
                PREMIER LEAGUE
              </div>
              {/* 64, not the screens' 96: two lines of it plus the eyebrow and
                  the line beneath fill the chip exactly, and at anything larger
                  the strapline sat on this one's descenders. */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: 64,
                  fontWeight: 700,
                  letterSpacing: -3.2,
                  lineHeight: 1.02,
                  color: INK,
                  marginTop: 8,
                }}
              >
                <div>This season,</div>
                <div>against last.</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div style={{ fontSize: 27, color: "rgba(20,20,15,.7)" }}>
                Every club, at the same stage
              </div>
              <div style={{ fontSize: 21, color: "rgba(20,20,15,.55)" }}>
                betterthanthelast.one
              </div>
            </div>
          </div>

          {/* What is inside it */}
          <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
            {SECTIONS.map(([label, chalk]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  background: chalk,
                  borderRadius: 20,
                  padding: "16px 24px",
                  fontSize: 27,
                  fontWeight: 600,
                  color: INK,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Outfit", data: semibold, weight: 600, style: "normal" },
        { name: "Outfit", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
