import type { ReactNode } from "react";

/**
 * The desk, the app surface, and the box the screens are positioned inside.
 *
 * Below 760px there is no card — the app is the viewport. Above it the card
 * fills the viewport with a 40px margin. See .mw-desk / .mw-app / .mw-inner in
 * globals.css.
 *
 * The footer used to live here. It moved inside each screen: screens are
 * absolutely positioned and scroll independently, so anything rendered outside
 * them can never be scrolled to.
 */
export default function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="mw-desk">
      <div className="mw-app">
        <div className="mw-inner">{children}</div>
      </div>
    </div>
  );
}
