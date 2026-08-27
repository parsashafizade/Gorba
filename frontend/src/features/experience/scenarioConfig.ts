import type { ChoiceOption, MascotEmotion, PlayfulOption, ScenarioId } from './model';

export const secondaryChoices: Record<ScenarioId, ChoiceOption[]> = {
  raise: [
    { id: 'five', emotion: 'emotion.sadSoft', reactionKey: 'raise.reactions.amount5' },
    { id: 'ten', emotion: 'emotion.sadPleading', reactionKey: 'raise.reactions.amount10' },
    { id: 'twenty', emotion: 'emotion.happySoft', reactionKey: 'raise.reactions.amount20' },
    { id: 'thirty', emotion: 'emotion.happyExcited', reactionKey: 'raise.reactions.amount30' },
  ],
  hire: [
    {
      id: 'member',
      emotion: 'emotion.happySoft',
      reactionKey: 'hire.reactions.member1',
      reactionKeys: [
        'hire.reactions.member1',
        'hire.reactions.member2',
        'hire.reactions.member3',
      ],
    },
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
      reactionKey: 'date.reactions.surprise1',
      reactionKeys: ['date.reactions.surprise1', 'date.reactions.surprise2'],
    },
  ],
};

export const tertiaryChoices: Record<'raise' | 'hire', ChoiceOption[]> = {
  raise: [
    { id: 'next', emotion: 'emotion.happyExcited', reactionKey: 'raise.reactions.today' },
    { id: 'month', emotion: 'emotion.happySoft', reactionKey: 'raise.reactions.nextWeek' },
  ],
  hire: [
    { id: 'cute', emotion: 'emotion.sadSoft', reactionKey: 'hire.reactions.offerLow' },
    { id: 'talk', emotion: 'emotion.happySoft', reactionKey: 'hire.reactions.offerMedium' },
    { id: 'sign', emotion: 'emotion.happyExcited', reactionKey: 'hire.reactions.offerHigh' },
  ],
};

export const raiseTimingDecoys: readonly PlayfulOption[] = [
  { id: 'approval', labelKey: 'raise.timing.decoys.approval' },
  { id: 'whenever', labelKey: 'raise.timing.decoys.whenever' },
];

type ConversationLine = {
  suffix: string;
  emotion: MascotEmotion;
};

const noConversationSequences: Record<ScenarioId, readonly ConversationLine[]> = {
  raise: [
    { suffix: 'no1', emotion: 'emotion.sadSoft' },
    { suffix: 'no2', emotion: 'emotion.sadPleading' },
    { suffix: 'no3', emotion: 'emotion.sadPleading' },
    { suffix: 'no4', emotion: 'emotion.angryPouty' },
    { suffix: 'no5', emotion: 'emotion.happySoft' },
    { suffix: 'noLate', emotion: 'emotion.sadPleading' },
  ],
  hire: [
    { suffix: 'no1', emotion: 'emotion.sadSoft' },
    { suffix: 'no2', emotion: 'emotion.sadPleading' },
    { suffix: 'no3', emotion: 'emotion.sadPleading' },
    { suffix: 'no4', emotion: 'emotion.angryPouty' },
    { suffix: 'no5', emotion: 'emotion.happySoft' },
    { suffix: 'no6', emotion: 'emotion.happyExcited' },
    { suffix: 'no7', emotion: 'emotion.angryPouty' },
    { suffix: 'no8', emotion: 'emotion.happySoft' },
    { suffix: 'no9', emotion: 'emotion.happyExcited' },
    { suffix: 'no10', emotion: 'emotion.happySoft' },
    { suffix: 'no11', emotion: 'emotion.sadPleading' },
  ],
  date: [
    { suffix: 'no1', emotion: 'emotion.sadPleading' },
    { suffix: 'no2', emotion: 'emotion.happySoft' },
    { suffix: 'no3', emotion: 'emotion.sadSoft' },
    { suffix: 'no4', emotion: 'emotion.happySoft' },
    { suffix: 'no5', emotion: 'emotion.happySoft' },
    { suffix: 'no6', emotion: 'emotion.happyExcited' },
    { suffix: 'no7', emotion: 'emotion.happySoft' },
    { suffix: 'no8', emotion: 'emotion.happyExcited' },
    { suffix: 'no9', emotion: 'emotion.sadSoft' },
    { suffix: 'no10', emotion: 'emotion.happySoft' },
    { suffix: 'no11', emotion: 'emotion.happyExcited' },
  ],
};

const fallbackNoReactionCounts: Record<ScenarioId, number> = {
  raise: 9,
  hire: 10,
  date: 5,
};

export const noConversationFor = (scenario: ScenarioId, attempt: number) => {
  const sequence = noConversationSequences[scenario];
  const normalizedAttempt = Math.max(1, attempt);
  const index = (normalizedAttempt - 1) % sequence.length;
  const item = sequence[index];
  const fallbackIndex = normalizedAttempt - sequence.length * 2 - 1;
  const reactionKey =
    fallbackIndex >= 0
      ? `${scenario}.reactions.noPool${(fallbackIndex % fallbackNoReactionCounts[scenario]) + 1}`
      : `${scenario}.reactions.${item.suffix}`;

  return {
    cycleIndex: index,
    reactionKey,
    recipientKey: `${scenario}.recipient.${item.suffix}`,
    recipientLabelKey: `${scenario}.recipient.label`,
    emotion: item.emotion,
  } as const;
};

const yesReactionKeys: Record<ScenarioId, readonly string[]> = {
  raise: ['raise.reactions.yes'],
  hire: ['hire.reactions.yes1', 'hire.reactions.yes2'],
  date: ['date.reactions.yes'],
};

export const yesReactionFor = (scenario: ScenarioId, seed: number) => {
  const keys = yesReactionKeys[scenario];
  return keys[Math.abs(seed) % keys.length];
};

const finalSpeechKeys: Record<ScenarioId, readonly string[]> = {
  raise: ['raise.final.speech'],
  hire: ['hire.final.speech', 'hire.final.speech2'],
  date: ['date.final.speech', 'date.final.speech2'],
};

export const finalSpeechFor = (scenario: ScenarioId, seed: number) => {
  const keys = finalSpeechKeys[scenario];
  return keys[Math.abs(seed) % keys.length];
};

export const choiceReactionFor = (option: ChoiceOption, seed: number) => {
  const keys = option.reactionKeys ?? [option.reactionKey];
  return keys[Math.abs(seed) % keys.length];
};

export const dateTimeReactionFor = (time: string) => {
  const hour = Number(time.slice(0, 2));
  if (hour === 0) return 'date.reactions.timeMidnight';
  if (hour >= 5 && hour <= 9) return 'date.reactions.timeEarly';
  if (hour >= 10 && hour <= 13) return 'date.reactions.timeNoon';
  if (hour >= 14 && hour <= 20) return 'date.reactions.timeAfternoon';
  return 'date.reactions.timeNight';
};

export const noConversationLength = noConversationSequences.raise.length;
export const noConversationLengthFor = (scenario: ScenarioId) =>
  noConversationSequences[scenario].length;
