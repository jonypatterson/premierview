"use client";

import Header from "./Header";
import PositionChart from "./PositionChart";
import { short, textOn } from "@/lib/format";
import { seasonView } from "@/lib/view";
import type { CompareMode, PlayedTeamPage } from "@/lib/types";

const LABEL: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  color: "#8b857c",
};

const CARD_LABEL: React.CSSProperties = {
  fontSize: 10.5,
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: "#8b857c",
};

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
          style={{
            ...LABEL,
            animation: "rise .5s cubic-bezier(.2,.7,.3,1) .18s both",
            marginBottom: 6,
          }}
        >
          League position · MW {vm.matchweek}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div
            className="num"
            style={{
              animation: "bigin .7s cubic-bezier(.2,.8,.25,1) .24s both",
              fontSize: 76,
              lineHeight: 0.9,
              letterSpacing: "-2px",
            }}
          >
            {vm.position}
            <span style={{ fontSize: 26, letterSpacing: 0 }}>{vm.positionSuffix}</span>
          </div>
          <div
            className="num"
            style={{
              animation: "pop .5s cubic-bezier(.3,1.4,.4,1) .5s both",
              display: "flex",
              alignItems: "center",
              gap: 5,
              borderRadius: 99,
              padding: "5px 10px",
              fontSize: 12,
              background: vm.deltaBg,
              color: vm.deltaFg,
            }}
          >
            {vm.deltaLabel}
          </div>
        </div>
        <div
          style={{
            animation: "rise .5s ease-out .58s both",
            fontSize: 12,
            color: "#8b857c",
            marginTop: 8,
          }}
        >
          {vm.comparisonNote}
        </div>
      </div>

      <div className="a-form" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ ...LABEL, animation: "rise .5s ease-out .6s both" }}>Form this season</div>
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
                animation: `pop .45s cubic-bezier(.3,1.5,.45,1) ${d.delay.toFixed(2)}s both`,
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
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "14px 14px 12px",
              animation: `rise .55s cubic-bezier(.2,.7,.3,1) ${s.delay.toFixed(2)}s both`,
            }}
          >
            <div style={CARD_LABEL}>{s.label}</div>
            <div className="num" style={{ fontSize: 30, marginTop: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "#8b857c", marginTop: 2 }}>{s.prev}</div>
          </div>
        ))}
      </div>

      <div className="a-goals" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {vm.goals.map((g) => (
          <div
            key={g.label}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 14,
              animation: `rise .55s cubic-bezier(.2,.7,.3,1) ${g.delay.toFixed(2)}s both`,
            }}
          >
            <div style={CARD_LABEL}>{g.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span className="num" style={{ fontSize: 30 }}>
                {g.total}
              </span>
              <span style={{ fontSize: 12, color: "#8b857c" }}>{g.perGame}</span>
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
                  animation: "grow .8s cubic-bezier(.2,.8,.25,1) 1.24s both",
                  width: g.pct,
                  background: g.color,
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: "#8b857c", marginTop: 6 }}>{g.prev}</div>
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
