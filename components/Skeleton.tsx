import { Eyebrow } from "./ds";

/**
 * The loading screen. Deliberately not a shimmering skeleton: the system says
 * "no loading skeleton animation, and nothing loops" — so it states what it is
 * doing and stops.
 *
 * Data arrives with the HTML on a fresh page load, so this is only ever seen
 * on a client-side club switch.
 */
export default function Skeleton() {
  return (
    <div
      className="mw-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "56px 20px",
        gap: 10,
      }}
    >
      <Eyebrow>Reading the table</Eyebrow>
      <div
        style={{
          fontSize: "var(--size-lead)",
          fontWeight: 500,
          lineHeight: "var(--leading-lead)",
          color: "var(--text-muted)",
        }}
      >
        One moment.
      </div>
    </div>
  );
}
