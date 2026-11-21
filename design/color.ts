// Color math for the theme: WCAG contrast and "nearest shade to the eye".
const HEX6 = /^#[0-9a-fA-F]{6}$/;
const HEX3 = /^#[0-9a-fA-F]{3}$/;

export const WHITE = "#ffffff";
export const INK = "#030712"; // neutral-950, the darkest text color

// "#abc" or "#AABBCC" becomes "#aabbcc". Anything else is null: we never guess what "navy" means.
export function parseHex(s: string): string | null {
  const t = s.trim();
  if (HEX6.test(t)) return t.toLowerCase();
  if (HEX3.test(t)) return ("#" + [...t.slice(1)].map(c => c + c).join("")).toLowerCase();
  return null;
}

function rgb(hex: string): [number, number, number] {
  const h = parseHex(hex);
  if (!h) throw new Error(`not a hex color: ${hex}`);
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

function linear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = rgb(hex);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// The text color to put on top of a filled color: white or ink, whichever reads better.
// One of the two always reaches 4.5:1.
export function readableOn(fill: string): string {
  return contrastRatio(WHITE, fill) >= contrastRatio(INK, fill) ? WHITE : INK;
}

// CIE Lab (D65), so "nearest" means nearest to the eye, not nearest in raw RGB.
function lab(hex: string): [number, number, number] {
  const [r, g, b] = rgb(hex).map(linear) as [number, number, number];
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function colorDistance(a: string, b: string): number {
  const [l1, a1, b1] = lab(a);
  const [l2, a2, b2] = lab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}
