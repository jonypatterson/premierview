"use client";

import Header from "./Header";
import PositionChart from "./PositionChart";
import { short, textOn } from "@/lib/format";
import { seasonView } from "@/lib/view";
import type { CompareMode, PlayedTeamPage } from "@/lib/types";

type Props = {
  data: PlayedTeamPage;
  accent: string;
  mode: CompareMode;
  onOpenPicker: () => void;
};

export default function SeasonView({ data, accent, mode, onOpenPicker }: Props) {
  const vm = seasonView(data, mode, accent);
  const accentFg = textOn(accent);
  const seasonLabel = `${short(data.seasons.current)} vs ${short(data.seasons.previous)}`;

  return (
    <div className="screen screen-season">
      <div className="a-hdr">
        <Header
          tla={data.team.tla}
          teamName={data.team.short_name || data.team.name}
          subtitle="Premier League"
          seasonLabel={seasonLabel}
          accent={accent}
          accentFg={accentFg}
          onOpenPicker={onOpenPicker}
        />
      </div>

      <div className="a-pos">
        <div
          className="eyebrow"
          style={{ animation: "rise .35s cubic-bezier(.2,.7,.3,1) .09s both", marginBottom: 6 }}
        >
          League position · MW {vm.matchweek}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div
            className="num fig-position"
            style={{ animation: "bigin .49s cubic-bezier(.2,.8,.25,1) .12s both" }}
          >
            {vm.position}
            <span className="fig-suffix">{vm.positionSuffix}</span>
          </div>
          <div
            className="num pill-delta"
            style={{
              animation: "pop .35s cubic-bezier(.3,1.4,.4,1) .25s both",
              display: "flex",
              alignItems: "center",
              gap: 5,
              borderRadius: 99,
              padding: "5px 10px",
              background: vm.deltaBg,
              color: vm.deltaFg,
            }}
          >
            {vm.deltaLabel}
          </div>
        </div>
        <div className="sub-note" style={{ animation: "rise .35s ease-out .29s both", marginTop: 8 }}>
          {vm.comparisonNote}
        </div>
      </div>

      <div className="a-form" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="eyebrow" style={{ animation: "rise .35s ease-out .3s both" }}>Form this season</div>
        <div style={{ display: "flex", gap: 10 }}>
          {vm.form.map((d, i) => (
            <div
              key={i}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 15,
                animation: `pop .315s cubic-bezier(.3,1.5,.45,1) ${d.delay.toFixed(2)}s both`,
                background: d.bg,
                color: d.fg,
                border: d.border,
                boxSizing: "border-box",
              }}
            >
              {d.letter}
            </div>
          ))}
        </div>
      </div>

      <div className="a-rec" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {vm.record.map((s) => (
          <div
            key={s.label}
            className="card"
            style={{ animation: `rise .385s cubic-bezier(.2,.7,.3,1) ${s.delay.toFixed(2)}s both` }}
          >
            <div className="card-label">{s.label}</div>
            <div className="num fig-stat" style={{ marginTop: 4 }}>
              {s.value}
            </div>
            <div className="prev-note" style={{ marginTop: 2 }}>{s.prev}</div>
          </div>
        ))}
      </div>

      <div className="a-goals" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {vm.goals.map((g) => (
          <div
            key={g.label}
            className="card"
            style={{ animation: `rise .385s cubic-bezier(.2,.7,.3,1) ${g.delay.toFixed(2)}s both` }}
          >
            <div className="card-label">{g.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span className="num fig-stat">{g.total}</span>
              <span className="sub-note">{g.perGame}</span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: "#EFEBE3",
                marginTop: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 3,
                  transformOrigin: "left",
                  animation: "grow .56s cubic-bezier(.2,.8,.25,1) .62s both",
                  width: g.pct,
                  background: g.color,
                }}
              />
            </div>
            <div className="prev-note" style={{ marginTop: 6 }}>{g.prev}</div>
          </div>
        ))}
      </div>

      <PositionChart
        chart={vm.chart}
        accent={accent}
        thisSeason={short(data.seasons.current)}
        lastSeason={short(data.seasons.previous)}
      />
    </div>
  );
}
