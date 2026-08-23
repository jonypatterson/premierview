/**
 * Sits at the foot of every screen. Carries the clearance the floating tab bar
 * needs, so it costs no extra whitespace — the screens used to reserve that
 * space and leave it empty.
 */
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      Free to use. If it&rsquo;s useful,{" "}
      <a href="https://buymeacoffee.com/jonyp" target="_blank" rel="noopener noreferrer">
        buy me a coffee
      </a>{" "}
      ☕
    </footer>
  );
}
