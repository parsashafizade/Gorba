import { describe, expect, it } from 'vitest';
import { interactionBehavior, reactionHoldMs } from './interactionConfig';

describe('readable reaction timing', () => {
  it('keeps short reactions visible for a readable base hold', () => {
    expect(reactionHoldMs('Tiny reaction')).toBe(interactionBehavior.reaction.baseHoldMs);
    expect(reactionHoldMs('Tiny reaction')).toBeGreaterThanOrEqual(1300);
  });

  it('gives longer lines more time without exceeding the product cap', () => {
    const normal = reactionHoldMs('A slightly longer kitten reaction for reading');
    const maximum = reactionHoldMs('x'.repeat(300));

    expect(normal).toBeGreaterThan(interactionBehavior.reaction.baseHoldMs);
    expect(maximum).toBe(interactionBehavior.reaction.maximumHoldMs);
    expect(maximum).toBeLessThanOrEqual(2200);
  });
});
