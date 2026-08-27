import { describe, expect, it } from 'vitest';
import {
  buttonScales,
  findSafeNoPosition,
  noZones,
  takeNextNoZone,
  type NoZone,
} from './interactionMath';

const sequence = (values: number[]) => {
  let index = 0;
  return () => values[index++ % values.length];
};

describe('progressive answer scaling', () => {
  it('grows Yes quickly while both controls respect their caps', () => {
    expect(buttonScales(0)).toEqual({ no: 1, yes: 1 });
    expect(buttonScales(1)).toEqual({ no: 0.9, yes: 1.14 });
    expect(buttonScales(2)).toEqual({ no: 0.8, yes: 1.28 });
    expect(buttonScales(3)).toEqual({ no: 0.72, yes: 1.42 });
    expect(buttonScales(99)).toEqual({ no: 0.72, yes: 1.54 });
  });
});

describe('directional No positioning', () => {
  it('visits all eight zones before refilling and never repeats either recent zone', () => {
    let bag: NoZone[] = [];
    let recent: NoZone[] = [];
    const visited: NoZone[] = [];
    const random = sequence([0.13, 0.91, 0.28, 0.74, 0.42, 0.06, 0.61, 0.35]);

    for (let index = 0; index < 12; index += 1) {
      const result = takeNextNoZone({ bag, recent, random });
      if (recent.length > 0) expect(result.zone).not.toBe(recent.at(-1));
      if (recent.length > 1) expect(result.zone).not.toBe(recent.at(-2));
      visited.push(result.zone);
      bag = result.bag;
      recent = [...recent.slice(-1), result.zone];
    }

    expect(new Set(visited.slice(0, 8))).toEqual(new Set(noZones));
    expect(new Set(visited).size).toBeGreaterThanOrEqual(7);
  });

  it.each(noZones)('keeps %s inside the arena and clear of Yes', (zone) => {
    const button = { width: 92, height: 56 };
    const yes = { x: 220, y: 88, width: 200, height: 78 };
    const position = findSafeNoPosition({
      container: { x: 0, y: 0, width: 640, height: 250 },
      button,
      forbidden: [yes],
      zone,
      random: sequence([0.45, 0.45, 0.9, 0.9, 0.05, 0.1, 0.8, 0.15]),
    });

    expect(position.x).toBeGreaterThanOrEqual(14);
    expect(position.y).toBeGreaterThanOrEqual(14);
    expect(position.x + button.width).toBeLessThanOrEqual(626);
    expect(position.y + button.height).toBeLessThanOrEqual(236);
    const overlapsYes =
      position.x < yes.x + yes.width &&
      position.x + button.width > yes.x &&
      position.y < yes.y + yes.height &&
      position.y + button.height > yes.y;
    expect(overlapsYes).toBe(false);
  });

  it('remains bounded and tappable in a narrow mobile arena', () => {
    const position = findSafeNoPosition({
      container: { x: 0, y: 0, width: 240, height: 210 },
      button: { width: 76, height: 50 },
      forbidden: [{ x: 69, y: 72, width: 108, height: 66 }],
      zone: 'bottomRight',
      previous: { x: 16, y: 16 },
      random: sequence([0.9, 0.85, 0.1, 0.85, 0.9, 0.1, 0.05, 0.08]),
    });

    expect(position.x).toBeGreaterThanOrEqual(8);
    expect(position.x + 76).toBeLessThanOrEqual(232);
    expect(position.y + 50).toBeLessThanOrEqual(202);
  });
});
