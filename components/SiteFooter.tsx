/**
 * Sits at the foot of every screen, inside the scroll area — the tab bar is
 * absolutely positioned over it, so a footer outside the screen would never be
 * reachable.
 *
 * The system's mono is for labels and metadata, which is what this is. The
 * coffee emoji that used to close the line is gone: "No emoji, anywhere."
 */
export default function SiteFooter() {
  return (
    <footer
      style={{
        marginTop: 40,
        fontFamily: "var(--font-mono)",
        fontSize: "var(--size-mono-sm)",
        letterSpacing: "var(--track-mono-eyebrow)",
        color: "var(--text-faint)",
      }}
    >
      Free to use. If it&rsquo;s useful,{" "}
      <a
        href="https://buymeacoffee.com/jonyp"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--text-body)" }}
      >
        buy me a coffee
      </a>
    </footer>
  );
}
