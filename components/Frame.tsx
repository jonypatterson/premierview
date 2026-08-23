import type { ReactNode } from "react";
import SiteFooter from "./SiteFooter";

/**
 * Below 1000px there is no card — the app is the viewport. At 1000px and up
 * it becomes a centred card on the canvas. See .frame in globals.css.
 */
export default function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="frame-outer">
      <div className="frame">
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
