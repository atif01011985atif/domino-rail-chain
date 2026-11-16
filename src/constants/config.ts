import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export { SCREEN_W, SCREEN_H };

/** Splash length. Must stay at 8000 - shorter races the screenshot gate. */
export const LOADER_DURATION_MS = 8000;

/** True on short devices (320x640 class). Drives the compact control budget. */
export const COMPACT = SCREEN_H < 700;

/** Fixed vertical regions - no ScrollView is ever the screen wrapper. */
export const TOP_RESERVE = 44;
export const HEADER_H = 72;
export const GOAL_STRIP_H = 24;
export const BOTTOM_INSET = 16;
/** Tray + tools + CTA + gaps + panel padding, measured against the real panel. */
export const CONTROLS_H = COMPACT ? 204 : 224;

/** Logical board. Always 5 x 4, on every device. */
export const COLS = 5;
export const ROWS = 4;

/** Board frame = padding + border on each side. */
export const BOARD_PAD = 6;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER;

export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);

const BOARD_MAX_H =
  SCREEN_H - TOP_RESERVE - HEADER_H - GOAL_STRIP_H - CONTROLS_H - BOTTOM_INSET - 24;

export const CELL = Math.max(
  44,
  Math.floor(
    Math.min(
      (BOARD_MAX_W - 2 * BOARD_FRAME) / COLS,
      (BOARD_MAX_H - 2 * BOARD_FRAME) / ROWS,
    ),
  ),
);

export const BOARD_W = CELL * COLS + 2 * BOARD_FRAME;
export const BOARD_H = CELL * ROWS + 2 * BOARD_FRAME;

/** The replay panel is taller than the editor panel, so its board is sized apart. */
export const REPLAY_PANEL_H = 262;

const REPLAY_MAX_H =
  SCREEN_H - TOP_RESERVE - HEADER_H - GOAL_STRIP_H - REPLAY_PANEL_H - BOTTOM_INSET - 56;

export const REPLAY_CELL = Math.max(
  36,
  Math.min(CELL, Math.floor((REPLAY_MAX_H - 2 * BOARD_FRAME) / ROWS)),
);

/** Campaign shape. */
export const LEVEL_COUNT = 110;
export const PACK_SIZE = 10;
export const PACK_COUNT = 11;
export const UNDO_LIMIT = 30;

/** Mechanism activation durations, in simulated milliseconds. */
export const ACTIVATION_MS = {
  domino: 180,
  corner: 200,
  fork: 220,
  ramp: 240,
  bridge: 240,
} as const;

export const BELL_BOUNCE_MS = 200;
export const SETTLE_MS = 300;
export const RUN_CEILING_MS = 12000;

/** Replay speeds. */
export const SPEEDS = [1, 0.5, 0.25] as const;
export type Speed = (typeof SPEEDS)[number];

/** Animation timing. */
export const ANIM = {
  fast: 150,
  base: 180,
  ui: 200,
  enter: 220,
  spring: { tension: 180, friction: 16 },
} as const;
