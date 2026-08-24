"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { DEFAULT_ACCENT, STORAGE_KEY, textOn } from "@/lib/format";
import { FALLBACK_CLUBS } from "@/lib/clubs";
import LogoLockup from "./LogoLockup";
import type { Club } from "@/lib/types";

type Props = {
  clubs: Club[];
  seasonLabel: string;
  /** The saved club, if there is one — enables the "Keep …" escape. */
  current?: { tla: string; name: string } | null;
  onKeep?: () => void;
};

/** The mark: a league position, the move it represents, and what it's counting. */
function Lockup() {
  return (
    <div
      style={{
        animation: "rise .35s cubic-bezier(.2,.7,.3,1) .025s both",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 64, lineHeight: 1, letterSpacing: "-2.5px" }}>
          2nd
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: DEFAULT_ACCENT,
            color: textOn(DEFAULT_ACCENT),
            borderRadius: 99,
            padding: "5px 10px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ▲ 4
        </div>
      </div>
      <LogoLockup size={44} />
    </div>
  );
}

/**
 * First run and club switching. The choice is written to localStorage so every
 * later visit to / opens straight on that club's season.
 */
export default function ClubPicker({ clubs, seasonLabel, current, onKeep }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const list = clubs.length ? clubs : FALLBACK_CLUBS;

  const pick = (code: string) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* private mode — the route still works, it just won't be remembered */
    }
    startTransition(() => router.push(`/${code}`));
  };

  return (
    <div
      className="col-narrow"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 36,
        padding: "56px 24px 40px",
        boxSizing: "border-box",
      }}
    >
      <Lockup />

      <div style={{ animation: "rise .35s cubic-bezier(.2,.7,.3,1) .06s both", textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "#8b857c",
          }}
        >
          Premier League{seasonLabel ? ` · ${seasonLabel}` : ""}
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 34,
            lineHeight: 1.05,
            letterSpacing: "-1px",
            marginTop: 10,
            textWrap: "pretty",
          }}
        >
          Pick your club
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#8b857c",
            marginTop: 8,
            lineHeight: 1.5,
            maxWidth: 300,
            margin: "8px auto 0",
            textWrap: "pretty",
          }}
        >
          Every club&rsquo;s season set against the one before it: position, results, goals
          and scorers.
        </div>
      </div>

      <div className="picker-grid">
        {list.map((c, i) => {
          const isCurrent = current?.tla === c.code;
          const colour = c.colour || "#191613";
          return (
            <button
              key={c.code}
              type="button"
              className={`club-tile${isCurrent ? " club-tile-current" : ""}`}
              onClick={() => pick(c.code)}
              aria-current={isCurrent}
              style={{ animation: `pop .315s cubic-bezier(.3,1.4,.4,1) ${(0.1 + i * 0.014).toFixed(3)}s both` }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: ".3px",
                  flex: "none",
                  color: textOn(colour),
                  background: colour,
                }}
              >
                {c.code}
              </div>
              <div className="club-tile-name">{c.short_name || c.name}</div>
            </button>
          );
        })}
      </div>

      {current && onKeep ? (
        <button
          type="button"
          onClick={onKeep}
          style={{
            alignSelf: "center",
            border: 0,
            background: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 12.5,
            fontWeight: 700,
            color: "#8b857c",
          }}
        >
          Keep {current.name}
        </button>
      ) : null}
    </div>
  );
}
