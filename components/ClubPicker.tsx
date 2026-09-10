"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import LogoLockup from "./LogoLockup";
import SiteFooter from "./SiteFooter";
import { rememberClub } from "@/lib/club-memory";
import { FALLBACK_CLUBS } from "@/lib/clubs";
import type { Club } from "@/lib/types";

type Props = {
  clubs: Club[];
  /** The club we are already on, if any — it keeps its tile lit. */
  currentTla?: string;
  /**
   * Dismiss the picker without navigating. Passed when the picker is opened
   * over a club page; absent on the landing route, where there is nothing to
   * go back to.
   */
  onClose?: () => void;
};

/**
 * First run and club switching. The choice is written to localStorage so every
 * later visit to / opens straight on that club's season.
 *
 * The artboard opens this screen with a mono eyebrow setting the product name.
 * The lockup stands there instead: BRAND.md §3 puts the mark on the picker and
 * nowhere else, and an eyebrow repeating the name beneath it would say it twice.
 */
export default function ClubPicker({ clubs, currentTla, onClose }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const list = clubs.length ? clubs : FALLBACK_CLUBS;

  const pick = (code: string) => {
    rememberClub(code);
    // Re-picking the club you are already on is a push to the current URL,
    // which Next treats as a no-op — so the picker stayed open and the tile
    // appeared dead. It is a dismissal, not a navigation.
    if (code === currentTla && onClose) {
      onClose();
      return;
    }
    startTransition(() => router.push(`/${code}`));
  };

  return (
    /* Layout lives in globals.css. Setting it inline put it out of reach of
       the breakpoints, which is why this screen never picked up the desktop
       treatment the others have. */
    <div className="mw-screen mw-picker">
      <div className="mw-picker-head">
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
          className="mw-picker-lead"
          style={{
            fontSize: "var(--size-lead)",
            fontWeight: 500,
            lineHeight: "var(--leading-lead)",
            color: "var(--text-muted)",
            marginTop: 12,
            textWrap: "pretty",
          }}
        >
          Every club&rsquo;s season set against the one before it: position, results, goals and
          scorers.
        </div>
      </div>

      {/* Columns live in globals.css. Setting them inline here beat the media
          queries on specificity, so the grid stayed at its phone width on
          every screen. */}
      <div className="mw-clubgrid">
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
              {c.short_name || c.name}
            </button>
          );
        })}
      </div>

      <SiteFooter />
    </div>
  );
}
