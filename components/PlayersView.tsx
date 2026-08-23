"use client";

import Header from "./Header";
import { short, textOn } from "@/lib/format";
import { playersView } from "@/lib/view";
import type { TeamPage } from "@/lib/types";

const LABEL: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  color: "#8b857c",
};

type Row = ReturnType<typeof playersView>["scorers"][number];

function RankedList({
  rows,
  barColor,
  empty,
  headingDelay,
  title,
  emptyNote,
}: {
  rows: Row[];
  barColor: string;
  empty: boolean;
  headingDelay: string;
  title: string;
  emptyNote: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          animation: `rise .5s ease-out ${headingDelay}s both`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div style={LABEL}>{title}</div>
        <div style={{ fontSize: 10.5, color: "#b9b2a6" }}>this season · last</div>
      </div>

      {rows.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            animation: `rise .5s cubic-bezier(.2,.7,.3,1) ${p.delay.toFixed(2)}s both`,
          }}
        >
          <div className="num" style={{ width: 26, fontSize: 11, color: "#b9b2a6" }}>
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
                style={{
                  fontWeight: 700,
                  fontSize: 13.5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.name}
              </span>
              <span className="num" style={{ fontSize: 15 }}>
                {p.value}
              </span>
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
                    animation: `grow .7s cubic-bezier(.2,.8,.25,1) ${p.barDelay.toFixed(2)}s both`,
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
  data: TeamPage;
  accent: string;
  onOpenPicker: () => void;
}) {
  const vm = playersView(data, accent);
  const accentFg = textOn(accent);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, padding: "28px 24px 96px" }}>
      <Header
        tla={data.team.tla}
        teamName={data.team.short_name || data.team.name}
        subtitle="Players"
        seasonLabel={`${short(data.seasons.current)} vs ${short(data.seasons.previous)}`}
        accent={accent}
        accentFg={accentFg}
        onOpenPicker={onOpenPicker}
      />

      <div>
        <div style={{ ...LABEL, animation: "rise .5s ease-out .16s both", marginBottom: 6 }}>
          {vm.topScorerLabel}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <div
            style={{
              animation: "bigin .7s cubic-bezier(.2,.8,.25,1) .22s both",
              fontWeight: 800,
              fontSize: 46,
              lineHeight: 1,
              letterSpacing: "-1.5px",
            }}
          >
            {vm.topScorerName}
          </div>
          <div
            style={{
              animation: "pop .5s cubic-bezier(.3,1.4,.4,1) .46s both",
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: accent,
              color: accentFg,
              borderRadius: 99,
              padding: "5px 10px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {vm.topScorerGoals}
          </div>
        </div>
        <div
          style={{
            animation: "rise .5s ease-out .54s both",
            fontSize: 12,
            color: "#8b857c",
            marginTop: 8,
          }}
        >
          {vm.topScorerNote}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {vm.summary.map((c) => (
          <div
            key={c.label}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 14,
              animation: `rise .55s cubic-bezier(.2,.7,.3,1) ${c.delay.toFixed(2)}s both`,
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#8b857c",
              }}
            >
              {c.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span className="num" style={{ fontSize: 30 }}>
                {c.value}
              </span>
              <span style={{ fontSize: 12, color: "#8b857c" }}>{c.unit}</span>
            </div>
            <div style={{ fontSize: 11, color: "#8b857c", marginTop: 6 }}>{c.prev}</div>
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
      />

      <RankedList
        title="Assists"
        rows={vm.assisters}
        barColor="#191613"
        empty={vm.noAssisters}
        headingDelay="1.42"
        emptyNote="No assists recorded yet this season."
      />
    </div>
  );
}
