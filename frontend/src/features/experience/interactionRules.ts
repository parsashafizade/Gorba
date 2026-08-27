import { scenarioIds, type ScenarioId } from '../../../../shared/results';
import type { ContextualEffectId } from './contextualEffects';
import {
  latestNoAttempt,
  selectedInCurrentRun,
  type InteractionEvent,
  type InteractionHistory,
  type RecordedInteraction,
} from './interactionMemory';
import type { MascotEmotion } from './model';

type RuleKind = 'callback' | 'contextual-effect' | 'easter-egg';
type RuleScope = 'run' | 'session';

type InteractionRule = {
  id: string;
  kind: RuleKind;
  on: InteractionEvent['type'];
  scenarios?: readonly ScenarioId[];
  priority: number;
  scope?: RuleScope;
  when?: (history: InteractionHistory, event: RecordedInteraction) => boolean;
  reactionKey?: string;
  reactionKeys?: readonly string[];
  emotion?: MascotEmotion;
  effectId?: ContextualEffectId;
  finalCallbackKey?: string;
  finalCallbackKeys?: readonly string[];
};

export type InteractionResolution = {
  reactionKey?: string;
  emotion?: MascotEmotion;
  effectId?: ContextualEffectId;
  finalCallbackKey?: string;
  triggerKeys: readonly string[];
};

const noEggs: Record<
  ScenarioId,
  {
    sixKeys: readonly string[];
    tenKeys: readonly string[];
    effectId: ContextualEffectId;
    emotion: MascotEmotion;
  }
> = {
  raise: {
    sixKeys: ['raise.memory.eggs.no6a', 'raise.memory.eggs.no6b'],
    tenKeys: ['raise.memory.eggs.no10'],
    effectId: 'raise-persistence',
    emotion: 'emotion.angryPouty',
  },
  hire: {
    sixKeys: ['hire.memory.eggs.no6a', 'hire.memory.eggs.no6b'],
    tenKeys: ['hire.memory.eggs.no10a', 'hire.memory.eggs.no10b'],
    effectId: 'hire-persistence',
    emotion: 'emotion.angryPouty',
  },
  date: {
    sixKeys: ['date.memory.eggs.no6a', 'date.memory.eggs.no6b'],
    tenKeys: ['date.memory.eggs.no10a', 'date.memory.eggs.no10b'],
    effectId: 'date-persistence',
    emotion: 'emotion.sadPleading',
  },
};

const noEasterEggRules = scenarioIds.flatMap<InteractionRule>((scenario) => [
  {
    id: `${scenario}.egg.no6`,
    kind: 'easter-egg',
    on: 'answer.no',
    scenarios: [scenario],
    priority: 140,
    when: (_history, event) => event.type === 'answer.no' && event.attempt === 6,
    reactionKeys: noEggs[scenario].sixKeys,
    emotion: noEggs[scenario].emotion,
    effectId: noEggs[scenario].effectId,
  },
  {
    id: `${scenario}.egg.no10`,
    kind: 'easter-egg',
    on: 'answer.no',
    scenarios: [scenario],
    priority: 145,
    when: (_history, event) => event.type === 'answer.no' && event.attempt === 10,
    reactionKeys: noEggs[scenario].tenKeys,
    emotion: noEggs[scenario].emotion,
  },
]);

const isRapidScenarioLoop = (history: InteractionHistory) => {
  const switches = history.events
    .filter(
      (
        event,
      ): event is RecordedInteraction &
        Extract<InteractionEvent, { type: 'scenario.switch' }> =>
        event.type === 'scenario.switch',
    )
    .slice(-3);
  if (switches.length !== 3 || switches[2].at - switches[0].at > 8_000) return false;
  const path = [switches[0].from, ...switches.map((event) => event.to)];
  return path[0] === path[3] && new Set(path.slice(0, 3)).size === 3;
};

const finalResultIs = (event: RecordedInteraction, scenario: ScenarioId) =>
  event.type === 'scenario.completed' && event.result.scenario === scenario;

