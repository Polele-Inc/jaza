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
