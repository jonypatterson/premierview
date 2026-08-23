"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { STORAGE_KEY, textOn } from "@/lib/format";
import type { Club } from "@/lib/types";

type Props = {
  clubs: Club[];
  seasonLabel: string;
  /** The saved club, if there is one — enables the "Keep …" escape. */
  current?: { tla: string; name: string } | null;
  onKeep?: () => void;
};

/**
 * First run and club switching. The choice is written to localStorage so every
 * later visit to / opens straight on that club's season.
 */
export default function ClubPicker({ clubs, seasonLabel, current, onKeep }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

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
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
        padding: "34px 24px",
        minHeight: 940,
        boxSizing: "border-box",
      }}
    >
      <div style={{ animation: "rise .5s cubic-bezier(.2,.7,.3,1) .05s both" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "#8b857c",
          }}
        >
          Premier League · {seasonLabel}
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
            maxWidth: 270,
            textWrap: "pretty",
          }}
        >
          We&rsquo;ll remember it and open straight to their season from now on.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {clubs.map((c, i) => {
          const isCurrent = current?.tla === c.code;
          const colour = c.colour || "#191613";
          return (
            <button
              key={c.code}
              type="button"
              className="club-row"
              onClick={() => pick(c.code)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "9px 12px",
                border: 0,
                borderRadius: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                animation: `rise .45s cubic-bezier(.2,.7,.3,1) ${(0.14 + i * 0.022).toFixed(3)}s both`,
                background: isCurrent ? "#fff" : "transparent",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 10.5,
                  letterSpacing: ".3px",
                  flex: "none",
                  color: textOn(colour),
                  background: colour,
                }}
              >
                {c.code}
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#191613",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.short_name || c.name}
              </div>
              <div style={{ fontSize: 11, color: "#b9b2a6", flex: "none" }}>
                {isCurrent ? "current" : ""}
              </div>
            </button>
          );
        })}
      </div>

      {current && onKeep ? (
        <button
          type="button"
          onClick={onKeep}
          style={{
            alignSelf: "flex-start",
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
