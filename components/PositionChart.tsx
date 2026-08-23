"use client";

import type { SeasonVM } from "@/lib/view";

type Props = {
  chart: SeasonVM["chart"];
  accent: string;
  thisSeason: string;
  lastSeason: string;
};

const GRID = [10, 39.5, 76.3, 113.2, 150];

/**
 * Position by matchweek — this season's solid line drawing itself over last
 * season's full dashed trajectory. Lower on the chart is a worse position.
 */
export default function PositionChart({ chart, accent, thisSeason, lastSeason }: Props) {
  return (
    <div>
      <div
        style={{
          animation: "rise .5s ease-out 1.4s both",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "#8b857c",
          }}
        >
          Position by matchweek
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 10.5, color: "#8b857c" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                background: accent,
                width: chart.legendW,
                height: chart.legendH,
                borderRadius: chart.legendR,
              }}
            />
            {thisSeason}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 0, borderTop: "2px dashed #b9b2a6" }} />
            {lastSeason}
          </span>
        </div>
      </div>

      <div style={{ animation: "rise .6s ease-out 1.5s both", display: "flex", gap: 8 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: 160,
            fontSize: 9.5,
            color: "#b9b2a6",
            textAlign: "right",
            padding: "4px 0",
          }}
        >
          <span>1</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>20</span>
        </div>

        <svg
          viewBox="0 0 320 160"
          role="img"
          aria-label={`League position by matchweek, ${thisSeason} against ${lastSeason}`}
          style={{ flex: 1, height: 160, overflow: "visible" }}
        >
          {GRID.map((y) => (
            <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#E7E2D9" strokeWidth="1" />
          ))}

          <polyline
            fill="none"
            stroke="#b9b2a6"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinejoin="round"
            style={{ opacity: 0, animation: "rise .8s ease-out 1.5s both" }}
            points={chart.lastLine}
          />
          <polyline
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              {
                animation: "draw .7s ease-out 1.8s both",
                "--len": chart.thisLineLen,
                strokeDasharray: chart.thisLineLen,
              } as React.CSSProperties
            }
            points={chart.thisLine}
          />
          <circle
            r="4.5"
            fill={accent}
            cx={chart.markerX}
            cy={chart.markerY}
            style={{
              animation: "pop .45s cubic-bezier(.3,1.5,.45,1) 2.45s both",
              transformOrigin: `${chart.markerX}px ${chart.markerY}px`,
            }}
          />
          <circle
            r="8"
            fill={accent}
            opacity="0.2"
            cx={chart.markerX}
            cy={chart.markerY}
            style={{
              animation: "ping 1.6s ease-out 2.7s infinite",
              transformOrigin: `${chart.markerX}px ${chart.markerY}px`,
            }}
          />
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 9.5,
          color: "#b9b2a6",
          marginTop: 6,
          paddingLeft: 20,
        }}
      >
        <span>MW 1</span>
        <span>MW 10</span>
        <span>MW 19</span>
        <span>MW 29</span>
        <span>MW 38</span>
      </div>
    </div>
  );
}
