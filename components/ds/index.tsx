/**
 * The Matchday design system, ported from `_ds/…/_ds_bundle.js`.
 *
 * These are transcriptions, not reinterpretations: every size, radius, colour
 * and gap below appears in the bundle. They are kept in one file because they
 * are small, they are always used together, and keeping them adjacent makes a
 * later diff against a new bundle revision a single read.
 *
 * The bundle's components are uncontrolled and style-only, so they port to
 * server components — none of them needs "use client". Hover states, which the
 * bundle held in React state, are CSS here instead so that stays true.
 */
import type { CSSProperties, ReactNode } from "react";

/* ── core ─────────────────────────────────────────────────────────────────── */

/** Initials mark. Square-ish for clubs, round for people. */
export function Avatar({
  initials,
  shape = "square",
  size = 40,
  background = "var(--claret-700)",
  color = "var(--sky-300)",
  style,
}: {
  initials: string;
  shape?: "square" | "round";
  size?: number;
  background?: string;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: shape === "round" ? "var(--radius-full)" : "var(--radius-mark)",
        background,
        color,
        fontFamily: "var(--font-core)",
        fontWeight: shape === "round" ? 600 : 700,
        fontSize: Math.round(size * 0.34),
        letterSpacing: "-.5px",
        ...style,
      }}
    >
      {initials}
    </div>
  );
}

const BUTTON_SIZES = {
  lg: { padding: "16px 20px", fontSize: "15px", fontWeight: 600 },
  md: { padding: "11px 17px", fontSize: "13px", fontWeight: 600 },
  sm: { padding: "10px 14px", fontSize: "12.5px", fontWeight: 500 },
} as const;

/** The one button shape in the system: a full-radius pill, ink by default. */
export function Button({
  variant = "primary",
  size = "lg",
  block = false,
  disabled = false,
  children,
  style,
  onClick,
  type = "button",
}: {
  variant?: "primary" | "quiet" | "accent";
  size?: "lg" | "md" | "sm";
  block?: boolean;
  disabled?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`ds-btn ds-btn-${variant}`}
      style={{
        display: block ? "flex" : "inline-flex",
        width: block ? "100%" : "auto",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
        border: "none",
        borderRadius: "var(--radius-full)",
        fontFamily: "var(--font-core)",
        letterSpacing: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        whiteSpace: "nowrap",
        ...BUTTON_SIZES[size],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** Uppercase mono label that opens a card or a column. */
export function Eyebrow({
  children,
  tone = "muted",
  size = "10.5px",
  style,
}: {
  children: ReactNode;
  tone?: "muted" | "faint" | "inverse";
  size?: string;
  style?: CSSProperties;
}) {
  const colors = {
    muted: "var(--ink-60)",
    faint: "var(--text-faint)",
    inverse: "var(--text-on-inverse-muted)",
  };
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: size,
        letterSpacing: "var(--track-mono-eyebrow)",
        color: colors[tone],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── data display ─────────────────────────────────────────────────────────── */

/** W/D/L squares across a matchday run. */
export function FormStrip({
  results,
  past = false,
  style,
}: {
  results: string[];
  past?: boolean;
  style?: CSSProperties;
}) {
  const fill = (r: string) =>
    past
      ? { W: "var(--result-win-past)", D: "var(--result-draw-past)", L: "var(--result-loss-past)" }[r]
      : { W: "var(--result-win)", D: "var(--result-draw)", L: "var(--result-loss)" }[r];
  return (
    <div style={{ display: "flex", gap: 5, ...style }}>
      {results.map((r, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            minWidth: 0,
            height: 30,
            borderRadius: "var(--radius-chip)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-core)",
            fontSize: 12,
            fontWeight: 600,
            color: past ? "var(--ink-55)" : "var(--text-body)",
            background: fill(r),
          }}
        >
          {r}
        </div>
      ))}
    </div>
  );
}

/** The oversized headline figure on a chalk chip with soft blob overlays. */
export function HeroStat({
  eyebrow,
  value,
  label,
  delta,
  deltaCaption,
  background = "var(--accent-1)",
  style,
}: {
  eyebrow?: string;
  value: ReactNode;
  label?: ReactNode;
  delta?: string;
  deltaCaption?: string;
  background?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-hero)",
        padding: "26px 22px 22px",
        position: "relative",
        overflow: "hidden",
        background,
        transition: "var(--transition-theme)",
        fontFamily: "var(--font-core)",
        ...style,
      }}
    >
      {/* Two blobs per hero chip, never more. */}
      <div
        style={{
          position: "absolute",
          right: -70,
          top: -70,
          width: 230,
          height: 230,
          borderRadius: "var(--radius-full)",
          background: "var(--cream-32)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -30,
          bottom: -110,
          width: 190,
          height: 190,
          borderRadius: "var(--radius-full)",
          background: "rgba(20,20,15,.06)",
        }}
      />
      <div style={{ position: "relative" }}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <div
          style={{
            fontSize: "var(--size-hero)",
            fontWeight: 700,
            lineHeight: "var(--leading-hero)",
            letterSpacing: "var(--track-hero)",
            color: "var(--text-body)",
            margin: "10px 0 0",
          }}
        >
          {value}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 12,
          }}
        >
          <div
            style={{
              fontSize: "var(--size-body)",
              color: "var(--text-muted)",
              maxWidth: 150,
              lineHeight: "var(--leading-body)",
            }}
          >
            {label}
          </div>
          {delta ? (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-body)" }}>{delta}</div>
              {deltaCaption ? (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--size-mono-xs)",
                    color: "var(--ink-55)",
                    marginTop: 3,
                  }}
                >
                  {deltaCaption}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** A sentence of editorial on a chalk card. One blob, never more. */
