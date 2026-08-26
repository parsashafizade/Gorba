import type { MascotAssetKey } from './assets';

export const mascotBehavior = {
  stageAspectRatio: 2 / 3,
  crossfade: { gaze: 0.15, emotion: 0.2 },
  spring: { stiffness: 250, damping: 24, mass: 0.7 },
  gazeDeadZone: 34,
  gazeHysteresis: 12,
  blink: { minimumDelay: 3800, variance: 3200, halfMs: 82, closedMs: 94 },
  idleHintDelay: 5400,
  companionScale: 0.72,
  noMinimumScale: 0.6,
  yesMaximumScale: 1.36,
  randomMovementMargin: 12,
} as const;

export const assetMotion: Partial<
  Record<MascotAssetKey, { x: number; y: number; rotate: number }>
> = {
  'gaze.left': { x: -3, y: 0, rotate: -0.35 },
  'gaze.right': { x: 3, y: 0, rotate: 0.35 },
  'gaze.up': { x: 0, y: -3, rotate: 0 },
  'gaze.down': { x: 0, y: 2, rotate: 0 },
  'gaze.upLeft': { x: -3, y: -2, rotate: -0.5 },
  'gaze.upRight': { x: 3, y: -2, rotate: 0.5 },
  'gaze.downLeft': { x: -3, y: 2, rotate: -0.35 },
  'gaze.downRight': { x: 3, y: 2, rotate: 0.35 },
  'idle.headTilt': { x: 1, y: 1, rotate: 0.7 },
  'emotion.sadPleading': { x: 0, y: 2, rotate: -0.2 },
  'emotion.happyExcited': { x: 0, y: -2, rotate: 0.35 },
};
