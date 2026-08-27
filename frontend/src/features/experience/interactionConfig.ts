export const interactionBehavior = {
  reaction: {
    baseHoldMs: 1520,
    longLineThreshold: 30,
    perExtraCharacterMs: 14,
    maximumHoldMs: 2080,
    recipientLeadMs: 330,
  },
  buttons: {
    noScaleStep: 0.1,
    noMinimumScale: 0.72,
    yesScaleStep: 0.14,
    yesMaximumScale: 1.54,
    randomMovementMargin: 14,
  },
} as const;

export const reactionHoldMs = (text: string) => {
  const extraCharacters = Math.max(
    0,
    [...text].length - interactionBehavior.reaction.longLineThreshold,
  );
  return Math.min(
    interactionBehavior.reaction.maximumHoldMs,
    interactionBehavior.reaction.baseHoldMs +
      extraCharacters * interactionBehavior.reaction.perExtraCharacterMs,
  );
};
