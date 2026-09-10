// The share card. One per club, rendered on demand.
//
// Pasting a club link into a chat used to preview the same static og.png for
// all twenty. This renders that club's actual season instead — the position,
// which way it has moved, and the figures behind it — so the preview is the
// answer the app exists to give rather than a logo.
//
// It deliberately mirrors the Season screen's hero: same chalk, same rule for
// which chalk (green up, pink down, yellow level, blue no comparison), same
// oversized figure. Someone who taps through should recognise where they
// landed.
//
// Satori, which renders this, has no CSS variables and no cascade — every
// value here is literal, and every element that holds more than one child
// declares `display: flex`.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { COMPARE_MODE } from "@/lib/config";
import { ord, short } from "@/lib/format";
import { getTeamPage } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SITE;

const INK = "#14140F";
const CREAM = "#FBF4E4";
const PAGE = "#EDE4CE";
const PINK = "#FFB0D6";
const CHALK = { pink: PINK, yellow: "#F6D34A", green: "#A8BE6E", blue: "#A9C9F0" };

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

export default async function Image({ params }: { params: Promise<{ tla: string }> }) {
  const { tla: raw } = await params;
  const tla = raw.toUpperCase();

  // Read from disk, not `fetch(new URL(…, import.meta.url))`: that pattern
  // resolves to a root-relative "/_next/static/media/…" path here, which fetch
  // cannot parse. next.config.ts traces these files into the bundle.
  const font = (f: string) => readFile(path.join(process.cwd(), "assets/fonts", f));
  const [semibold, bold] = await Promise.all([
    font("Outfit-SemiBold.ttf"),
    font("Outfit-Bold.ttf"),
  ]);

  // A card is worth showing even when the season is not: a failed query or a
  // club that has not played yet still gets the brand and the club name rather
  // than a broken preview.
  const data = await getTeamPage(tla).catch(() => null);
  const s = data?.summary ?? null;
  const name = data?.team.short_name || data?.team.name || tla;

  const aligned = COMPARE_MODE === "same-matchweek";
  const prevPos = s ? (aligned ? s.prev_position_same_mw : s.prev_final_position) : null;
  const delta = s && prevPos != null ? prevPos - s.position : null;

  const fill =
    delta == null ? CHALK.blue : delta > 0 ? CHALK.green : delta < 0 ? CHALK.pink : CHALK.yellow;

  const places = (n: number) => `${n} ${n === 1 ? "place" : "places"}`;
  const movement =
    delta == null
      ? "no comparison"
      : delta > 0
        ? `${places(delta)} up`
        : delta < 0
          ? `${places(Math.abs(delta))} down`
          : "level";

  const prevLabel = data ? short(data.seasons.previous) : "";
  const points = s ? s.won * 3 + s.drawn : null;
  const gd = s ? s.goals_for - s.goals_against : null;
  const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

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

          {/* The season card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              marginTop: 30,
              background: fill,
              borderRadius: 34,
              padding: "30px 40px 28px",
              justifyContent: "space-between",
              // Satori does not clip by default, and at the old figure size the
              // bottom line spilled out of the card and over the figures below.
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
                {s ? "SEASON READ" : "PREMIER LEAGUE"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 26,
                  marginTop: 6,
                }}
              >
                <div style={{ fontSize: 116, fontWeight: 700, letterSpacing: -6, color: INK, lineHeight: 1 }}>
                  {s ? `${s.position}${ord(s.position)}` : name}
                </div>
                {s ? (
                  <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: -1.6, color: INK, paddingBottom: 12 }}>
                    {name}
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div style={{ fontSize: 27, color: "rgba(20,20,15,.7)" }}>
                {s ? "league position" : "no completed matches yet"}
              </div>
              {s ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ fontSize: 30, fontWeight: 600, color: INK }}>{movement}</div>
                  {/* One string, not `on {prevLabel}` — satori counts those as
                      two child nodes and requires an explicit display on the
                      parent. */}
                  <div style={{ fontSize: 21, color: "rgba(20,20,15,.55)", marginTop: 2 }}>
                    {`on ${prevLabel}`}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* The figures behind it */}
          {s ? (
            <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
              {[
                ["points", String(points)],
                ["goal difference", signed(gd as number)],
                ["matchweek", String(s.matchweek)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(20,20,15,.06)",
                    borderRadius: 20,
                    padding: "16px 24px",
                  }}
                >
                  <div style={{ fontSize: 23, color: "rgba(20,20,15,.7)" }}>{label}</div>
                  <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1, color: INK }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
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
