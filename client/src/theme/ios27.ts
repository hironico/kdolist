import { colors, typography, spacing } from '@ios27_design_system/tokens';

/**
 * Helpers exposing the iOS 27 design tokens (@ios27_design_system/tokens)
 * as plain values usable by the MUI theme and by `sx` props.
 *
 * The CSS custom properties (`--ios27-*`) are also loaded globally (see Root.tsx)
 * and follow `data-theme` on <html>, which is kept in sync by the ThemeProvider.
 */

export type IosMode = 'light' | 'dark';

type Swatch = string | { hex: string; a: number };
type ModeSwatch = { light: Swatch; dark: Swatch };

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toCss = (s: Swatch): string => {
  if (typeof s === 'string') return s;
  const [r, g, b] = hexToRgb(s.hex);
  return s.a >= 1 ? s.hex : `rgba(${r}, ${g}, ${b}, ${s.a})`;
};

const pick = (swatch: ModeSwatch, mode: IosMode): string => toCss(swatch[mode]);

export type IosAccent =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'mint'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'brown';

/** iOS system accent colour (systemBlue, systemRed, …) for the given mode. */
export const accent = (name: IosAccent, mode: IosMode): string =>
  pick(colors.accents[name] as ModeSwatch, mode);

/** Semantic iOS colours resolved for one appearance mode. */
export const iosColors = (mode: IosMode) => ({
  label: {
    primary: pick(colors.labels.primary as ModeSwatch, mode),
    secondary: pick(colors.labels.secondary as ModeSwatch, mode),
    tertiary: pick(colors.labels.tertiary as ModeSwatch, mode),
    quaternary: pick(colors.labels.quaternary as ModeSwatch, mode),
  },
  bg: {
    primary: pick(colors.backgrounds.primary as ModeSwatch, mode),
    secondary: pick(colors.backgrounds.secondary as ModeSwatch, mode),
    tertiary: pick(colors.backgrounds.tertiary as ModeSwatch, mode),
    elevated: pick(colors.backgrounds.secondaryElevated as ModeSwatch, mode),
  },
  grouped: {
    primary: pick(colors.backgroundsGrouped.primary as ModeSwatch, mode),
    secondary: pick(colors.backgroundsGrouped.secondary as ModeSwatch, mode),
    tertiary: pick(colors.backgroundsGrouped.tertiary as ModeSwatch, mode),
  },
  fill: {
    primary: pick(colors.fills.primary as ModeSwatch, mode),
    secondary: pick(colors.fills.secondary as ModeSwatch, mode),
    tertiary: pick(colors.fills.tertiary as ModeSwatch, mode),
    quaternary: pick(colors.fills.quaternary as ModeSwatch, mode),
  },
  separator: {
    opaque: pick(colors.separators.opaque as ModeSwatch, mode),
    nonOpaque: pick(colors.separators.nonOpaque as ModeSwatch, mode),
  },
  overlay: pick(colors.overlays.default as ModeSwatch, mode),
  gray: pick(colors.grays.gray as ModeSwatch, mode),
});

type TextStyle = { fontSize: number; lineHeight: number; letterSpacing: number };

/** MUI typography variant built from an iOS text style (Large Title, Body, …). */
export const textStyle = (
  name: keyof typeof typography.styles,
  fontWeight: number = 400,
) => {
  const s = typography.styles[name] as TextStyle;
  return {
    fontSize: s.fontSize,
    lineHeight: +(s.lineHeight / s.fontSize).toFixed(3),
    letterSpacing: `${s.letterSpacing}px`,
    fontWeight,
  };
};

export const IOS_FONT_FAMILY = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"SF Pro Text"',
  '"SF Pro"',
  'system-ui',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
].join(',');

/** Corner radii from the iOS 27 kit. */
export const iosRadius = {
  sm: spacing.radius.sm as number, // 8
  md: spacing.radius.md as number, // 10
  card: spacing.radius.semantic.card as number, // 12
  group: spacing.radius.xxxl as number, // 26 — inset grouped list
  menu: 20,
  alert: spacing.radius.semantic.alert as number, // 34
  sheet: spacing.radius.semantic.sheet.iphoneLargeTop as number, // 38
  pill: 9999,
};

/**
 * Liquid Glass "regular / medium" surface, driven by the --ios27-* CSS variables
 * so it follows light/dark mode and the iOS 27 transparency setting.
 */
export const liquidGlassSx = {
  backgroundColor:
    'rgba(var(--ios27-glass-me-rgb), calc(var(--ios27-glass-me-alpha) * calc(1.6 - 1.1 * var(--ios27-glass-transparency, 0.25))))',
  backgroundImage:
    'linear-gradient(var(--ios27-glass-me-overlay), var(--ios27-glass-me-overlay))',
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  boxShadow:
    'var(--ios27-glass-me-shadow), 0 0 0 var(--ios27-glass-rim-spread, 0.5px) var(--ios27-glass-rim)',
} as const;

/** Thick background material (bars, sheets, action sheets). */
export const thickMaterialSx = {
  backgroundColor:
    'rgba(var(--ios27-material-thick-rgb), var(--ios27-material-thick-alpha))',
  backgroundImage:
    'linear-gradient(var(--ios27-material-thick-overlay), var(--ios27-material-thick-overlay))',
  backdropFilter: 'blur(30px) saturate(180%)',
  WebkitBackdropFilter: 'blur(30px) saturate(180%)',
} as const;

/**
 * Small round button laid over a photo (favourite / menu / delete image /
 * camera controls). Thick material, so it stays readable on any picture and
 * follows light/dark mode (white glass in light, dark glass in dark).
 */
export const photoOverlayButtonSx = {
  ...thickMaterialSx,
  color: 'text.primary',
  boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
  '&:hover': {
    backgroundColor: thickMaterialSx.backgroundColor,
  },
} as const;

/** Chrome material (navigation bar). */
export const chromeMaterialSx = {
  backgroundColor:
    'rgba(var(--ios27-material-chrome-rgb), var(--ios27-material-chrome-alpha))',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
} as const;
