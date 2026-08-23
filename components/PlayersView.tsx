"use client";

import GoalsChart from "./GoalsChart";
import Header from "./Header";
import { short, textOn } from "@/lib/format";
import { goalsChart, playersView } from "@/lib/view";
import type { PlayedTeamPage } from "@/lib/types";

type Row = ReturnType<typeof playersView>["scorers"][number];

function RankedList({
  rows,
  barColor,
  empty,
  headingDelay,
  title,
  emptyNote,
  area,
}: {
  rows: Row[];
  barColor: string;
  empty: boolean;
  headingDelay: string;
  title: string;
  emptyNote: string;
  area: string;
}) {
  return (
    <div className={area} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          animation: `rise .35s ease-out ${headingDelay}s both`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div className="eyebrow">{title}</div>
        <div style={{ fontSize: 10.5, color: "#b9b2a6" }}>this season · last</div>
      </div>

      {rows.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            animation: `rise .35s cubic-bezier(.2,.7,.3,1) ${p.delay.toFixed(2)}s both`,
          }}
        >
          <div className="num fig-rank" style={{ width: 26, color: "#b9b2a6" }}>
            {p.rank}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 8,
              }}
            >
              <span
                className="player-name"
                style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {p.name}
              </span>
              <span className="num fig-player">{p.value}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background: "#EFEBE3",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: barColor,
                    borderRadius: 3,
                    transformOrigin: "left",
                    animation: `grow .49s cubic-bezier(.2,.8,.25,1) ${p.barDelay.toFixed(2)}s both`,
                    width: p.pct,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  color: "#8b857c",
                  whiteSpace: "nowrap",
                  width: 56,
                  textAlign: "right",
                }}
              >
                {p.prev}
              </span>
            </div>
          </div>
        </div>
      ))}

      {empty ? (
        <div style={{ fontSize: 12.5, color: "#8b857c", padding: "6px 0 2px" }}>{emptyNote}</div>
      ) : null}
    </div>
  );
}

export default function PlayersView({
  data,
  accent,
  onOpenPicker,
}: {
  data: PlayedTeamPage;
  accent: string;
  onOpenPicker: () => void;
}) {
  const vm = playersView(data, accent);
  const gvm = goalsChart(data, accent);
  const accentFg = textOn(accent);

  return (
    <div className="screen screen-players">
      <div className="a-hdr">
        <Header
          tla={data.team.tla}
          teamName={data.team.short_name || data.team.name}
          subtitle="Players"
          seasonLabel={`${short(data.seasons.current)} vs ${short(data.seasons.previous)}`}
          accent={accent}
          accentFg={accentFg}
          onOpenPicker={onOpenPicker}
        />
      </div>

      <div className="a-top">
        <div className="eyebrow" style={{ animation: "rise .35s ease-out .08s both", marginBottom: 6 }}>
          {vm.topScorerLabel}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <div
            className="fig-name"
            style={{ animation: "bigin .49s cubic-bezier(.2,.8,.25,1) .11s both", fontWeight: 800 }}
          >
            {vm.topScorerName}
          </div>
          <div
            style={{
              animation: "pop .35s cubic-bezier(.3,1.4,.4,1) .23s both",
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: accent,
              color: accentFg,
              borderRadius: 99,
              padding: "5px 10px",
              fontWeight: 700,
            }}
            className="pill-delta"
          >
            {vm.topScorerGoals}
          </div>
        </div>
        <div className="sub-note" style={{ animation: "rise .35s ease-out .27s both", marginTop: 8 }}>
          {vm.topScorerNote}
        </div>
      </div>

      <div className="a-sum" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {vm.summary.map((c) => (
          <div
            key={c.label}
            className="card"
            style={{ animation: `rise .385s cubic-bezier(.2,.7,.3,1) ${c.delay.toFixed(2)}s both` }}
          >
            <div className="card-label">{c.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span className="num fig-stat">{c.value}</span>
              <span className="sub-note">{c.unit}</span>
            </div>
            <div className="prev-note" style={{ marginTop: 6 }}>{c.prev}</div>
          </div>
        ))}
      </div>

      <RankedList
        title="Goalscorers"
        rows={vm.scorers}
        barColor={accent}
        empty={vm.noScorers}
        headingDelay="0.8"
        emptyNote="No goals yet this season. Last season’s scorers appear here once the first goes in."
        area="a-scorers"
      />

      <RankedList
        title="Assists"
        rows={vm.assisters}
        barColor="#191613"
        empty={vm.noAssisters}
        headingDelay="1.42"
        emptyNote="No assists recorded yet this season."
        area="a-assists"
      />

      {gvm ? <GoalsChart vm={gvm} /> : null}
    </div>
  );
}