const interactionRules: readonly InteractionRule[] = [
  ...noEasterEggRules,

  {
    id: 'session.egg.rapid-switch-loop',
    kind: 'easter-egg',
    on: 'scenario.switch',
    priority: 150,
    scope: 'session',
    when: (history) => isRapidScenarioLoop(history),
    reactionKey: 'memory.switching.reaction',
    emotion: 'emotion.happySoft',
    effectId: 'switch-whiplash',
  },

  {
    id: 'raise.effect.five',
    kind: 'contextual-effect',
    on: 'raise.amount',
    scenarios: ['raise'],
    priority: 20,
    when: (_history, event) => event.type === 'raise.amount' && event.value === 'five',
    effectId: 'raise-small-change',
  },
  {
    id: 'raise.effect.thirty',
    kind: 'contextual-effect',
    on: 'raise.amount',
    scenarios: ['raise'],
    priority: 25,
    when: (_history, event) => event.type === 'raise.amount' && event.value === 'thirty',
    effectId: 'raise-big-payday',
  },
  {
    id: 'raise.egg.persistence-thirty',
    kind: 'easter-egg',
    on: 'raise.amount',
    scenarios: ['raise'],
    priority: 135,
    when: (history, event) =>
      event.type === 'raise.amount' &&
      event.value === 'thirty' &&
      latestNoAttempt(history, 'raise') >= 3,
    reactionKey: 'raise.memory.eggs.persistenceThirty',
    emotion: 'emotion.happyExcited',
  },

  {
    id: 'hire.effect.team-lead',
    kind: 'contextual-effect',
    on: 'hire.role',
    scenarios: ['hire'],
    priority: 30,
    when: (_history, event) => event.type === 'hire.role' && event.value === 'lead',
    effectId: 'hire-lead-badge',
  },
  {
    id: 'hire.effect.high-offer',
    kind: 'contextual-effect',
    on: 'hire.offer',
    scenarios: ['hire'],
    priority: 30,
    when: (_history, event) => event.type === 'hire.offer' && event.value === 'sign',
    effectId: 'hire-signed',
  },
  {
    id: 'hire.egg.lead-high',
    kind: 'easter-egg',
    on: 'hire.offer',
    scenarios: ['hire'],
    priority: 145,
    when: (history, event) =>
      event.type === 'hire.offer' &&
      event.value === 'sign' &&
      selectedInCurrentRun(history, 'hire', 'hire.role')?.value === 'lead',
    reactionKey: 'hire.memory.eggs.leadHigh',
    emotion: 'emotion.happyExcited',
  },
  {
    id: 'hire.egg.lead-low',
    kind: 'easter-egg',
    on: 'hire.offer',
    scenarios: ['hire'],
    priority: 145,
    when: (history, event) =>
      event.type === 'hire.offer' &&
      event.value === 'cute' &&
      selectedInCurrentRun(history, 'hire', 'hire.role')?.value === 'lead',
    reactionKey: 'hire.memory.eggs.leadLow',
    emotion: 'emotion.angryPouty',
  },
  {
    id: 'hire.egg.persistence-high',
    kind: 'easter-egg',
    on: 'hire.offer',
    scenarios: ['hire'],
    priority: 130,
    when: (history, event) =>
      event.type === 'hire.offer' &&
      event.value === 'sign' &&
      latestNoAttempt(history, 'hire') >= 3,
    reactionKey: 'hire.memory.eggs.persistenceHigh',
    emotion: 'emotion.happyExcited',
  },
  {
    id: 'hire.egg.persistence-yes',
    kind: 'easter-egg',
    on: 'answer.accepted',
    scenarios: ['hire'],
    priority: 130,
    when: (history) => latestNoAttempt(history, 'hire') >= 3,
    reactionKey: 'hire.memory.eggs.persistenceYes',
    emotion: 'emotion.happyExcited',
  },

  {
    id: 'date.effect.dessert',
    kind: 'contextual-effect',
    on: 'date.vibe',
    scenarios: ['date'],
    priority: 25,
    when: (_history, event) => event.type === 'date.vibe' && event.value === 'dessert',
    effectId: 'date-dessert',
  },
  {
    id: 'date.effect.sunset',
    kind: 'contextual-effect',
    on: 'date.vibe',
    scenarios: ['date'],
    priority: 25,
    when: (_history, event) => event.type === 'date.vibe' && event.value === 'sunset',
    effectId: 'date-sunset',
  },
  {
    id: 'date.effect.surprise',
    kind: 'contextual-effect',
    on: 'date.vibe',
    scenarios: ['date'],
    priority: 25,
    when: (_history, event) => event.type === 'date.vibe' && event.value === 'surprise',
    effectId: 'date-surprise',
  },
  {
    id: 'date.egg.many-activities',
    kind: 'easter-egg',
    on: 'date.vibe',
    scenarios: ['date'],
    priority: 125,
    scope: 'session',
    when: (history) => history.events.filter((event) => event.type === 'date.vibe').length >= 4,
    reactionKeys: ['date.memory.eggs.manyActivities1', 'date.memory.eggs.manyActivities2'],
    emotion: 'emotion.happySoft',
  },
  {
    id: 'date.effect.night',
    kind: 'contextual-effect',
    on: 'date.time',
    scenarios: ['date'],
    priority: 30,
    when: (_history, event) => {
      if (event.type !== 'date.time') return false;
      const hour = Number(event.value.slice(0, 2));
      return hour >= 21 || hour <= 1;
    },
    effectId: 'date-night',
  },
  {
    id: 'date.effect.early',
    kind: 'contextual-effect',
    on: 'date.time',
    scenarios: ['date'],
    priority: 30,
    when: (_history, event) => {
      if (event.type !== 'date.time') return false;
      const hour = Number(event.value.slice(0, 2));
      return hour >= 5 && hour <= 9;
    },
    effectId: 'date-early',
  },
  {
    id: 'date.egg.surprise-midnight',
    kind: 'easter-egg',
    on: 'date.time',
    scenarios: ['date'],
    priority: 150,
    when: (history, event) =>
      event.type === 'date.time' &&
      event.value === '00:00' &&
      selectedInCurrentRun(history, 'date', 'date.vibe')?.value === 'surprise',
    reactionKeys: ['date.memory.eggs.surpriseMidnight1', 'date.memory.eggs.surpriseMidnight2'],
    emotion: 'emotion.happyExcited',
    effectId: 'date-night',
  },
  {
    id: 'date.egg.persistence-yes',
    kind: 'easter-egg',
    on: 'answer.accepted',
    scenarios: ['date'],
    priority: 130,
    when: (history) => latestNoAttempt(history, 'date') >= 3,
    reactionKeys: ['date.memory.eggs.persistenceYes1', 'date.memory.eggs.persistenceYes2'],
    emotion: 'emotion.happyExcited',
  },

  {
    id: 'raise.final.variant',
    kind: 'callback',
    on: 'scenario.completed',
    scenarios: ['raise'],
    priority: 100,
    when: (_history, event) => finalResultIs(event, 'raise'),
    finalCallbackKey: 'raise.final.punchline',
  },
  {
    id: 'hire.final.variant',
    kind: 'callback',
    on: 'scenario.completed',
    scenarios: ['hire'],
    priority: 100,
    when: (_history, event) => finalResultIs(event, 'hire'),
    finalCallbackKeys: [
      'hire.final.punchline1',
      'hire.final.punchline2',
      'hire.final.punchline3',
    ],
  },
  {
    id: 'date.final.variant',
    kind: 'callback',
    on: 'scenario.completed',
    scenarios: ['date'],
    priority: 100,
    when: (_history, event) => finalResultIs(event, 'date'),
    finalCallbackKeys: [
      'date.final.punchline1',
      'date.final.punchline2',
      'date.final.punchline3',
    ],
  },
];

