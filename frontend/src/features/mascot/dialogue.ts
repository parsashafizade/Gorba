export const reactionPlacements = ['anchored'] as const;

export type ReactionPlacement = (typeof reactionPlacements)[number];

export function reactionPlacementFor(turn: number): ReactionPlacement {
  return reactionPlacements[Math.max(0, turn - 1) % reactionPlacements.length];
}
