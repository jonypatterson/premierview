"use client";

import { useEffect, useState } from "react";

type Props = {
  kind: "empty" | "error" | "no-matches";
  /** Club name, for the no-matches copy. */
  clubName?: string;
  message?: string | null;
  /** ISO timestamp from the sync log. */
  lastSync?: string | null;
  onRetry: () => void;
  onChooseClub: () => void;
};

const pill: React.CSSProperties = {
  border: 0,
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12.5,
  fontWeight: 700,
  borderRadius: 99,
  padding: "11px 22px",
};

export default function ProblemState({
  kind,
  clubName,
  message,
  lastSync,
  onRetry,
  onChooseClub,
}: Props) {
  // Formatted after mount: the server and the viewer are rarely in the same
  // timezone, and a mismatch here would be a hydration error.
  const [synced, setSynced] = useState<string | null>(null);
  useEffect(() => {
    if (!lastSync) return;
    const d = new Date(lastSync);
    if (!Number.isNaN(d.getTime())) {
      setSynced(d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    }
  }, [lastSync]);

  const title =
    kind === "no-matches"
      ? "No completed matches yet"
      : kind === "empty"
        ? "No data for this team yet"
        : "Couldn't load the season";

  const body =
    kind === "no-matches"
      ? `${clubName ?? "They"} haven't finished a match this season yet. Everything appears here after the first final whistle.`
      : kind === "empty"
        ? "The hourly sync hasn't written any standings for this team. It may be a newly promoted side."
        : (message ?? "The database didn't respond. Your data is cached, so this is usually brief.");

  return (
    <div
      className="col-narrow"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 16,
        padding: "120px 40px",
        minHeight: "70dvh",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          animation: "pop .5s cubic-bezier(.3,1.4,.4,1) both",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#EFEBE3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#b9b2a6",
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4.5" />
          <path d="M12 16.2h.01" />
        </svg>
      </div>

      <div style={{ animation: "rise .5s ease-out .1s both" }}>
        <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
        <div
          style={{
            fontSize: 13,
            color: "#8b857c",
            marginTop: 8,
            lineHeight: 1.5,
            maxWidth: 280,
            textWrap: "pretty",
          }}
        >
          {body}
        </div>
      </div>

      <div style={{ animation: "rise .5s ease-out .18s both", fontSize: 11, color: "#b9b2a6" }}>
        Last successful sync {synced ?? "unknown"}
      </div>

      {/* Two ways out — this screen is never a dead end. */}
      <div
        style={{
          animation: "rise .5s ease-out .24s both",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: 4,
        }}
      >
        <button type="button" onClick={onRetry} style={{ ...pill, color: "#fff", background: "#191613" }}>
          Try again
        </button>
        <button
          type="button"
          onClick={onChooseClub}
          style={{
            ...pill,
            color: "#191613",
            background: "transparent",
            border: "1px solid #d9d3c9",
          }}
        >
          Choose another club
        </button>
      </div>
    </div>
  );
}
