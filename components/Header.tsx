"use client";

type Props = {
  tla: string;
  teamName: string;
  subtitle: string;
  seasonLabel: string;
  accent: string;
  accentFg: string;
  onOpenPicker: () => void;
};

/** Tapping the club name reopens the picker — hence the chevron. */
export default function Header({
  tla,
  teamName,
  subtitle,
  seasonLabel,
  accent,
  accentFg,
  onOpenPicker,
}: Props) {
  return (
    <div
      style={{
        animation: "rise .5s cubic-bezier(.2,.7,.3,1) .05s both",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
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
          }}
        >
          {tla}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>{teamName}</div>
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
            {subtitle}
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
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: ".4px",
          padding: "6px 10px",
          border: "1px solid #d9d3c9",
          borderRadius: 99,
          color: "#6f695f",
        }}
      >
        {seasonLabel}
      </div>
    </div>
  );
}
