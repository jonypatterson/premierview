/**
 * Renders app/apple-icon.png from the mark.
 *
 * The brand sheet says vector only, and app/icon.svg is the master everywhere
 * that allows it. iOS is the exception — it won't take an SVG touch icon — so
 * this is the one bitmap, regenerated from the same geometry rather than
 * hand-exported.
 *
 * The tile here is deliberately square, unlike app/icon.svg: iOS applies its
 * own superellipse mask, and a pre-rounded source shows the ink corners
 * clipped a second time against the home screen.
 *
 *   node scripts/build-icons.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Full-bleed: no rx on the ground, per the note above.
const SQUARE_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="180" height="180">
  <rect width="48" height="48" fill="#14140F"/>
  <rect x="10" y="24" width="11" height="15" rx="3" fill="#FBF4E4" fill-opacity=".5"/>
  <rect x="27" y="9" width="11" height="30" rx="3" fill="#FFB0D6"/>
</svg>`;

const out = path.join(ROOT, "app", "apple-icon.png");
const png = await sharp(Buffer.from(SQUARE_MARK)).png().toBuffer();
await writeFile(out, png);
console.log(`wrote ${path.relative(ROOT, out)} (${png.length} bytes, 180×180)`);
