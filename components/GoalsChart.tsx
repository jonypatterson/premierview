"use client";

import type { GoalsChartVM } from "@/lib/view";

/**
 * Goals by matchweek, under the two player lists. Same visual grammar as the
 * position chart — dashed grey for last season, club colour for this one —
 * but here up is good, and the bottom gridline is zero.
 */
export default function GoalsChart({ vm }: { vm: GoalsChartVM }) {
  return (
    <div className="chart-block a-gchart">
      <div
        style={{
          animation: "rise .35s ease-out .95s both",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div className="eyebrow">
          Goals by matchweek
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 10.5, color: "#8b857c" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ background: vm.accent, width: 14, height: 3, borderRadius: 2 }} />
            {vm.thisSeason}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 0, borderTop: "2px dashed #B9B2A6" }} />
            {vm.lastSeason}
          </span>
        </div>
      </div>

      <div style={{ animation: "rise .42s ease-out 1s both", display: "flex" }}
        className="chart-row"
      >
        <div className="chart-ylabels">
          {vm.labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>

        <div className="chart-plot">
          <svg
            className="chart-svg"
            viewBox="0 0 320 160"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Goals scored by matchweek, ${vm.thisSeason} against ${vm.lastSeason}`}
          >
            {vm.gridY.map((y) => (
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
              stroke="#B9B2A6"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ opacity: 0, animation: "rise .56s ease-out 1s both" }}
              points={vm.lastLine}
            />
            <polyline
              fill="none"
              stroke={vm.accent}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ opacity: 0, animation: "rise .49s ease-out 1.1s both" }}
              points={vm.thisLine}
            />
          </svg>

          {vm.hasMarker ? (
            <>
              <div
                className="chart-marker"
                style={{
                  left: vm.markerLeft,
                  top: vm.markerTop,
                  background: vm.accent,
                  animation: "pop .315s cubic-bezier(.3,1.5,.45,1) 1.3s both",
                }}
              />
              <div
                className="chart-halo"
                style={{
                  left: vm.markerLeft,
                  top: vm.markerTop,
                  background: vm.accent,
                  animation: "ping 1.12s ease-out 1.425s infinite",
                }}
              />
            </>
          ) : null}
        </div>
      </div>

      <div
        style={{
          animation: "rise .42s ease-out 1.025s both",
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
