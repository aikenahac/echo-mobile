import { useTheme } from '@/lib/theme-context';
import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import type { TextStyle } from 'react-native';

/**
 * Echo design tokens (design/redesign/HANDOFF.md § Tokens).
 * Same values as the CSS variables in src/global.css. Use the Uniwind classes
 * (`bg-paper`, `text-ink-2`, …) in layout code; use these where a raw value is
 * needed (Reanimated, SF Symbols, @expo/ui, navigation theme).
 */
const light = {
  paper: '#FBF7F8',
  field: '#FF6BA8',
  ink: '#170B11',
  ink2: '#6B5560',
  ink3: '#8C7682',
  rule: '#EADCE2',
  tint: '#F3E6EC',
  pinkInk: '#B3165A',
  onField: '#170B11',
  onField2: 'rgba(23,11,17,0.74)',
  onFieldRule: 'rgba(23,11,17,0.22)',
  negative: '#C2312B',
  plate: '#B3165A',
  /** Text fields, the selected segment */
  surface: '#FFFFFF',
  fieldButton: '#170B11',
  /** The − capsule outline on the field (softer in dark) */
  fieldOutline: '#170B11',
  onFieldButton: '#FF6BA8',
  /** Glass tint for circular toolbar buttons that sit on the field */
  fieldGlass: 'rgba(255,235,243,0.42)',
  /** Avatar tile on the field (feed band) */
  fieldTile: 'rgba(255,235,243,0.6)',
  /** Lift under floating glass controls (system chrome, not content) */
  glassShadow: '0 6px 16px rgba(70,8,36,0.12)',
  /** The one shadow: covers only */
  coverShadow: '0 1px 1px rgba(23,11,17,0.14), 0 14px 22px -12px rgba(70,8,36,0.5)',
};

const dark: typeof light = {
  paper: '#130A0E',
  field: '#5C1738',
  ink: '#FFE8F1',
  ink2: '#C9AEBA',
  ink3: '#A48D98',
  rule: '#2E1C24',
  tint: '#2A1820',
  pinkInk: '#FF8CBF',
  onField: '#FFE8F1',
  onField2: 'rgba(255,232,241,0.78)',
  onFieldRule: 'rgba(255,232,241,0.2)',
  negative: '#FF6B62',
  plate: '#8E2457',
  surface: '#2A1820',
  fieldButton: '#FF8CBF',
  fieldOutline: 'rgba(255,232,241,0.78)',
  onFieldButton: '#3A0C22',
  fieldGlass: 'rgba(255,140,191,0.16)',
  fieldTile: 'rgba(255,232,241,0.14)',
  glassShadow: '0 6px 16px rgba(0,0,0,0.35)',
  coverShadow: '0 0 0 0.5px rgba(255,255,255,0.08), 0 14px 22px -12px rgba(0,0,0,0.8)',
};

export const palette = { light, dark };

/**
 * Colours that don't change with light/dark: text and icons on a user-coloured
 * collection banner or tile, scrims over photos, the cover's spine sheen, and brand
 * colours other companies require (Apple's button is black).
 */
export const fixed = {
  onColor: '#FFFFFF',
  onColor2: 'rgba(255,255,255,0.86)',
  onColorWash: 'rgba(255,255,255,0.16)',
  photoScrim: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.65) 100%)',
  dimmer: 'rgba(0,0,0,0.25)',
  coverSheen: 'linear-gradient(90deg, rgba(0,0,0,0.16) 0%, rgba(255,255,255,0.16) 2.5%, rgba(0,0,0,0.06) 5%, transparent 9%)',
  thumbShadow: '0 1px 2px rgba(23,11,17,0.2)',
  cardShadow: '0 12px 24px -14px rgba(70,8,36,0.45)',
  appleBlack: '#000000',
} as const;
export type Palette = typeof light;

/** The resolved palette for the current light/dark mode */
export function useColors(): Palette {
  const { colorScheme } = useTheme();
  return colorScheme === 'dark' ? dark : light;
}

/**
 * Status bar text for native stacks. Under the UIScene life cycle iOS only honours
 * view-controller-based appearance, so each Stack sets `statusBarStyle` itself.
 */
export function useStatusBarStyle(): 'light' | 'dark' {
  const { colorScheme } = useTheme();
  return colorScheme === 'dark' ? 'light' : 'dark';
}

/** Spacing scale (pt). `lg` (20) is the screen side margin. */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 20, xl: 32, xxl: 48 } as const;

export const radius = {
  /** Covers: spine side smaller */
  coverSpine: 1.5,
  cover: 3,
  tile: 4,
  field: 12,
  full: 9999,
} as const;

export const fonts = {
  display: 'ArchivoCondensed-Black',
  displayXB: 'ArchivoCondensed-ExtraBold',
} as const;

/**
 * Type scale (pt): 120 page number · 64 headline · 44 screen title · 28 hero book
 * title / section head · 22 list book title · 17 body · 15 secondary · 13 metadata
 * · 11 caption. Display tracking is slightly negative; the word spacing the
 * design wants is baked into the font's space glyph.
 */
export const type = {
  pageNumber: { fontFamily: fonts.display, fontSize: 120, lineHeight: 104, letterSpacing: -3, fontVariant: ['lining-nums', 'tabular-nums'] },
  headline: { fontFamily: fonts.display, fontSize: 64, lineHeight: 58, letterSpacing: -0.6 },
  screenTitle: { fontFamily: fonts.display, fontSize: 44, lineHeight: 46, letterSpacing: -0.4 },
  heroTitle: { fontFamily: fonts.displayXB, fontSize: 28, lineHeight: 30, letterSpacing: -0.4 },
  sectionHead: { fontFamily: fonts.displayXB, fontSize: 28, lineHeight: 30, letterSpacing: -0.4 },
  listTitle: { fontFamily: fonts.displayXB, fontSize: 22, lineHeight: 24, letterSpacing: -0.2 },
  rowTitle: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.4 },
  body: { fontSize: 17, lineHeight: 24, letterSpacing: -0.3 },
  secondary: { fontSize: 15, lineHeight: 20 },
  meta: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 11, lineHeight: 13 },
} as const satisfies Record<string, TextStyle>;

/** Misregistered riso plate offset under big numerals */
export const PLATE_OFFSET = 3;

export const motion = {
  /** .spring(duration: 0.3, bounce: 0.15) */
  settle: { duration: 300, dampingRatio: 0.85 },
  stamp: 180,
  drain: 400,
} as const;

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: light.paper,
      border: light.rule,
      card: light.paper,
      notification: light.negative,
      primary: light.pinkInk,
      text: light.ink,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: dark.paper,
      border: dark.rule,
      card: dark.paper,
      notification: dark.negative,
      primary: dark.pinkInk,
      text: dark.ink,
    },
  },
};
