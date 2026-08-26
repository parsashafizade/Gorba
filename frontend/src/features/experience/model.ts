export type { ScenarioId, ScenarioSelections } from '../../../../shared/results';
export type ExperienceStep = 1 | 2 | 3 | 4;

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
