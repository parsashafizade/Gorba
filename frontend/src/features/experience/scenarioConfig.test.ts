import { describe, expect, it } from 'vitest';
import { buttonScales } from './interactionMath';
import { noConversationFor, noConversationLength } from './scenarioConfig';

describe('No conversation cycle', () => {
  it('cycles the line and matching emotion after the late reaction', () => {
    const firstCycle = Array.from({ length: noConversationLength }, (_, index) =>
      noConversationFor('raise', index + 1),
    );

    expect(firstCycle.map((item) => item.reactionKey)).toEqual([
      'raise.reactions.no1',
      'raise.reactions.no2',
      'raise.reactions.no3',
      'raise.reactions.no4',
      'raise.reactions.no5',
      'raise.reactions.noLate',
    ]);
    expect(noConversationFor('raise', 7)).toMatchObject({
      reactionKey: 'raise.reactions.no1',
      recipientKey: 'raise.recipient.no1',
      emotion: 'emotion.sadSoft',
    });
    expect(noConversationFor('raise', 8)).toMatchObject({
      reactionKey: 'raise.reactions.no2',
      emotion: 'emotion.sadPleading',
    });
  });

  it('does not reset button mechanics when the conversation wraps', () => {
    expect(buttonScales(noConversationLength + 1)).toEqual({ no: 0.72, yes: 1.54 });
  });
});
