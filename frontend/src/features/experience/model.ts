export type ScenarioId = 'raise' | 'hire' | 'date';
export type ExperienceStep = 1 | 2 | 3 | 4;

export type ScenarioSelections = {
  amount?: 'five' | 'ten' | 'twenty' | 'thirty';
  timing?: 'next' | 'month' | 'meeting' | 'surprise';
  role?: 'member' | 'specialist' | 'lead';
  offer?: 'cute' | 'talk' | 'sign';
  vibe?: 'cafe' | 'dessert' | 'sunset' | 'movie' | 'surprise';
  date?: string;
  time?: string;
};

export type MascotEmotion =
  | 'gaze.center'
  | 'emotion.sadSoft'
  | 'emotion.sadPleading'
  | 'emotion.angryPouty'
  | 'emotion.happySoft'
  | 'emotion.happyExcited';

export type ChoiceOption = {
  id: string;
  icon?: string;
  emotion: MascotEmotion;
  reactionKey: string;
};
