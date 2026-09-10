"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Eyebrow } from "./ds";
import SiteFooter from "./SiteFooter";
import { short } from "@/lib/format";
import { leagueRows } from "@/lib/view";
import type { LeagueTable } from "@/lib/types";

type Props = {
  table: LeagueTable;
  myTla?: string;
  onOpenPicker: () => void;
};

/** Column widths are shared by the head and the rows, so they stay aligned. */
const NUM: React.CSSProperties = {
  width: 34,
  textAlign: "right",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--size-mono-lg)",
  color: "var(--text-meta)",
};

export default function TableView({ table, myTla, onOpenPicker }: Props) {
  const [filter, setFilter] = useState<"six" | "all">("all");
  const scroller = useRef<HTMLDivElement>(null);
  const centred = useRef(false);

  const all = leagueRows(table, myTla);
  const rows = filter === "six" ? all.slice(0, 6) : all;

  // Land on your own club: the row is parked in the middle of the visible area
  // rather than left for the reader to hunt down a list of twenty.
  useEffect(() => {
    if (centred.current) return;
    const el = scroller.current;
    const row = el?.querySelector<HTMLElement>('[data-me="1"]');
    if (!el || !row) return;
    el.scrollTop = Math.max(0, row.offsetTop - (el.clientHeight - row.offsetHeight) / 2);
    centred.current = true;
  }, [filter]);

  const options = [
    { label: "Top six", value: "six" as const },
    { label: "All 20", value: "all" as const },
  ];

  return (
    <div className="mw-pad mw-screen mw-tablepage" ref={scroller} style={{ padding: "0 20px 132px" }}>
      <div
        className="tb-frozen"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 3,
          background: "var(--surface-app)",
          paddingBottom: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div
              style={{
                fontSize: "var(--size-title)",
                fontWeight: 600,
                letterSpacing: "var(--track-title)",
                lineHeight: 1.02,
              }}
            >
              League table
            </div>
            <div style={{ marginTop: 6 }}>
              <Eyebrow>
                {short(table.season)} · matchweek {table.matchweek} · move vs {short(table.prevSeason)}
              </Eyebrow>
            </div>
          </div>
          <Button size="sm" onClick={onOpenPicker}>
            Change club
          </Button>
        </div>

        {/* Selected is a fill change, never an outline. */}
        <div style={{ margin: "16px 0", display: "flex", gap: 8 }}>
          {options.map((o) => {
            const on = o.value === filter;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  centred.current = false;
                  setFilter(o.value);
                }}
                style={{
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "var(--radius-full)",
                  padding: "10px 16px",
                  fontFamily: "var(--font-core)",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  background: on ? "var(--surface-inverse)" : "var(--surface-quiet)",
                  color: on ? "var(--text-on-inverse)" : "var(--text-body)",
                  transition: "var(--transition-state)",
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 8px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--size-mono-sm)",
            letterSpacing: "var(--track-mono-eyebrow)",
            color: "var(--text-faint)",
          }}
        >
          <span style={{ width: 24 }}>#</span>
          <span style={{ flex: 1, paddingLeft: 16 }}>Club</span>
          {["P", "W", "D", "L"].map((h) => (
            <span key={h} className="tb-d" style={{ width: 34, textAlign: "right" }}>
              {h}
            </span>
          ))}
          {["GF", "GA"].map((h) => (
            <span key={h} className="tb-d" style={{ width: 38, textAlign: "right" }}>
              {h}
            </span>
          ))}
          <span className="tb-d" style={{ width: 96, paddingLeft: 14 }}>
            Form
          </span>
          <span style={{ width: 34, textAlign: "right" }}>GD</span>
          <span style={{ width: 34, textAlign: "right" }}>Pts</span>
          <span style={{ width: 44, textAlign: "right" }}>Move</span>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {rows.map((r) => (
          <div
            key={r.code}
            data-me={r.me ? "1" : "0"}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "11px 8px",
              borderRadius: "var(--radius-row)",
              background: r.rowBg,
            }}
          >
            <span style={{ width: 24, fontSize: 13, fontWeight: 600, color: "var(--text-meta)" }}>
              {r.pos}
            </span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9 }}>
              <span
                style={{ width: 7, height: 22, borderRadius: 3, flex: "none", background: r.zone }}
              />
              <span
                style={{
                  fontSize: "var(--size-body-sm)",
                  color: "var(--text-body)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: r.me ? 600 : 400,
                }}
              >
                {r.name}
              </span>
            </span>
            <span className="tb-d" style={NUM}>{r.played}</span>
            <span className="tb-d" style={NUM}>{r.wins}</span>
            <span className="tb-d" style={NUM}>{r.draws}</span>
            <span className="tb-d" style={NUM}>{r.losses}</span>
            <span className="tb-d" style={{ ...NUM, width: 38 }}>{r.gf}</span>
            <span className="tb-d" style={{ ...NUM, width: 38 }}>{r.ga}</span>
            <span
              className="tb-d"
              style={{ width: 96, paddingLeft: 14, display: "flex", gap: 3 }}
              aria-label={`Last five: ${r.form.filter(Boolean).join(" ") || "none played"}`}
            >
              {r.form.map((f, i) => (
                <span
                  key={i}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    flex: "none",
                    // A blank slot is the empty track, not a result.
                    background: f
                      ? { W: "var(--result-win)", D: "var(--result-draw)", L: "var(--result-loss)" }[f]
                      : "var(--ink-08)",
                  }}
                />
              ))}
            </span>
            <span style={NUM}>{r.gdText}</span>
            <span
              style={{
                width: 34,
                textAlign: "right",
                fontSize: "var(--size-figure-xs)",
                fontWeight: 700,
                color: "var(--text-body)",
              }}
            >
              {r.points}
            </span>
            <span
              style={{
                width: 44,
                textAlign: "right",
                fontSize: "var(--size-mono-lg)",
                fontWeight: 600,
                color: r.moveCol,
              }}
            >
              {r.moveText}
            </span>
          </div>
        ))}
        <div style={{ padding: "14px 8px 0" }}>
          <Eyebrow tone="faint">▲ up on last season · ▼ down · — promoted</Eyebrow>
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}
