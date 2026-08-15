// Color science ported from this workspace's dataviz skill validator
// (scripts/validate_palette.js) — the same OKLab/OKLCH math, WCAG contrast,
// and Machado-Oliveira-Fernandes (2009) CVD simulation used to validate the
// portfolio's own chart palettes. Huemap applies the identical checks to
// palettes the user generates or pastes.

export const BAND: Record<"light" | "dark", [number, number]> = {
  light: [0.43, 0.77],
  dark: [0.48, 0.67],
};
export const CHROMA_FLOOR = 0.1;
export const CVD_TARGET = 8.0;
export const CVD_FLOOR = 6.0;
export const NORMAL_FLOOR = 15.0;
export const CONTRAST_MIN = 3.0;
export const DEFAULT_SURFACE: Record<"light" | "dark", string> = {
  light: "#fcfcfb",
  dark: "#1a1a19",
};

const MACHADO: Record<"protan" | "deutan" | "tritan", number[][]> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

type RGB = [number, number, number];

export function hex2srgb(hex: string): RGB {
  const h = hex.trim().replace(/^#/, "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
}

export function isHexColor(value: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(value.trim());
}

function s2lin(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function lin2s(c: number): number {
  const clamped = Math.max(0, Math.min(1, c));
  return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

function lin(hex: string): RGB {
  return hex2srgb(hex).map(s2lin) as RGB;
}

function relLum(hex: string): number {
  const [r, g, b] = lin(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function oklabFromLin([r, g, b]: RGB): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLin([L, a, b]: [number, number, number]): RGB {
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l ** 3;
  const m3 = m ** 3;
  const s3 = s ** 3;
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
}

export function oklab(hex: string): [number, number, number] {
  return oklabFromLin(lin(hex));
}

export function oklch(hex: string): [number, number] {
  const [L, a, b] = oklab(hex);
  return [L, Math.hypot(a, b)];
}

export function hexToHue(hex: string): number {
  const [, a, b] = oklab(hex);
  return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
}

export function oklchToHex(L: number, C: number, hueDeg: number): string {
  const hRad = (hueDeg * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const [r, g, bl] = oklabToLin([L, a, b]);
  const clamp = (c: number) => Math.max(0, Math.min(1, c));
  const toHex = (c: number) =>
    Math.round(clamp(lin2s(c)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

function simulate(hex: string, kind: "protan" | "deutan" | "tritan"): RGB {
  const [r, g, b] = lin(hex);
  const m = MACHADO[kind];
  const clamp = (c: number) => Math.max(0, Math.min(1, c));
  return [
    clamp(m[0][0] * r + m[0][1] * g + m[0][2] * b),
    clamp(m[1][0] * r + m[1][1] * g + m[1][2] * b),
    clamp(m[2][0] * r + m[2][1] * g + m[2][2] * b),
  ];
}

export function simulateToHex(hex: string, kind: "protan" | "deutan" | "tritan"): string {
  const [r, g, b] = simulate(hex, kind);
  const toHex = (c: number) =>
    Math.round(Math.max(0, Math.min(1, lin2s(c))) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function deltaE(hex1: string, hex2: string, kind?: "protan" | "deutan" | "tritan"): number {
  const a = oklabFromLin(kind ? simulate(hex1, kind) : lin(hex1));
  const b = oklabFromLin(kind ? simulate(hex2, kind) : lin(hex2));
  return 100 * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export type CheckState = "pass" | "warn" | "fail" | "n/a";

export interface CheckResult {
  name: string;
  state: CheckState;
  detail: string;
}

export interface ValidationReport {
  ok: boolean;
  checks: CheckResult[];
}

export function validate(
  palette: string[],
  mode: "light" | "dark" = "light",
  surface?: string
): ValidationReport {
  const activeSurface = surface ?? DEFAULT_SURFACE[mode];
  const [lo, hi] = BAND[mode];
  const checks: CheckResult[] = [];
  let ok = true;

  const offband = palette.filter((c) => {
    const L = oklch(c)[0];
    return L < lo || L > hi;
  });
  if (offband.length) ok = false;
  checks.push({
    name: "Banda de luminosidad",
    state: offband.length ? "fail" : "pass",
    detail: offband.length
      ? `Fuera de banda: ${offband.join(", ")}`
      : `Los ${palette.length} colores están dentro de L ${lo}–${hi}`,
  });

  const lowChroma = palette.filter((c) => oklch(c)[1] < CHROMA_FLOOR);
  if (lowChroma.length) ok = false;
  checks.push({
    name: "Piso de croma",
    state: lowChroma.length ? "fail" : "pass",
    detail: lowChroma.length
      ? `Se ven grises (croma muy bajo): ${lowChroma.join(", ")}`
      : `Los ${palette.length} colores tienen suficiente saturación`,
  });

  const n = palette.length;
  const pairs: [number, number][] = Array.from({ length: Math.max(0, n - 1) }, (_, i) => [i, i + 1]);

  let worst: { d: number; kind: string; a: string; b: string } | null = null;
  for (const kind of ["protan", "deutan"] as const) {
    for (const [i, j] of pairs) {
      const d = deltaE(palette[i], palette[j], kind);
      if (!worst || d < worst.d) worst = { d, kind, a: palette[i], b: palette[j] };
    }
  }
  const cvdValue = worst ? worst.d : 99;
  const cvdState: CheckState = pairs.length === 0 ? "n/a" : cvdValue >= CVD_TARGET ? "pass" : cvdValue >= CVD_FLOOR ? "warn" : "fail";
  if (cvdState === "fail") ok = false;
  checks.push({
    name: "Separación CVD (daltonismo)",
    state: cvdState,
    detail: worst
      ? `Par más cercano bajo simulación: ${worst.a} ↔ ${worst.b}, ΔE ${worst.d.toFixed(1)} (${worst.kind})`
      : "Solo hay un color — no aplica",
  });

  let normalWorst: { d: number; a: string; b: string } | null = null;
  for (const [i, j] of pairs) {
    const d = deltaE(palette[i], palette[j]);
    if (!normalWorst || d < normalWorst.d) normalWorst = { d, a: palette[i], b: palette[j] };
  }
  const normalValue = normalWorst ? normalWorst.d : 99;
  const normalState: CheckState = pairs.length === 0 ? "n/a" : normalValue >= NORMAL_FLOOR ? "pass" : "fail";
  if (normalState === "fail") ok = false;
  checks.push({
    name: "Piso de visión normal",
    state: normalState,
    detail: normalWorst
      ? `Par más cercano: ${normalWorst.a} ↔ ${normalWorst.b}, ΔE ${normalWorst.d.toFixed(1)}`
      : "Solo hay un color — no aplica",
  });

  const lowContrast = palette.filter((c) => contrast(c, activeSurface) < CONTRAST_MIN);
  checks.push({
    name: "Contraste vs. superficie",
    state: lowContrast.length ? "warn" : "pass",
    detail: lowContrast.length
      ? `Bajo ${CONTRAST_MIN}:1 — necesitan etiqueta visible o tabla: ${lowContrast.join(", ")}`
      : `Los ${palette.length} colores cumplen ${CONTRAST_MIN}:1 contra ${activeSurface}`,
  });

  return { ok, checks };
}

export interface GenerateOptions {
  count: number;
  baseHue: number;
  mode: "light" | "dark";
}

export function generatePalette({ count, baseHue, mode }: GenerateOptions): string[] {
  const [lo, hi] = BAND[mode];
  const L = (lo + hi) / 2;
  const C = 0.15;
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => oklchToHex(L, C, (baseHue + i * step) % 360));
}

/**
 * Evenly-spaced hues at a fixed lightness/chroma do NOT guarantee CVD-safe
 * separation — two hues that look equally spaced to normal vision can
 * collapse toward each other under dichromatic simulation, because CVD
 * confusion lines don't align uniformly with the hue circle. Rather than
 * hide that, search a bounded number of base-hue offsets and surface the
 * best one actually found; if none clears both floors, return the best
 * candidate anyway and let the validator report the real result.
 */
export function findAccessibleBaseHue(count: number, mode: "light" | "dark", startHue: number): number {
  const candidates = Array.from({ length: 24 }, (_, k) => (startHue + k * 15) % 360);
  let best = { hue: startHue, score: -Infinity };

  for (const hue of candidates) {
    const palette = generatePalette({ count, baseHue: hue, mode });
    const report = validate(palette, mode);
    const cvd = report.checks.find((c) => c.name === "Separación CVD (daltonismo)");
    const normal = report.checks.find((c) => c.name === "Piso de visión normal");
    const passes = cvd?.state !== "fail" && normal?.state !== "fail";
    if (passes) return hue;

    // No candidate passed yet — track the least-bad one by the numbers
    // embedded in the detail strings (both report "ΔE <n>").
    const score = [cvd, normal]
      .map((c) => Number(c?.detail.match(/ΔE ([\d.]+)/)?.[1] ?? 0))
      .reduce((a, b) => a + b, 0);
    if (score > best.score) best = { hue, score };
  }

  return best.hue;
}