export function InsightCard({
  eyebrow,
  children,
  background = "var(--accent-1)",
  blob = true,
  style,
}: {
  eyebrow?: string;
  children: ReactNode;
  background?: string;
  blob?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background,
        borderRadius: "var(--radius-card)",
        padding: "var(--card-pad)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-core)",
        ...style,
      }}
    >
      {blob ? (
        <div
          style={{
            position: "absolute",
            right: -20,
            bottom: -46,
            width: 150,
            height: 150,
            borderRadius: "var(--radius-full)",
            background: "rgba(255,255,255,.24)",
          }}
        />
      ) : null}
      {eyebrow ? <Eyebrow style={{ position: "relative" }}>{eyebrow}</Eyebrow> : null}
      <div
        style={{
          fontSize: "var(--size-lead)",
          fontWeight: 500,
          lineHeight: "var(--leading-lead)",
          letterSpacing: "var(--track-lead)",
          color: "var(--text-body)",
          margin: "8px 0 0",
          position: "relative",
          maxWidth: 245,
          textWrap: "pretty",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** A metric with a filled bar for now and an ink marker for the benchmark. */
export function MetricRow({
  tag,
  name,
  value,
  previous,
  delta,
  deltaColor = "var(--delta-flat)",
  pctNow,
  pctPrevious,
  color = "var(--accent-1)",
  style,
}: {
  tag: string;
  name: string;
  value: ReactNode;
  previous: ReactNode;
  delta?: string;
  deltaColor?: string;
  pctNow: string;
  pctPrevious: string;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--gap-row)",
        padding: "10px 0",
        fontFamily: "var(--font-core)",
        ...style,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "var(--radius-tile-sm)",
          flex: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--size-mono-sm)",
          color: "var(--text-body)",
          background: color,
        }}
      >
        {tag}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}
        >
          <span style={{ fontSize: "var(--size-body-sm)", color: "var(--text-body)" }}>{name}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: deltaColor }}>{delta}</span>
        </div>
        <div
          style={{
            position: "relative",
            height: 13,
            borderRadius: "var(--radius-full)",
            background: "var(--track-bar)",
            marginTop: 8,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              borderRadius: "var(--radius-full)",
              background: color,
              width: pctNow,
            }}
          />
          {/* The comparison season is always the quieter of the two: an ink
              tick, not a second filled bar. */}
          <div
            style={{
              position: "absolute",
              top: -4,
              bottom: -4,
              width: 3,
              borderRadius: 2,
              background: "var(--marker-benchmark)",
              left: pctPrevious,
            }}
          />
        </div>
      </div>
      <div style={{ width: 54, textAlign: "right", flex: "none" }}>
        <div
          style={{
            fontSize: "var(--size-figure-sm)",
            fontWeight: 700,
            letterSpacing: "var(--track-figure-sm)",
            color: "var(--text-body)",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--size-mono-sm)",
            color: "var(--text-faint)",
            marginTop: 3,
          }}
        >
          was {previous}
        </div>
      </div>
    </div>
  );
}

