import { useCallback, useRef, useState } from 'react';
import type { ScenarioId } from '../../../../shared/results';
import {
  appendInteraction,
  createInteractionHistory,
  type InteractionEvent,
  type InteractionHistory,
} from './interactionMemory';
import { resolveInteraction, type InteractionResolution } from './interactionRules';

type RecordOptions = {
  queueForScenario?: boolean;
};

export type RecordInteraction = (
  event: InteractionEvent,
  options?: RecordOptions,
) => InteractionResolution;

const emptyResolution = (): InteractionResolution => ({ triggerKeys: [] });

export function useInteractionMemory(initialScenario: ScenarioId) {
  const [history, setHistory] = useState<InteractionHistory>(() =>
    createInteractionHistory(initialScenario),
  );
  const historyRef = useRef(history);

  const recordInteraction = useCallback<RecordInteraction>((event, options) => {
    const current = historyRef.current;
    if (event.type === 'scenario.switch' && current.currentScenario === event.to) {
      return emptyResolution();
    }

    const appended = appendInteraction(current, event);
    const resolution = resolveInteraction(appended.history, appended.event);
    let nextHistory: InteractionHistory = {
      ...appended.history,
      triggeredRuleKeys: [
        ...new Set([...appended.history.triggeredRuleKeys, ...resolution.triggerKeys]),
      ].slice(-240),
    };

    if (options?.queueForScenario && (resolution.reactionKey || resolution.effectId)) {
      nextHistory = {
        ...nextHistory,
        pendingCues: [
          ...nextHistory.pendingCues,
          {
            token: appended.event.id,
            scenario: event.scenario,
            reactionKey: resolution.reactionKey,
            emotion: resolution.emotion,
            effectId: resolution.effectId,
          },
        ],
      };
    }

    historyRef.current = nextHistory;
    setHistory(nextHistory);
    return resolution;
  }, []);

  const consumeCue = useCallback((token: number) => {
    const current = historyRef.current;
    if (!current.pendingCues.some((cue) => cue.token === token)) return;

    const nextHistory = {
      ...current,
      pendingCues: current.pendingCues.filter((cue) => cue.token !== token),
    };
    historyRef.current = nextHistory;
    setHistory(nextHistory);
  }, []);

  return { history, recordInteraction, consumeCue };
}
