import type {
  CompletedResult,
  DateVibe,
  HireOffer,
  HireRole,
  RaiseAmount,
  RaiseTiming,
  ScenarioId,
} from '../../../../shared/results';
import type { ContextualEffectId } from './contextualEffects';
import type { MascotEmotion } from './model';

export type InteractionEvent =
  | {
      type: 'scenario.switch';
      scenario: ScenarioId;
      from: ScenarioId;
      to: ScenarioId;
    }
  | {
      type: 'answer.accepted';
      scenario: ScenarioId;
    }
  | {
      type: 'answer.no';
      scenario: ScenarioId;
      attempt: number;
      recipientKey: `${ScenarioId}.recipient.${string}`;
    }
  | {
      type: 'raise.amount';
      scenario: 'raise';
      value: RaiseAmount;
    }
  | {
      type: 'raise.timing';
      scenario: 'raise';
      value: RaiseTiming;
    }
  | {
      type: 'hire.role';
      scenario: 'hire';
      value: HireRole;
    }
  | {
      type: 'hire.offer';
      scenario: 'hire';
      value: HireOffer;
    }
  | {
      type: 'date.vibe';
      scenario: 'date';
      value: DateVibe;
    }
  | {
      type: 'date.day';
      scenario: 'date';
      value: string;
    }
  | {
      type: 'date.time';
      scenario: 'date';
      value: string;
    }
  | {
      type: 'scenario.completed';
      scenario: ScenarioId;
      result: CompletedResult;
    };

export type RecordedInteraction = InteractionEvent & {
  id: number;
  run: number;
  at: number;
};

export type PendingInteractionCue = {
  token: number;
  scenario: ScenarioId;
  reactionKey?: string;
  emotion?: MascotEmotion;
  effectId?: ContextualEffectId;
};

export type InteractionHistory = {
  currentScenario: ScenarioId;
  runs: Record<ScenarioId, number>;
  events: readonly RecordedInteraction[];
  triggeredRuleKeys: readonly string[];
  pendingCues: readonly PendingInteractionCue[];
  nextEventId: number;
};

export const createInteractionHistory = (initialScenario: ScenarioId): InteractionHistory => ({
  currentScenario: initialScenario,
  runs: {
    raise: initialScenario === 'raise' ? 1 : 0,
    hire: initialScenario === 'hire' ? 1 : 0,
    date: initialScenario === 'date' ? 1 : 0,
  },
  events: [],
  triggeredRuleKeys: [],
  pendingCues: [],
  nextEventId: 1,
});

export const appendInteraction = (
  history: InteractionHistory,
  event: InteractionEvent,
): { history: InteractionHistory; event: RecordedInteraction } => {
  const isSwitch = event.type === 'scenario.switch';
  const runs = isSwitch
    ? { ...history.runs, [event.to]: history.runs[event.to] + 1 }
    : history.runs;
  const run = runs[event.scenario];
  const recorded = { ...event, id: history.nextEventId, run, at: Date.now() } as RecordedInteraction;

  return {
    event: recorded,
    history: {
      ...history,
      currentScenario: isSwitch ? event.to : history.currentScenario,
      runs,
      events: [...history.events, recorded].slice(-160),
      pendingCues: isSwitch ? [] : history.pendingCues,
      nextEventId: history.nextEventId + 1,
    },
  };
};

export const interactionsForCurrentRun = (
  history: InteractionHistory,
  scenario: ScenarioId,
): readonly RecordedInteraction[] => {
  const run = history.runs[scenario];
  return history.events.filter((event) => event.scenario === scenario && event.run === run);
};

export const latestNoAttempt = (history: InteractionHistory, scenario: ScenarioId) => {
  const noEvents = interactionsForCurrentRun(history, scenario).filter(
    (event): event is RecordedInteraction & Extract<InteractionEvent, { type: 'answer.no' }> =>
      event.type === 'answer.no',
  );
  return noEvents.at(-1)?.attempt ?? 0;
};

export const sawRecipientLine = (
  history: InteractionHistory,
  scenario: ScenarioId,
  suffix: string,
) =>
  interactionsForCurrentRun(history, scenario).some(
    (event) => event.type === 'answer.no' && event.recipientKey.endsWith(`.${suffix}`),
  );

export const selectedInCurrentRun = <T extends InteractionEvent['type']>(
  history: InteractionHistory,
  scenario: ScenarioId,
  type: T,
): (RecordedInteraction & Extract<InteractionEvent, { type: T }>) | undefined =>
  interactionsForCurrentRun(history, scenario)
    .filter((event) => event.type === type)
    .at(-1) as (RecordedInteraction & Extract<InteractionEvent, { type: T }>) | undefined;
