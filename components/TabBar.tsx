"use client";

import type { ReactNode } from "react";

export type Tab = "season" | "players" | "table";

type Props = {
  tab: Tab;
  onSeason: () => void;
  onPlayers: () => void;
  onTable: () => void;
  onPicker: () => void;
};

/**
 * The one fixed element: a floating ink pill, 26px off the bottom. Everything
 * else scrolls under it, which is what the 132px of screen clearance is for.
 *
 * The system's readme describes a word-based bar, but the app artboard and the
 * screen it was signed off against both use icons. The artboard wins — it is
 * the design of this screen, not a general statement about the system.
 */
export default function TabBar({ tab, onSeason, onPlayers, onTable, onPicker }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 26,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        // Above the league table's sticky header (3) and its row list (1).
        // The screen and this bar are both positioned with z-index auto, which
        // creates no stacking context, so those values compete directly with
        // this one — without it the table painted over the bar and swallowed
        // every click on it.
        zIndex: 10,
      }}
    >
      <nav
        aria-label="Screens"
        style={{
          display: "flex",
          gap: 4,
          padding: 6,
          background: "var(--surface-inverse)",
          borderRadius: "var(--radius-full)",
          boxShadow: "var(--shadow-float)",
          pointerEvents: "auto",
        }}
      >
        <TabButton label="Season" on={tab === "season"} onClick={onSeason}>
          <polyline points="3 17 9 11 13 15 21 7" />
          <polyline points="15 7 21 7 21 13" />
        </TabButton>
        <TabButton label="Players" on={tab === "players"} onClick={onPlayers}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.4 19.4c0-3 2.5-5 5.6-5s5.6 2 5.6 5" />
          <path d="M16.6 5.4a2.9 2.9 0 0 1 0 5.6" />
          <path d="M18.1 14.7c1.9.6 3.3 2.1 3.3 4.2" />
        </TabButton>
        <TabButton label="League table" on={tab === "table"} onClick={onTable}>
          <rect x="3" y="4.5" width="18" height="15" rx="2.4" />
          <path d="M3 9.5h18" />
          <path d="M3 14.5h18" />
          <path d="M9.5 9.5v10" />
        </TabButton>
        {/* Not a screen, so it never takes the selected capsule or the rule. */}
        <TabButton label="Change club" on={false} onClick={onPicker}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
        </TabButton>
      </nav>
    </div>
  );
}

function TabButton({
  label,
  on,
  onClick,
  children,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={on ? "page" : undefined}
      onClick={onClick}
      style={{
        border: 0,
        padding: 0,
        cursor: "pointer",
        width: 48,
        height: 48,
        borderRadius: "var(--radius-full)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        transition: "var(--transition-state), color .2s ease",
        background: on ? "var(--cream-14)" : "transparent",
        // The selected glyph takes the same pink as its underscore, so the
        // colour and the rule say the same thing rather than only the capsule
        // carrying the state.
        color: on ? "var(--accent-1)" : "var(--text-on-inverse-muted)",
      }}
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
      <span
        style={{
          width: 14,
          height: 2,
          borderRadius: 2,
          background: on ? "var(--accent-1)" : "transparent",
        }}
      />
    </button>
  );
}
