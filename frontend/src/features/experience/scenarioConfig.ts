import type { ChoiceOption, ScenarioId } from './model';

export const scenarioRoutes: Record<ScenarioId, string> = {
  raise: '/raise',
  hire: '/hire',
  date: '/date',
};

export const scenarioFromPath = (pathname: string): ScenarioId => {
  if (pathname.startsWith('/hire')) return 'hire';
  if (pathname.startsWith('/date')) return 'date';
  return 'raise';
};

export const scenarioDecorations: Record<ScenarioId, string[]> = {
  raise: ['↗', '¢', '☕', '+', '✦', '▤'],
  hire: ['✦', '★', '⌁', '✓', '▣', '↗'],
  date: ['♡', '✦', '❀', '☕', '⋆', '♥'],
};

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

export const noReactionFor = (scenario: ScenarioId, attempt: number) => {
  const suffix = attempt === 1 ? 'no1' : attempt === 2 ? 'no2' : attempt === 3 ? 'no3' : 'noLate';
  return `${scenario}.reactions.${suffix}`;
};

export const noEmotionFor = (attempt: number) => {
  if (attempt === 1) return 'emotion.sadSoft' as const;
  if (attempt <= 3) return 'emotion.sadPleading' as const;
  return 'emotion.angryPouty' as const;
};
