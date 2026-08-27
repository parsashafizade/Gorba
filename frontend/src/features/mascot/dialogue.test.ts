import { describe, expect, it } from 'vitest';
import { reactionPlacementFor, reactionPlacements } from './dialogue';

describe('kitten reaction placement sequence', () => {
  it('uses every curated placement before cycling', () => {
    expect(reactionPlacements.map((_, index) => reactionPlacementFor(index + 1))).toEqual(
      reactionPlacements,
    );
    expect(reactionPlacementFor(reactionPlacements.length + 1)).toBe(reactionPlacements[0]);
  });

  it('alternates sides and never repeats an exact placement back-to-back', () => {
    const twoCycles = Array.from({ length: reactionPlacements.length * 2 }, (_, index) =>
      reactionPlacementFor(index + 1),
    );

    for (let index = 1; index < twoCycles.length; index += 1) {
      expect(twoCycles[index]).not.toBe(twoCycles[index - 1]);
      expect(twoCycles[index].endsWith('left')).not.toBe(twoCycles[index - 1].endsWith('left'));
    }
  });
});
