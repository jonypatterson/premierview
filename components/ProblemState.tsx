"use client";

import { Button, Eyebrow } from "./ds";

type Props = {
  /** A club we know that hasn't played reads differently from a code we can't place. */
  kind: "error" | "no-matches" | "empty";
  clubName?: string;
  message?: string | null;
  lastSync: string;
  onRetry: () => void;
  onChooseClub: () => void;
};

export default function ProblemState({
  kind,
  clubName,
  message,
  lastSync,
  onRetry,
  onChooseClub,
}: Props) {
  const title =
    kind === "no-matches"
      ? "No completed matches yet"
      : kind === "empty"
        ? "No data for this club yet"
        : "The season did not load";

  const body =
    kind === "no-matches"
      ? `${clubName ?? "This club"} have not finished a match this season. Everything appears after the first final whistle.`
      : kind === "empty"
        ? "The hourly sync has not written any standings for this club yet."
        : (message ??
          "The database did not respond. The data is cached, so this is usually brief.");

  return (
    <div
      className="mw-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "56px 20px",
        gap: 18,
      }}
    >
      <div style={{ animation: "rise .34s ease both" }}>
        <Eyebrow>Nothing to compare</Eyebrow>
        <div
          style={{
            fontSize: "var(--size-title)",
            fontWeight: 600,
            letterSpacing: "var(--track-title)",
            lineHeight: 1.02,
            marginTop: 10,
            textWrap: "pretty",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "var(--size-lead)",
            fontWeight: 500,
            lineHeight: "var(--leading-lead)",
            color: "var(--text-muted)",
            marginTop: 12,
            maxWidth: 340,
            textWrap: "pretty",
          }}
        >
          {body}
        </div>
      </div>

      <Eyebrow tone="faint">Last sync {lastSync}</Eyebrow>

      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        <Button size="md" onClick={onRetry}>
          Try again
        </Button>
        <Button variant="quiet" size="md" onClick={onChooseClub}>
          Another club
        </Button>
      </div>
    </div>
  );
}
