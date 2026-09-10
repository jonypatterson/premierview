// Where the chosen club is remembered.
//
// It is written twice, to two stores that answer at different moments:
//
//   localStorage  readable only once React has hydrated
//   cookie        arrives with the request, so the server can act on it
//
// The cookie is what makes `/` instant. Without it the landing route has no
// way to know the club until the browser has downloaded and hydrated the
// bundle, so it can only serve a loading screen and then client-navigate —
// two full round trips before anything appears. With it the server redirects
// on the first request and the loading screen never renders.
//
// localStorage stays because it is what visitors from before the cookie
// existed still carry; they take the old path once, and writing the club sets
// the cookie for every visit after.

export const STORAGE_KEY = "plc.team";
export const CLUB_COOKIE = "plc.team";

/** A three-letter code is the only shape either store can hold. */
export const isClubCode = (s: string | undefined | null): s is string =>
  !!s && /^[A-Z]{3}$/.test(s);

/** Remember the club in both stores. Client-side only. */
export function rememberClub(code: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* private mode — the route still works, it just won't be remembered */
  }
  try {
    // A year, path-wide. Lax is right: this is a display preference that never
    // authorises anything, and it must survive an ordinary top-level visit.
    // Not HttpOnly — the client is what writes it.
    document.cookie = `${CLUB_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* as above */
  }
}
