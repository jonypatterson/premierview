import Link from "next/link";
import Frame from "@/components/Frame";
import { Eyebrow } from "@/components/ds";

export default function NotFound() {
  return (
    <Frame>
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
            Not a Premier League club
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
            That three-letter code isn&rsquo;t in this season&rsquo;s twenty.
          </div>
        </div>
        <div>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "var(--radius-full)",
              padding: "11px 17px",
              fontSize: 13,
              fontWeight: 600,
              background: "var(--surface-inverse)",
              color: "var(--text-on-inverse)",
              textDecoration: "none",
            }}
          >
            Pick a club
          </Link>
        </div>
      </div>
    </Frame>
  );
}
