/**
 * Collection colours. The data model stores a Tailwind token ("teal-700"); the
 * picker offers six riso inks (HANDOFF.md § Collection editor). Any of the 88
 * legacy values still renders, mapped to the nearest riso ink by family and shade.
 */
export const RISO_SWATCHES = [
  { key: "ink", tag: "zinc-700", hex: "#170B11" },
  { key: "burgundy", tag: "pink-700", hex: "#B3165A" },
  { key: "pink", tag: "pink-300", hex: "#FF6BA8" },
  { key: "redOrange", tag: "orange-500", hex: "#E0542E" },
  { key: "mustard", tag: "amber-500", hex: "#D9A21B" },
  { key: "teal", tag: "teal-700", hex: "#0E6B6B" },
] as const;

type RisoKey = (typeof RISO_SWATCHES)[number]["key"];

const FAMILY: Record<string, RisoKey | ((shade: number) => RisoKey)> = {
  slate: "ink", gray: "ink", zinc: "ink", neutral: "ink", stone: "ink",
  red: "redOrange", orange: "redOrange",
  amber: "mustard", yellow: "mustard", lime: "mustard",
  green: "teal", emerald: "teal", teal: "teal", cyan: "teal", sky: "teal", blue: "teal", indigo: "teal",
  violet: "burgundy", purple: "burgundy",
  fuchsia: (shade) => (shade <= 400 ? "pink" : "burgundy"),
  pink: (shade) => (shade <= 400 ? "pink" : "burgundy"),
  rose: (shade) => (shade <= 400 ? "pink" : "burgundy"),
};

const byKey = Object.fromEntries(RISO_SWATCHES.map((s) => [s.key, s.hex])) as Record<RisoKey, string>;

/** The riso hex for a stored colour tag (default: ink) */
export function collectionColor(tag: string | null | undefined): string {
  if (!tag) return byKey.ink;
  const exact = RISO_SWATCHES.find((s) => s.tag === tag);
  if (exact) return exact.hex;
  const [family, shadeText] = tag.split("-");
  const rule = FAMILY[family];
  if (!rule) return byKey.ink;
  return byKey[typeof rule === "function" ? rule(Number(shadeText) || 500) : rule];
}

/** Stored kebab-case Lucide name → the export name ("book-open" → "BookOpen") */
export function lucideExportName(iconName: string | null | undefined) {
  return (iconName || "book")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
