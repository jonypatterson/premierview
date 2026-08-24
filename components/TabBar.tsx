"use client";

import { textOn } from "@/lib/format";

type Props = {
  tab: "season" | "players" | "table";
  accent: string;
  onSeason: () => void;
  onPlayers: () => void;
  onTable: () => void;
  onPicker: () => void;
};

const btn: React.CSSProperties = {
  border: 0,
  cursor: "pointer",
  width: 42,
  height: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 99,
  transition: "background .22s ease,color .22s ease",
};

/**
 * Floating pill: change club (neutral), Season, Players. Only the two pages
 * take the club colour, so the highlight still means "you are here".
 */
export default function TabBar({ tab, accent, onSeason, onPlayers, onTable, onPicker }: Props) {
  const on = (active: boolean) => ({
    background: active ? accent : "transparent",
    color: active ? textOn(accent) : "rgba(255,255,255,.62)",
  });

  return (
    <div
      // Fixed, not absolute: on a long page an absolute bar sits at the foot of
      // the content and you have to scroll to find it. The screens reserve
      // bottom padding so nothing hides behind it.
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 20,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 5,
          background: "#191613",
          borderRadius: 99,
          boxShadow: "0 8px 24px rgba(25,22,19,.28)",
          pointerEvents: "auto",
        }}
      >
        <button
          type="button"
          aria-label="Change club"
          className="tab-ghost"
          onClick={onPicker}
          style={{ ...btn, background: "transparent", color: "rgba(255,255,255,.62)" }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 5.5h16" />
            <path d="M4 12h16" />
            <path d="M4 18.5h16" />
            <circle cx="9" cy="5.5" r="2.2" fill="#191613" />
            <circle cx="15" cy="12" r="2.2" fill="#191613" />
            <circle cx="8" cy="18.5" r="2.2" fill="#191613" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Season"
          aria-current={tab === "season"}
          onClick={onSeason}
          style={{ ...btn, ...on(tab === "season") }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 17 9 11 13 15 21 7" />
            <polyline points="15 7 21 7 21 13" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Players"
          aria-current={tab === "players"}
          onClick={onPlayers}
          style={{ ...btn, ...on(tab === "players") }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="8" r="3.4" />
            <path d="M3.2 19.5c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2" />
            <path d="M16.4 5.2a3 3 0 0 1 0 5.8" />
            <path d="M18 14.6c2 .6 3.4 2.2 3.4 4.4" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="League table"
          aria-current={tab === "table"}
          onClick={onTable}
          style={{ ...btn, ...on(tab === "table") }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4.5" width="18" height="15" rx="2.4" />
            <path d="M3 9.5h18" />
            <path d="M3 14.5h18" />
            <path d="M9.5 9.5v10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