/** Person row with a two-bar comparison underneath. */
export function PlayerRow({
  initials,
  name,
  meta,
  value,
  delta,
  deltaColor = "var(--delta-flat)",
  widthNow,
  widthPrevious,
  color = "var(--accent-1)",
  style,
}: {
  initials: string;
  name: string;
  meta: string;
  value: ReactNode;
  delta?: string;
  deltaColor?: string;
  widthNow: string;
  widthPrevious: string;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: "1px solid var(--border-hairline)",
        fontFamily: "var(--font-core)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar initials={initials} shape="round" size={40} background={color} color="var(--ink-900)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "var(--size-body)", fontWeight: 500, color: "var(--text-body)" }}>
            {name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--size-mono-sm)",
              color: "var(--text-faint)",
              marginTop: 3,
            }}
          >
            {meta}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "var(--size-figure-md)",
              fontWeight: 700,
              letterSpacing: "var(--track-figure-md)",
              color: "var(--text-body)",
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          <div
            style={{ fontSize: "var(--size-mono)", fontWeight: 600, marginTop: 3, color: deltaColor }}
          >
            {delta}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 11, alignItems: "center" }}>
        <div
          style={{
            height: 10,
            borderRadius: "var(--radius-full)",
            background: color,
            width: widthNow,
          }}
        />
        <div
          style={{
            height: 10,
            borderRadius: "var(--radius-full)",
            background: "var(--track-bar-past)",
            width: widthPrevious,
          }}
        />
      </div>
    </div>
  );
}

/** Full-width coloured pill holding a label, a figure, and its previous value. */
export function SplitRow({
  label,
  value,
  previous,
  background = "var(--accent-3)",
  style,
}: {
  label: string;
  value: ReactNode;
  previous?: ReactNode;
  background?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 18px",
        borderRadius: "var(--radius-pill-sm)",
        background,
        fontFamily: "var(--font-core)",
        ...style,
      }}
    >
      <span style={{ fontSize: "var(--size-body-sm)", color: "var(--text-body)" }}>{label}</span>
      <span style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
        <span
          style={{
            fontSize: "var(--size-figure-md)",
            fontWeight: 700,
            letterSpacing: "var(--track-figure-md)",
            color: "var(--text-body)",
          }}
        >
          {value}
        </span>
        {previous != null ? (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--size-mono)",
              color: "var(--ink-60)",
            }}
          >
            was {previous}
          </span>
        ) : null}
      </span>
    </div>
  );
}

/** Half-width coloured tile: one label, one figure, one comparison line. */
export function StatTile({
  eyebrow,
  value,
  caption,
  background = "var(--accent-3)",
  style,
}: {
  eyebrow: string;
  value: ReactNode;
  caption?: string;
  background?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        flex: 1,
        background,
        borderRadius: "var(--radius-tile)",
        padding: 17,
        fontFamily: "var(--font-core)",
        ...style,
      }}
    >
      <Eyebrow size="var(--size-mono-sm)">{eyebrow}</Eyebrow>
      <div
        style={{
          fontSize: "var(--size-figure-xl)",
          fontWeight: 700,
          letterSpacing: "var(--track-figure-xl)",
          color: "var(--text-body)",
          lineHeight: 1.05,
          marginTop: 6,
        }}
      >
        {value}
      </div>
      {caption ? (
        <div style={{ fontSize: "var(--size-caption)", color: "var(--ink-65)" }}>{caption}</div>
      ) : null}
    </div>
  );
}

/* ── navigation ───────────────────────────────────────────────────────────── */

/** Club identity: mark, name, and the season/matchweek line. */
export function AppHeader({
  initials,
  title,
  meta,
  markBackground,
  markColor,
  style,
}: {
  initials: string;
  title: string;
  meta: string;
  markBackground?: string;
  markColor?: string;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, ...style }}>
      <Avatar initials={initials} background={markBackground} color={markColor} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "var(--size-name)",
            fontWeight: 600,
            color: "var(--text-body)",
            letterSpacing: "var(--track-name)",
            lineHeight: 1.1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--size-mono)",
            color: "var(--text-meta)",
            marginTop: 3,
          }}
        >
          {meta}
        </div>
      </div>
    </div>
  );
}
