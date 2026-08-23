"use client";

import { useLayoutEffect, useRef, useState } from "react";
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
  const plot = useRef<HTMLDivElement>(null);
  const [len, setLen] = useState(0);

  // vector-effect="non-scaling-stroke" means the dash pattern is measured in
  // screen pixels, not viewBox units — and the box is stretched horizontally.
  // So the draw animation's length has to be measured at the rendered width,
  // and re-measured whenever that changes.
  useLayoutEffect(() => {
    const el = plot.current;
    if (!el) return;
    const pts = chart.thisLine
      .split(" ")
      .filter(Boolean)
      .map((p) => p.split(",").map(Number) as [number, number]);

    const measure = () => {
      const sx = el.clientWidth / 320;
      const sy = el.clientHeight / 160;
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        total += Math.hypot((pts[i][0] - pts[i - 1][0]) * sx, (pts[i][1] - pts[i - 1][1]) * sy);
      }
      setLen(Math.ceil(total) + 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [chart.thisLine]);

  return (
    <div className="chart-block a-chart">
      <div
        style={{
          animation: "rise .35s ease-out .7s both",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div className="eyebrow">
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

      <div style={{ animation: "rise .42s ease-out .75s both", display: "flex" }}
        className="chart-row"
      >
        <div className="chart-ylabels">
          <span>1</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>20</span>
        </div>

        <div className="chart-plot" ref={plot}>
          <svg
            className="chart-svg"
            viewBox="0 0 320 160"
            preserveAspectRatio="none"
            role="img"
            aria-label={`League position by matchweek, ${thisSeason} against ${lastSeason}`}
          >
            {GRID.map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="320"
                y2={y}
                stroke="#E7E2D9"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <polyline
              fill="none"
              stroke="#b9b2a6"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ opacity: 0, animation: "rise .56s ease-out .75s both" }}
              points={chart.lastLine}
            />
            <polyline
              fill="none"
              stroke={accent}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={
                len > 0
                  ? ({
                      animation: "draw .49s ease-out .9s both",
                      "--len": len,
                      strokeDasharray: len,
                    } as React.CSSProperties)
                  : { opacity: 0 }
              }
              points={chart.thisLine}
            />
          </svg>

          {/* Marker and halo are HTML: the svg stretches, and transform stays
              free for the pop and ping animations. */}
          <div
            className="chart-marker"
            style={{
              left: chart.markerLeft,
              top: chart.markerTop,
              background: accent,
              animation: "pop .315s cubic-bezier(.3,1.5,.45,1) 1.225s both",
            }}
          />
          <div
            className="chart-halo"
            style={{
              left: chart.markerLeft,
              top: chart.markerTop,
              background: accent,
              animation: "ping 1.12s ease-out 1.35s infinite",
            }}
          />
        </div>
      </div>

      <div
        style={{
          animation: "rise .42s ease-out .775s both",
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
