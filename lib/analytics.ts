"use client";

// The one thing the app tells Google that the URL does not.
//
// Routes take care of themselves: a club switch is a router.push, and GA4's
// enhanced measurement counts a history change as a page view. The three tabs
// inside a club are React state, so nothing about the URL changes when the
// reader moves between them, and without this they would be invisible.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Inlined at build time, so this is a constant in the bundle, not a lookup. */
const ON = !!process.env.NEXT_PUBLIC_GA_ID;

/**
 * Send one GA4 event, or do nothing at all.
 *
 * Nothing at all is the case locally and on previews, where no measurement ID
 * is set — and it stays silent about it, rather than warning once per click in
 * a console that has real work to show.
 */
export function track(name: string, params: Record<string, string | number>) {
  if (!ON) return;
  window.gtag?.("event", name, params);
}
