import { Easing } from "remotion";

/** Jaza SDK-aligned tokens for the Nuru demo reel */
export const colors = {
  background: "#121414",
  surface: "#121414",
  surfaceContainer: "#1e2020",
  surfaceContainerLow: "#1a1c1c",
  surfaceContainerHigh: "#282a2b",
  onSurface: "#e2e2e2",
  onSurfaceVariant: "#bacac5",
  primary: "#57f1db",
  primaryContainer: "#2dd4bf",
  onPrimaryContainer: "#003731",
  outline: "#859490",
  outlineVariant: "#3c4a46",
  success: "#45dfa4",
  bundleBorder: "#262626",
  bundleBorderSelected: "#2dd4bf",
  phoneBezel: "#1a1c1c",
  phoneRim: "#3a3d3d",
  mutedDim: "#6b7572",
} as const;

export const FPS = 30;
/** ~12 seconds */
export const DURATION_FRAMES = 360;

export const WIDTH = 1080;
export const HEIGHT = 1920;

/**
 * Scale RN logical points (~390pt content) → Remotion phone content (~920px).
 * RN spacing.md=16 → ~38, radius.xl=16 → ~38, etc.
 */
export const S = 2.35;

export const spacing = {
  xs: Math.round(4 * S),
  sm: Math.round(8 * S),
  md: Math.round(16 * S),
  lg: Math.round(24 * S),
  xl: Math.round(40 * S),
  gutter: Math.round(20 * S),
} as const;

export const radius = {
  md: Math.round(8 * S),
  lg: Math.round(12 * S),
  xl: Math.round(16 * S),
  full: 9999,
} as const;

export const type = {
  label: Math.round(14 * S),
  body: Math.round(16 * S),
  title: Math.round(24 * S),
  balance: Math.round(48 * S),
  appName: Math.round(14 * S),
  greeting: Math.round(28 * S),
} as const;

export const iconSize = {
  bolt: Math.round(28 * S),
  boltSm: Math.round(16 * S),
  lock: Math.round(18 * S),
  back: Math.round(22 * S),
  check: Math.round(28 * S),
  chevron: Math.round(24 * S),
} as const;

/** Soft exit used across the reel (remotion-markup timing skill) */
export const easeOutSoft = Easing.bezier(0.16, 1, 0.3, 1);
export const easeSpring = Easing.spring({ damping: 200 });

/** Timeline phase starts (inclusive) at 30fps */
export const phases = {
  homeIdle: 0,
  tap: 45,
  sheetOffer: 60,
  selectMedium: 105,
  continueTap: 140,
  payment: 155,
  typing: 175,
  buyTap: 230,
  processing: 245,
  success: 285,
  doneTap: 310,
  homeUpdated: 325,
  end: DURATION_FRAMES,
} as const;

export const font =
  'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
