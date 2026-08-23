"use client";

type Props = {
  kind: "empty" | "error";
  message?: string | null;
  lastSync?: string | null;
  onRetry: () => void;
};

export default function ProblemState({ kind, message, lastSync, onRetry }: Props) {
  const title = kind === "empty" ? "No data for this team yet" : "Couldn't load the season";
  const body =
    kind === "empty"
      ? "The hourly sync hasn't written any standings for this team. It may be a newly promoted side."
      : (message ??
        "The database didn't respond. Your data is cached, so this is usually brief.");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 16,
        padding: "120px 40px",
        minHeight: 940,
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
            maxWidth: 250,
            textWrap: "pretty",
          }}
        >
          {body}
        </div>
      </div>

      <div style={{ animation: "rise .5s ease-out .18s both", fontSize: 11, color: "#b9b2a6" }}>
        Last successful sync {lastSync || "unknown"}
      </div>

      <button
        type="button"
        onClick={onRetry}
        style={{
          animation: "rise .5s ease-out .24s both",
          border: 0,
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 12.5,
          fontWeight: 700,
          color: "#fff",
          background: "#191613",
          borderRadius: 99,
          padding: "11px 22px",
          marginTop: 4,
        }}
      >
        Try again
      </button>
    </div>
  );
}
