import { describe, expect, it } from 'vitest';
import { buttonScales, findSafeNoPosition } from './interactionMath';

const sequence = (values: number[]) => {
  let index = 0;
  return () => values[index++ % values.length];
};

describe('progressive answer scaling', () => {
  it('shrinks No and grows Yes within shared caps', () => {
    expect(buttonScales(0)).toEqual({ no: 1, yes: 1 });
    expect(buttonScales(2)).toEqual({ no: 0.8, yes: 1.16 });
    expect(buttonScales(99)).toEqual({ no: 0.6, yes: 1.36 });
  });
});

describe('bounded No positioning', () => {
  it('stays inside the container and avoids Yes', () => {
    const position = findSafeNoPosition({
      container: { x: 0, y: 0, width: 640, height: 250 },
      button: { width: 92, height: 56 },
      forbidden: [{ x: 210, y: 92, width: 170, height: 68 }],
      random: sequence([0.45, 0.45, 0.9, 0.9, 0.05, 0.1, 0.8, 0.15]),
    });

    expect(position.x).toBeGreaterThanOrEqual(12);
    expect(position.y).toBeGreaterThanOrEqual(8.75);
    expect(position.x + 92).toBeLessThanOrEqual(628);
    expect(position.y + 56).toBeLessThanOrEqual(241.25);
    const overlapsYes =
      position.x < 394 && position.x + 92 > 196 && position.y < 174 && position.y + 56 > 78;
    expect(overlapsYes).toBe(false);
  });

  it('finds a different region and remains valid in narrow containers', () => {
    const previous = { x: 16, y: 16 };
    const position = findSafeNoPosition({
      container: { x: 0, y: 0, width: 240, height: 210 },
      button: { width: 76, height: 50 },
      forbidden: [{ x: 72, y: 74, width: 102, height: 62 }],
      previous,
      random: sequence([0.9, 0.85, 0.1, 0.85, 0.9, 0.1, 0.05, 0.08]),
    });

    expect(position.x).toBeGreaterThanOrEqual(8.4);
    expect(position.x + 76).toBeLessThanOrEqual(231.6);
    expect(position.y + 50).toBeLessThanOrEqual(201.6);
    expect(Math.hypot(position.x - previous.x, position.y - previous.y)).toBeGreaterThan(70);
  });
});
