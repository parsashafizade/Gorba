import type { MascotAssetKey } from './assets';

export const mascotBehavior = {
  stageAspectRatio: 2 / 3,
  crossfade: { gaze: 0.12, emotion: 0.2 },
  movement: {
    gaze: { type: 'tween' as const, duration: 0.075, ease: 'easeOut' as const },
    emotion: { type: 'spring' as const, stiffness: 250, damping: 24, mass: 0.7 },
  },
  gazeDeadZone: 34,
  gazeHysteresis: 12,
  blink: { minimumDelay: 3800, variance: 3200, halfMs: 82, closedMs: 94 },
  companionScale: 0.72,
} as const;

export const assetMotion: Partial<
  Record<MascotAssetKey, { x: number; y: number; rotate: number }>
> = {
  'gaze.left': { x: -8, y: 0, rotate: -0.3 },
  'gaze.right': { x: 8, y: 0, rotate: 0.3 },
  'gaze.up': { x: 0, y: -6, rotate: 0 },
  'gaze.down': { x: 0, y: 6, rotate: 0 },
  'gaze.upLeft': { x: -7, y: -5, rotate: -0.45 },
  'gaze.upRight': { x: 7, y: -5, rotate: 0.45 },
  'gaze.downLeft': { x: -7, y: 5, rotate: -0.3 },
  'gaze.downRight': { x: 7, y: 5, rotate: 0.3 },
  'idle.headTilt': { x: 1, y: 1, rotate: 0.7 },
  'emotion.sadPleading': { x: 0, y: 2, rotate: -0.2 },
  'emotion.happyExcited': { x: 0, y: -2, rotate: 0.35 },
};
