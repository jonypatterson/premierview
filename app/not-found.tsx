import Link from "next/link";
import Frame from "@/components/Frame";

export default function NotFound() {
  return (
    <Frame>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 14,
          padding: "120px 40px",
          minHeight: 940,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 17 }}>Not a Premier League club</div>
        <div style={{ fontSize: 13, color: "#8b857c", lineHeight: 1.5, maxWidth: 250 }}>
          That three-letter code isn&rsquo;t in this season&rsquo;s twenty.
        </div>
        <Link
          href="/"
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "#fff",
            background: "#191613",
            borderRadius: 99,
            padding: "11px 22px",
            marginTop: 4,
            textDecoration: "none",
          }}
        >
          Pick a club
        </Link>
      </div>
    </Frame>
  );
}
