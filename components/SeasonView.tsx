import {
  AppHeader,
  Button,
  Eyebrow,
  FormStrip,
  HeroStat,
  InsightCard,
  MetricRow,
  SplitRow,
  StatTile,
} from "./ds";
import SiteFooter from "./SiteFooter";
import type { SeasonVM } from "@/lib/view";

type Props = {
  vm: SeasonVM;
  tla: string;
  teamName: string;
  markColour: string;
  markInk: string;
  onOpenPicker: () => void;
};

/**
 * The overview. One column on a phone; on a desktop the grid areas in
 * globals.css re-flow it to two columns, then three, with the chart spanning
 * the foot on every one.
 */
export default function SeasonView({
  vm,
  tla,
  teamName,
  markColour,
  markInk,
  onOpenPicker,
}: Props) {
  return (
    <div className="mw-pad mw-screen">
      <div style={{ animation: "rise .34s ease both", marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <AppHeader
              initials={tla}
              title={teamName}
              meta={vm.headerMeta}
              markBackground={markColour}
              markColor={markInk}
            />
          </div>
          <Button size="sm" onClick={onOpenPicker}>
            Change club
          </Button>
        </div>
      </div>

      <div className="mw-grid mw-season">
        <div className="a-shero" style={{ animation: "rise .34s ease .04s both" }}>
          <HeroStat
            eyebrow="Season read"
            value={vm.heroValue}
            label="league position"
            delta={vm.deltaText}
            deltaCaption={vm.vsLabel}
            background={vm.heroFill}
          />
        </div>

        <div className="a-insight" style={{ animation: "rise .34s ease .08s both" }}>
          <InsightCard eyebrow="What moved" background="var(--accent-4)">
            {vm.insight}
          </InsightCard>
        </div>

        <div
          className="a-splits"
          style={{ display: "flex", flexDirection: "column", gap: 10, animation: "rise .34s ease .1s both" }}
        >
          {vm.splits.map((s) => (
            <SplitRow
              key={s.label}
              label={s.label}
              value={s.value}
              previous={s.previous}
              previousLabel={"previousLabel" in s ? s.previousLabel : undefined}
              background={s.fill}
            />
          ))}
        </div>

        <div className="a-form" style={{ animation: "rise .34s ease .12s both" }}>
          <Eyebrow>Results</Eyebrow>
          <div style={{ marginTop: 14 }}>
            <FormStrip results={vm.formNow} />
          </div>
          {/* A promoted club has no previous strip; the legend goes with it. */}
          {vm.hasPastForm ? (
            <>
              <div style={{ marginTop: 8 }}>
                <FormStrip results={vm.formPast} past />
              </div>
              <div style={{ marginTop: 12 }}>
                <Eyebrow tone="faint">{vm.formLegend}</Eyebrow>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 12 }}>
              <Eyebrow tone="faint">no {vm.lastSeasonShort} record in this division</Eyebrow>
            </div>
          )}
        </div>

        <div className="a-record" style={{ display: "flex", gap: 10, animation: "rise .34s ease .16s both" }}>
          {vm.record.map((r) => (
            <StatTile key={r.code} eyebrow={r.code} value={r.value} caption={r.caption} background={r.fill} />
          ))}
        </div>

        <div className="a-goals" style={{ animation: "rise .34s ease .2s both" }}>
          <Eyebrow>Goals</Eyebrow>
          {vm.goals.map((g) => (
            <MetricRow
              key={g.tag}
              tag={g.tag}
              name={g.label}
              value={g.total}
              previous={g.prevTotal}
              delta={g.delta}
              deltaColor={g.deltaCol}
              pctNow={g.pct}
              pctPrevious={g.prevPct}
              color={g.color}
            />
          ))}
          <Eyebrow tone="faint">{vm.markerLegend}</Eyebrow>
        </div>

        <div className="mw-span" style={{ animation: "rise .34s ease .24s both", marginTop: 6 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <Eyebrow>Position by matchweek</Eyebrow>
            <div
              style={{
                display: "flex",
                gap: 14,
                fontFamily: "var(--font-mono)",
                fontSize: "var(--size-mono-sm)",
                letterSpacing: "var(--track-mono-eyebrow)",
                color: "var(--text-faint)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    background: "var(--ink-900)",
                    width: 14,
                    height: 3,
                    borderRadius: "var(--radius-full)",
                  }}
                />
                {vm.thisSeasonShort}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 0, borderTop: "2px dashed var(--ink-35)" }} />
                {vm.lastSeasonShort}
              </span>
            </div>
          </div>

          {/* Takes the height the rows above leave, so the screen fits the
              card rather than the chart forcing it to scroll. */}
          <div className="mw-chartrow" style={{ display: "flex", gap: 9 }}>
            <div
              style={{
                position: "relative",
                height: "var(--chart-h, 160px)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--size-mono-sm)",
                color: "var(--text-faint)",
                textAlign: "right",
                minWidth: 14,
              }}
            >
              <span style={{ position: "absolute", right: 0, top: "6.25%", transform: "translateY(-50%)" }}>
                1
              </span>
              <span style={{ position: "absolute", right: 0, top: "47.7%", transform: "translateY(-50%)" }}>
                10
              </span>
              <span style={{ position: "absolute", right: 0, top: "93.75%", transform: "translateY(-50%)" }}>
                20
              </span>
            </div>
            <div
              style={{
                flex: 1,
                position: "relative",
                height: "var(--chart-h, 160px)",
                alignSelf: "flex-start",
              }}
            >
              {/* Stretched to fit, so every stroke opts out of scaling. */}
              <svg
                viewBox="0 0 320 160"
                preserveAspectRatio="none"
                style={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}
                role="img"
                aria-label={`League position by matchweek, ${vm.thisSeasonShort} against ${vm.lastSeasonShort}`}
              >
                {[10, 76.3, 150].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="320"
                    y2={y}
                    stroke="rgba(20,20,15,.08)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                <polyline
                  fill="none"
                  stroke="rgba(20,20,15,.35)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  points={vm.chart.lastLine}
                />
                <polyline
                  fill="none"
                  stroke="#14140F"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  points={vm.chart.thisLine}
                />
              </svg>
              {/* An HTML dot, not an SVG circle: the svg is stretched, and a
                  circle in it would come out as an ellipse. */}
              {vm.chart.hasMarker ? (
                <>
                  {/* The pulse halo, at the geometry and timing the design set:
                      18px, centred on the marker by negative margins, opening
                      once the entrance animations have finished. */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      width: 18,
                      height: 18,
                      borderRadius: "var(--radius-full)",
                      margin: "-9px 0 0 -9px",
                      background: "var(--ink-900)",
                      animation: "ping 1.6s ease-out 2.7s infinite",
                      left: vm.chart.markerLeft,
                      top: vm.chart.markerTop,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      width: 11,
                      height: 11,
                      borderRadius: "var(--radius-full)",
                      margin: "-5.5px 0 0 -5.5px",
                      background: "var(--ink-900)",
                      left: vm.chart.markerLeft,
                      top: vm.chart.markerTop,
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--size-mono-sm)",
              color: "var(--text-faint)",
              marginTop: 10,
              paddingLeft: 23,
            }}
          >
            <span>MW 1</span>
            <span>MW 19</span>
            <span>MW 38</span>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
