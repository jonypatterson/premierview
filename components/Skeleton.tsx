import type { CSSProperties } from "react";

/**
 * The season screen with its content not yet arrived.
 *
 * It mirrors SeasonView's markup — the same wrapper classes, the same grid
 * areas, the same radii and heights — so the desktop column rules apply to it
 * too and the real screen lands in place rather than jumping when it replaces
 * this. Every block is `--radius-*` from the system, so the shapes read as the
 * cards they are about to become.
 *
 * Data arrives with the HTML on a fresh page load, so this is only ever seen
 * on a client-side club switch.
 */

/** One shimmering placeholder. `r` takes a system radius token. */
function Block({
  w = "100%",
  h,
  r = "var(--radius-chip)",
  style,
}: {
  w?: number | string;
  h: number | string;
  r?: string;
  style?: CSSProperties;
}) {
  return <div className="sk" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export default function Skeleton() {
  return (
    <div className="mw-pad mw-screen" aria-busy="true" aria-label="Loading the season">
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <Block w={40} h={40} r="var(--radius-mark)" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Block w={132} h={15} r="4px" />
              <Block w={88} h={10} r="4px" />
            </div>
          </div>
          <Block w={104} h={38} r="var(--radius-full)" />
        </div>
      </div>

      <div className="mw-grid mw-season">
        <div className="a-shero">
          <Block h={230} r="var(--radius-hero)" />
        </div>

        <div className="a-insight">
          <Block h={150} r="var(--radius-card)" />
        </div>

        <div className="a-splits" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Block h={62} r="var(--radius-pill-sm)" />
          <Block h={62} r="var(--radius-pill-sm)" />
          <Block h={62} r="var(--radius-pill-sm)" />
        </div>

        <div className="a-form">
          <Block w={72} h={11} r="4px" />
          <div style={{ display: "flex", gap: 5, marginTop: 14 }}>
            <Block h={30} />
            <Block h={30} />
            <Block h={30} />
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
            <Block h={30} />
            <Block h={30} />
            <Block h={30} />
          </div>
          <Block w={220} h={11} r="4px" style={{ marginTop: 12 }} />
        </div>

        <div className="a-record" style={{ display: "flex", gap: 10 }}>
          <Block h={120} r="var(--radius-tile)" />
          <Block h={120} r="var(--radius-tile)" />
          <Block h={120} r="var(--radius-tile)" />
        </div>

        <div className="a-goals">
          <Block w={56} h={11} r="4px" />
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "var(--gap-row)", padding: "10px 0" }}
            >
              <Block w={46} h={46} r="var(--radius-tile-sm)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Block w={112} h={13} r="4px" />
                <Block h={13} r="var(--radius-full)" style={{ marginTop: 8 }} />
              </div>
              <div style={{ width: 54, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                <Block w={28} h={20} r="4px" />
                <Block w={40} h={9} r="4px" />
              </div>
            </div>
          ))}
          <Block w={240} h={11} r="4px" style={{ marginTop: 4 }} />
        </div>

        <div className="mw-span" style={{ marginTop: 6 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <Block w={168} h={11} r="4px" />
            <Block w={140} h={11} r="4px" />
          </div>
          <Block h="var(--chart-h, 160px)" r="var(--radius-tile)" />
        </div>
      </div>
    </div>
  );
}
