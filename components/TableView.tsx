"use client";

import { short } from "@/lib/format";
import { leagueRows } from "@/lib/view";
import type { LeagueTable } from "@/lib/types";

const NUM: React.CSSProperties = { textAlign: "center", color: "#6f695f" };
const NUM_D: React.CSSProperties = { justifyContent: "center", color: "#6f695f" };

/**
 * League-wide standings. One flat card, and one grid shared by the header and
 * the rows so the columns line up without a <table>. Six cells are desktop-only
 * (see .tbl-d) so every column fits on a phone without sideways scrolling.
 */
export default function TableView({
  table,
  accent,
  accentFg,
  tla,
  myTla,
  onOpenPicker,
}: {
  table: LeagueTable;
  accent: string;
  accentFg: string;
  /** The club whose badge sits in the header — the way back to the picker. */
  tla: string;
  /** The saved club, highlighted in the standings. */
  myTla?: string;
  onOpenPicker: () => void;
}) {
  const rows = leagueRows(table, myTla);

  return (
    <div className="screen-table">
      <div
        style={{
          animation: "rise .35s cubic-bezier(.2,.7,.3,1) .025s both",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={onOpenPicker}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: 0,
            background: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "inherit",
            color: "inherit",
            textAlign: "left",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: accent,
              color: accentFg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: ".5px",
              flex: "none",
            }}
          >
            {tla}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>League table</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 11,
                color: "#8b857c",
                marginTop: 2,
              }}
            >
              {short(table.season)} · MW {table.matchweek}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flex: "none" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </button>

        {/* Movement is against last season's finish, and the pill says so. */}
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: ".4px",
            padding: "6px 10px",
            border: "1px solid #d9d3c9",
            borderRadius: 99,
            color: "#6f695f",
            flex: "none",
          }}
        >
          Move vs {short(table.prevSeason)}
        </div>
      </div>

      <div
        className="tbl-card"
        style={{ animation: "rise .35s cubic-bezier(.2,.7,.3,1) .06s both" }}
      >
        <div
          className="tbl-head"
          style={{
            fontSize: 9.5,
            letterSpacing: ".8px",
            textTransform: "uppercase",
            color: "#b9b2a6",
            fontWeight: 600,
            padding: "8px 0 9px",
            borderBottom: "1px solid #E7E2D9",
          }}
        >
          <div>#</div>
          <div />
          <div>Club</div>
          <div style={{ textAlign: "center" }}>P</div>
          <div className="tbl-d" style={{ justifyContent: "center" }}>W</div>
          <div className="tbl-d" style={{ justifyContent: "center" }}>D</div>
          <div className="tbl-d" style={{ justifyContent: "center" }}>L</div>
          <div className="tbl-d" style={{ justifyContent: "center" }}>GF</div>
          <div className="tbl-d" style={{ justifyContent: "center" }}>GA</div>
          <div style={{ textAlign: "center" }}>GD</div>
          <div style={{ textAlign: "center" }}>Pts</div>
          <div className="tbl-d" style={{ justifyContent: "flex-end" }}>Last 5</div>
        </div>

        {rows.map((r) => (
          <div
            key={r.code}
            className="tbl-row"
            style={{
              animation: `rise .4s cubic-bezier(.2,.7,.3,1) ${r.delay.toFixed(3)}s both`,
              padding: "7px 0",
              borderBottom: `1px solid ${r.rule}`,
              background: r.bg,
              fontSize: 12.5,
              fontWeight: r.weight,
            }}
          >
            {/* The rank is a locator, not a figure — so it stays quiet. */}
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#b9b2a6" }}>{r.pos}</div>
            <div
              title={r.moveTitle}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                lineHeight: 1,
                color: r.moveCol,
              }}
            >
              {r.moveGlyph}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  flex: "none",
                  borderRadius: "50%",
                  background: r.colour,
                  color: r.fg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 8.5,
                  letterSpacing: ".2px",
                }}
              >
                {r.code}
              </div>
              <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.name}
              </div>
            </div>
            <div style={NUM}>{r.played}</div>
            <div className="tbl-d" style={NUM_D}>{r.wins}</div>
            <div className="tbl-d" style={NUM_D}>{r.draws}</div>
            <div className="tbl-d" style={NUM_D}>{r.losses}</div>
            <div className="tbl-d" style={NUM_D}>{r.gf}</div>
            <div className="tbl-d" style={NUM_D}>{r.ga}</div>
            <div style={NUM}>{r.gdText}</div>
            <div style={{ textAlign: "center", fontWeight: 800 }}>{r.points}</div>
            <div className="tbl-d" style={{ justifyContent: "flex-end", gap: 3 }}>
              {r.last5.map((p, i) => (
                <div
                  key={i}
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: "50%",
                    flex: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8.5,
                    fontWeight: 800,
                    background: p.bg,
                    color: p.fg,
                    border: p.border,
                    boxSizing: "border-box",
                  }}
                >
                  {p.ch}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            paddingTop: 11,
            fontSize: 10,
            color: "#b9b2a6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: "var(--move-up)", fontSize: 8 }}>▲</span>Risen since last season
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: "var(--move-down)", fontSize: 8 }}>▼</span>Fallen
          </div>
          <div>— Promoted, no comparison</div>
        </div>
      </div>
    </div>
  );
}
