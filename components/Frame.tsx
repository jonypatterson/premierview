import type { ReactNode } from "react";

/** The 390px phone card everything renders inside. */
export default function Frame({ children }: { children: ReactNode }) {
  return (
    <section style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
      <div className="dv-card" style={{ width: 390, background: "#F6F3EE", color: "#191613" }}>
        <div style={{ position: "relative", minHeight: 940 }}>{children}</div>
      </div>
    </section>
  );
}
