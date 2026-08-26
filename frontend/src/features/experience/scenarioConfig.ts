import type { ChoiceOption, ScenarioId } from './model';

export const secondaryChoices: Record<ScenarioId, ChoiceOption[]> = {
  raise: [
    { id: 'five', emotion: 'emotion.sadSoft', reactionKey: 'raise.reactions.amount5' },
    { id: 'ten', emotion: 'emotion.sadPleading', reactionKey: 'raise.reactions.amount10' },
    { id: 'twenty', emotion: 'emotion.happySoft', reactionKey: 'raise.reactions.amount20' },
    { id: 'thirty', emotion: 'emotion.happyExcited', reactionKey: 'raise.reactions.amount30' },
  ],
  hire: [
    { id: 'member', emotion: 'emotion.happySoft', reactionKey: 'hire.reactions.member' },
    { id: 'specialist', emotion: 'emotion.happySoft', reactionKey: 'hire.reactions.specialist' },
    { id: 'lead', emotion: 'emotion.happyExcited', reactionKey: 'hire.reactions.lead' },
  ],
  date: [
    { id: 'cafe', icon: '☕', emotion: 'emotion.happySoft', reactionKey: 'date.reactions.cafe' },
    {
      id: 'dessert',
      icon: '🍰',
      emotion: 'emotion.happyExcited',
      reactionKey: 'date.reactions.dessert',
    },
    {
      id: 'sunset',
      icon: '🌅',
      emotion: 'emotion.happySoft',
      reactionKey: 'date.reactions.sunset',
    },
    { id: 'movie', icon: '🎬', emotion: 'emotion.happySoft', reactionKey: 'date.reactions.movie' },
    {
      id: 'surprise',
      icon: '✨',
      emotion: 'emotion.happyExcited',
      reactionKey: 'date.reactions.surprise',
    },
  ],
};

export const tertiaryChoices: Record<'raise' | 'hire', ChoiceOption[]> = {
  raise: [
    { id: 'next', emotion: 'emotion.happyExcited', reactionKey: 'raise.reactions.timing' },
    { id: 'month', emotion: 'emotion.happySoft', reactionKey: 'raise.reactions.timing' },
    { id: 'meeting', emotion: 'emotion.happySoft', reactionKey: 'raise.reactions.timing' },
    { id: 'surprise', emotion: 'emotion.happyExcited', reactionKey: 'raise.reactions.timing' },
  ],
  hire: [
    { id: 'cute', emotion: 'emotion.sadSoft', reactionKey: 'hire.reactions.offerCute' },
    { id: 'talk', emotion: 'emotion.happySoft', reactionKey: 'hire.reactions.offerTalk' },
    { id: 'sign', emotion: 'emotion.happyExcited', reactionKey: 'hire.reactions.offerSign' },
  ],
};

const noConversationSequence = [
  { suffix: 'no1', emotion: 'emotion.sadSoft' },
  { suffix: 'no2', emotion: 'emotion.sadPleading' },
  { suffix: 'no3', emotion: 'emotion.sadPleading' },
  { suffix: 'no4', emotion: 'emotion.sadPleading' },
  { suffix: 'no5', emotion: 'emotion.angryPouty' },
  { suffix: 'noLate', emotion: 'emotion.angryPouty' },
] as const;

export const noConversationFor = (scenario: ScenarioId, attempt: number) => {
  const index =
    (((Math.max(1, attempt) - 1) % noConversationSequence.length) + noConversationSequence.length) %
    noConversationSequence.length;
  const item = noConversationSequence[index];
  return {
    cycleIndex: index,
    reactionKey: `${scenario}.reactions.${item.suffix}`,
    recipientKey: `${scenario}.recipient.${item.suffix}`,
    recipientLabelKey: `${scenario}.recipient.label`,
    emotion: item.emotion,
  } as const;
};

export const noConversationLength = noConversationSequence.length;
