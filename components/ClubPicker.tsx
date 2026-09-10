"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Avatar } from "./ds";
import LogoLockup from "./LogoLockup";
import SiteFooter from "./SiteFooter";
import { STORAGE_KEY } from "@/lib/format";
import { MARK_INK, snap } from "@/lib/palette";
import { FALLBACK_CLUBS } from "@/lib/clubs";
import type { Club } from "@/lib/types";

type Props = {
  clubs: Club[];
  /** The saved club, if there is one — it keeps its tile lit. */
  currentTla?: string;
};

/**
 * First run and club switching. The choice is written to localStorage so every
 * later visit to / opens straight on that club's season.
 *
 * The artboard opens this screen with a mono eyebrow setting the product name.
 * The lockup stands there instead: BRAND.md §3 puts the mark on the picker and
 * nowhere else, and an eyebrow repeating the name beneath it would say it twice.
 */
export default function ClubPicker({ clubs, currentTla }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const list = clubs.length ? clubs : FALLBACK_CLUBS;

  const pick = (code: string) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* private mode — the route still works, it just won't be remembered */
    }
    startTransition(() => router.push(`/${code}`));
  };

  return (
    <div
      className="mw-pad mw-screen"
      style={{ display: "flex", flexDirection: "column", gap: 32, padding: "56px 20px 40px" }}
    >
      <div style={{ animation: "rise .34s ease both" }}>
        <LogoLockup size={44} />
        <div
          style={{
            fontSize: "var(--size-title)",
            fontWeight: 600,
            letterSpacing: "var(--track-title)",
            lineHeight: 1.02,
            marginTop: 18,
          }}
        >
          Pick your club
        </div>
        <div
          style={{
            fontSize: "var(--size-lead)",
            fontWeight: 500,
            lineHeight: "var(--leading-lead)",
            color: "var(--text-muted)",
            marginTop: 12,
            maxWidth: 320,
            textWrap: "pretty",
          }}
        >
          Every club&rsquo;s season set against the one before it: position, results, goals and
          scorers.
        </div>
      </div>

      <div
        className="mw-clubgrid"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}
      >
        {list.map((c) => {
          const isCurrent = currentTla === c.code;
          return (
            <button
              key={c.code}
              type="button"
              className={`club-tile${isCurrent ? " club-tile-current" : ""}`}
              onClick={() => pick(c.code)}
              aria-current={isCurrent}
            >
              <Avatar
                initials={c.code}
                size={72}
                background={snap(c.colour)}
                color={MARK_INK}
                style={{ width: "100%" }}
              />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  lineHeight: 1.2,
                  textAlign: "center",
                  width: "100%",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {c.short_name || c.name}
              </div>
            </button>
          );
        })}
      </div>

      <SiteFooter />
    </div>
  );
}
