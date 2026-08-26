import { describe, expect, it } from 'vitest';
import { mapPointerToGaze } from './gaze';

describe('3×3 gaze mapping', () => {
  const center = { x: 100, y: 100 };

  it.each([
    [{ x: 100, y: 100 }, 'gaze.center'],
    [{ x: 35, y: 100 }, 'gaze.left'],
    [{ x: 165, y: 100 }, 'gaze.right'],
    [{ x: 100, y: 35 }, 'gaze.up'],
    [{ x: 100, y: 165 }, 'gaze.down'],
    [{ x: 35, y: 35 }, 'gaze.upLeft'],
    [{ x: 165, y: 35 }, 'gaze.upRight'],
    [{ x: 35, y: 165 }, 'gaze.downLeft'],
    [{ x: 165, y: 165 }, 'gaze.downRight'],
  ] as const)('maps %o to %s', (point, expected) => {
    expect(mapPointerToGaze(point, center)).toBe(expected);
  });

  it('keeps a center dead zone and hysteresis near a prior direction', () => {
    expect(mapPointerToGaze({ x: 71, y: 100 }, center, 'gaze.center')).toBe('gaze.center');
    expect(mapPointerToGaze({ x: 75, y: 100 }, center, 'gaze.left')).toBe('gaze.left');
    expect(mapPointerToGaze({ x: 80, y: 100 }, center, 'gaze.left')).toBe('gaze.center');
  });
});