const triggerKeyFor = (
  rule: InteractionRule,
  history: InteractionHistory,
  event: RecordedInteraction,
) =>
  rule.scope === 'session'
    ? rule.id
    : `${rule.id}:${event.scenario}:${history.runs[event.scenario]}`;

const selectFromPool = (
  keys: readonly string[] | undefined,
  history: InteractionHistory,
  event: RecordedInteraction,
) => {
  if (!keys?.length) return undefined;
  const seed = history.runs[event.scenario] + event.id;
  return keys[seed % keys.length];
};

export const resolveInteraction = (
  history: InteractionHistory,
  event: RecordedInteraction,
): InteractionResolution => {
  const matches = interactionRules
    .filter(
      (rule) =>
        rule.on === event.type &&
        (!rule.scenarios || rule.scenarios.includes(event.scenario)) &&
        (rule.when?.(history, event) ?? true),
    )
    .map((rule) => ({ rule, triggerKey: triggerKeyFor(rule, history, event) }))
    .filter(({ triggerKey }) => !history.triggeredRuleKeys.includes(triggerKey))
    .sort((left, right) => right.rule.priority - left.rule.priority);

  const reaction = matches.find(
    ({ rule }) => rule.reactionKey || Boolean(rule.reactionKeys?.length),
  );
  const effect = matches.find(({ rule }) => rule.effectId);
  const finalCallback = matches.find(
    ({ rule }) => rule.finalCallbackKey || Boolean(rule.finalCallbackKeys?.length),
  );
  const used = [reaction, effect, finalCallback].filter(
    (match): match is (typeof matches)[number] => Boolean(match),
  );

  return {
    reactionKey:
      reaction?.rule.reactionKey ??
      (reaction
        ? selectFromPool(reaction.rule.reactionKeys, history, event)
        : undefined),
    emotion: reaction?.rule.emotion,
    effectId: effect?.rule.effectId,
    finalCallbackKey:
      finalCallback?.rule.finalCallbackKey ??
      (finalCallback
        ? selectFromPool(finalCallback.rule.finalCallbackKeys, history, event)
        : undefined),
    triggerKeys: [...new Set(used.map(({ triggerKey }) => triggerKey))],
  };
};
