import type { CSSProperties } from "react";

const shimmer = (delay = 0, dark = false): CSSProperties => ({
  background: dark
    ? "linear-gradient(90deg,#EFEBE4 25%,#F7F4EF 50%,#EFEBE4 75%)"
    : "linear-gradient(90deg,#E9E4DB 25%,#F2EEE7 50%,#E9E4DB 75%)",
  backgroundSize: "320px 100%",
  animation: `shimmer 1.4s linear ${delay}s infinite`,
});

/** Shown on client-side club switches; first paint arrives with data. */
export default function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, padding: "28px 24px 96px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", ...shimmer() }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ width: 132, height: 13, borderRadius: 4, ...shimmer() }} />
            <div style={{ width: 78, height: 9, borderRadius: 4, ...shimmer(0.1) }} />
          </div>
        </div>
        <div style={{ width: 88, height: 26, borderRadius: 99, ...shimmer() }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 120, height: 10, borderRadius: 4, ...shimmer() }} />
        <div style={{ width: 150, height: 60, borderRadius: 10, ...shimmer(0.08) }} />
        <div style={{ width: 164, height: 10, borderRadius: 4, ...shimmer(0.16) }} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {[0, 0.07, 0.14, 0.21, 0.28, 0.35].map((d, i) => (
          <div key={i} style={{ width: 44, height: 44, borderRadius: "50%", ...shimmer(d) }} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[0, 0.08, 0.16].map((d, i) => (
          <div key={i} style={{ height: 86, borderRadius: 16, ...shimmer(d, true) }} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[0, 0.08].map((d, i) => (
          <div key={i} style={{ height: 116, borderRadius: 16, ...shimmer(d, true) }} />
        ))}
      </div>

      <div style={{ height: 186, borderRadius: 16, ...shimmer(0, true) }} />
    </div>
  );
}
