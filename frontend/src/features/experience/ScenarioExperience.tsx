import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildCompletedResult } from '../../../../shared/results';
import {
  ContextualEffect,
  type ActiveContextualEffect,
} from '../../components/ContextualEffect';
import { DateTimePicker } from '../../components/DateTimePicker';
import { Decorations } from '../../components/Decorations';
import { FinalResult } from '../../components/FinalResult';
import { OptionGrid } from '../../components/OptionGrid';
import { RunawayChoices } from '../../components/RunawayChoices';
import { StepProgress } from '../../components/StepProgress';
import { YesNoChallenge } from '../../components/YesNoChallenge';
import { Mascot } from '../mascot/Mascot';
import type { MascotAssetKey } from '../mascot/assets';
import { effectDuration, type ContextualEffectId } from './contextualEffects';
import { interactionBehavior, reactionHoldMs } from './interactionConfig';
import type { InteractionEvent, PendingInteractionCue } from './interactionMemory';
import type { InteractionResolution } from './interactionRules';
import type { ChoiceOption, ExperienceStep, ScenarioId, ScenarioSelections } from './model';
import {
  choiceReactionFor,
  dateTimeReactionFor,
  finalSpeechFor,
  noConversationFor,
  raiseTimingDecoys,
  secondaryChoices,
  tertiaryChoices,
  yesReactionFor,
} from './scenarioConfig';
import { useResultNotification } from './resultNotification';
import type { RecordInteraction } from './useInteractionMemory';

type ScenarioExperienceProps = {
  scenario: ScenarioId;
  recordInteraction: RecordInteraction;
  pendingCue?: PendingInteractionCue;
  onConsumeCue: (token: number) => void;
};

export function ScenarioExperience({
  scenario,
  recordInteraction,
  pendingCue,
  onConsumeCue,
}: ScenarioExperienceProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState<ExperienceStep>(1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [noAttempts, setNoAttempts] = useState(0);
  const [emotion, setEmotion] = useState<MascotAssetKey>('gaze.center');
  const [reactionKey, setReactionKey] = useState<string | null>(null);
  const [reactionTurn, setReactionTurn] = useState(0);
  const [recipientKey, setRecipientKey] = useState<string | null>(null);
  const [recipientLabelKey, setRecipientLabelKey] = useState<string | null>(null);
  const [selections, setSelections] = useState<ScenarioSelections>({});
  const [isProgressing, setIsProgressing] = useState(false);
  const [activeEffect, setActiveEffect] = useState<ActiveContextualEffect | null>(null);
  const [finalCallbackKey, setFinalCallbackKey] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const recipientTimerRef = useRef<number | null>(null);
  const contextualEffectTimerRef = useRef<number | null>(null);
  const transientCueTimerRef = useRef<number | null>(null);
  const effectTurnRef = useRef(0);
  const seenCueTokensRef = useRef(new Set<number>());
  const progressingRef = useRef(false);
  const completedResult = step === 4 ? buildCompletedResult(scenario, selections) : null;
  useResultNotification(completedResult);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (recipientTimerRef.current) window.clearTimeout(recipientTimerRef.current);
      if (contextualEffectTimerRef.current)
        window.clearTimeout(contextualEffectTimerRef.current);
      if (transientCueTimerRef.current) window.clearTimeout(transientCueTimerRef.current);
    },
    [],
  );

  const clearTransientCue = useCallback(() => {
    if (!transientCueTimerRef.current) return;
    window.clearTimeout(transientCueTimerRef.current);
    transientCueTimerRef.current = null;
  }, []);

  const showEffect = useCallback(
    (effectId?: ContextualEffectId) => {
      if (!effectId) return;
      if (contextualEffectTimerRef.current)
        window.clearTimeout(contextualEffectTimerRef.current);

      const token = effectTurnRef.current + 1;
      effectTurnRef.current = token;
      setActiveEffect({ token, effectId });
      contextualEffectTimerRef.current = window.setTimeout(() => {
        setActiveEffect((current) => (current?.token === token ? null : current));
        contextualEffectTimerRef.current = null;
      }, effectDuration(effectId, Boolean(reducedMotion)));
    },
    [reducedMotion],
  );

  const react = (nextEmotion: MascotAssetKey, nextReaction: string) => {
    setEmotion(nextEmotion);
    setReactionKey(nextReaction);
    setReactionTurn((current) => current + 1);
  };

  useEffect(() => {
    if (!pendingCue || seenCueTokensRef.current.has(pendingCue.token)) return;
    const deliveryTimer = window.setTimeout(() => {
      seenCueTokensRef.current.add(pendingCue.token);
      onConsumeCue(pendingCue.token);
      showEffect(pendingCue.effectId);

      if (!pendingCue.reactionKey) return;
      clearTransientCue();
      setEmotion(pendingCue.emotion ?? 'emotion.happySoft');
      setReactionKey(pendingCue.reactionKey);
      setReactionTurn((current) => current + 1);
      transientCueTimerRef.current = window.setTimeout(() => {
        setReactionKey(null);
        setEmotion('gaze.center');
        transientCueTimerRef.current = null;
      }, reactionHoldMs(t(pendingCue.reactionKey)));
    }, 0);

    return () => window.clearTimeout(deliveryTimer);
  }, [clearTransientCue, onConsumeCue, pendingCue, showEffect, t]);

  const applyResolution = (resolution: InteractionResolution) => {
    showEffect(resolution.effectId);
  };

  const beginProgress = (
    nextEmotion: MascotAssetKey,
    nextReaction: string,
    complete: () => void,
  ) => {
    if (progressingRef.current) return;
    progressingRef.current = true;
    setIsProgressing(true);
    if (recipientTimerRef.current) window.clearTimeout(recipientTimerRef.current);
    setRecipientKey(null);
    setRecipientLabelKey(null);
    react(nextEmotion, nextReaction);
    timerRef.current = window.setTimeout(
      () => {
        complete();
        progressingRef.current = false;
        setIsProgressing(false);
      },
      reactionHoldMs(t(nextReaction)),
    );
  };

  const handleNo = () => {
    if (progressingRef.current) return;
    clearTransientCue();
    const attempt = noAttempts + 1;
    const conversation = noConversationFor(scenario, attempt);
    const resolution = recordInteraction({
      type: 'answer.no',
      scenario,
      attempt,
      recipientKey: conversation.recipientKey as `${ScenarioId}.recipient.${string}`,
    });
    applyResolution(resolution);
    setHasInteracted(true);
    setNoAttempts(attempt);
    if (recipientTimerRef.current) window.clearTimeout(recipientTimerRef.current);
    setRecipientKey(conversation.recipientKey);
    setRecipientLabelKey(conversation.recipientLabelKey);
    setReactionKey(null);
    recipientTimerRef.current = window.setTimeout(() => {
      react(
        resolution.emotion ?? conversation.emotion,
        resolution.reactionKey ?? conversation.reactionKey,
      );
    }, interactionBehavior.reaction.recipientLeadMs);
  };

  const handleYes = () => {
    clearTransientCue();
    setHasInteracted(true);
    const resolution = recordInteraction({ type: 'answer.accepted', scenario });
    applyResolution(resolution);
    const defaultReactionKey = yesReactionFor(scenario, noAttempts);
    beginProgress(
      resolution.emotion ?? 'emotion.happySoft',
      resolution.reactionKey ?? defaultReactionKey,
      () => {
        setReactionKey(null);
        setStep(2);
      },
    );
  };

  const handleSecondaryChoice = (option: ChoiceOption) => {
    if (progressingRef.current) return;
    clearTransientCue();
    let nextSelections: ScenarioSelections = selections;
    let interaction: InteractionEvent;

    if (scenario === 'raise') {
      const amount = option.id as NonNullable<ScenarioSelections['amount']>;
      nextSelections = { ...selections, amount };
      interaction = { type: 'raise.amount', scenario, value: amount };
    } else if (scenario === 'hire') {
      const role = option.id as NonNullable<ScenarioSelections['role']>;
      nextSelections = { ...selections, role };
      interaction = { type: 'hire.role', scenario, value: role };
    } else {
      const vibe = option.id as NonNullable<ScenarioSelections['vibe']>;
      nextSelections = { ...selections, vibe };
      interaction = { type: 'date.vibe', scenario, value: vibe };
    }

    setSelections(nextSelections);
    const resolution = recordInteraction(interaction);
    applyResolution(resolution);
    const defaultReactionKey = choiceReactionFor(option, noAttempts);
    beginProgress(
      resolution.emotion ?? option.emotion,
      resolution.reactionKey ?? defaultReactionKey,
      () => {
        setReactionKey(null);
        setStep(3);
      },
    );
  };

  const handleTertiaryChoice = (option: ChoiceOption) => {
    if (progressingRef.current) return;
    clearTransientCue();
    let nextSelections: ScenarioSelections = selections;
    let interaction: InteractionEvent;

    if (scenario === 'raise') {
      const timing = option.id as NonNullable<ScenarioSelections['timing']>;
      nextSelections = { ...selections, timing };
      interaction = { type: 'raise.timing', scenario, value: timing };
    } else if (scenario === 'hire') {
      const offer = option.id as NonNullable<ScenarioSelections['offer']>;
      nextSelections = { ...selections, offer };
      interaction = { type: 'hire.offer', scenario, value: offer };
    } else {
      return;
    }

    setSelections(nextSelections);
    const resolution = recordInteraction(interaction);
    applyResolution(resolution);
    const defaultReactionKey = choiceReactionFor(option, noAttempts);
    beginProgress(
      resolution.emotion ?? option.emotion,
      resolution.reactionKey ?? defaultReactionKey,
      () => completeScenario(nextSelections),
    );
  };

  const setDate = (date: string) => {
    clearTransientCue();
    setSelections((current) => ({ ...current, date }));
    const resolution = recordInteraction({ type: 'date.day', scenario: 'date', value: date });
    applyResolution(resolution);
    react('emotion.happySoft', 'date.reactions.scheduled');
  };

  const setTime = (time: string) => {
    clearTransientCue();
    setSelections((current) => ({ ...current, time }));
    const resolution = recordInteraction({ type: 'date.time', scenario: 'date', value: time });
    applyResolution(resolution);
    react(
      resolution.emotion ?? 'emotion.happySoft',
      resolution.reactionKey ?? dateTimeReactionFor(time),
    );
  };

  const finishDate = () => {
    if (!selections.date || !selections.time || progressingRef.current) return;
    clearTransientCue();
    beginProgress('emotion.happyExcited', 'date.reactions.scheduled', () => {
      completeScenario(selections);
    });
  };

  function completeScenario(nextSelections: ScenarioSelections) {
    const result = buildCompletedResult(scenario, nextSelections);
    const resolution = result
      ? recordInteraction({ type: 'scenario.completed', scenario, result })
      : null;
    setFinalCallbackKey(resolution?.finalCallbackKey ?? null);
    applyResolution(resolution ?? { triggerKeys: [] });
    setStep(4);
    setEmotion('emotion.happyExcited');
    setReactionKey(finalSpeechFor(scenario, noAttempts));
    setReactionTurn((current) => current + 1);
  }

  const isCompanion = hasInteracted || step > 1;

  return (
    <main
      className={`experience experience--${scenario} ${isCompanion ? 'experience--companion' : ''}`}
      data-step={step}
      data-progressing={isProgressing}
    >
      <Decorations scenario={scenario} />
      <ContextualEffect active={activeEffect} />
      <StepProgress step={step} />
      <div className={`experience-layout experience-layout--step-${step}`}>
        <div className="mascot-column">
          <Mascot
            scenario={scenario}
            emotion={emotion}
            reaction={reactionKey ? t(reactionKey) : null}
            reactionTurn={reactionTurn}
            recipientMessage={recipientKey ? t(recipientKey) : null}
            recipientLabel={recipientLabelKey ? t(recipientLabelKey) : null}
            trackingEnabled={!hasInteracted && step === 1 && !reactionKey}
            companion={isCompanion}
          />
        </div>

        <AnimatePresence mode="sync">
          <motion.div
            className="content-column"
            key={step}
            initial={reducedMotion ? false : { opacity: 0, y: 13 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.22 }}
          >
            {step === 1 && (
              <section className="ask-step">
                <ContentIntro
                  eyebrow={t(`${scenario}.eyebrow`)}
                  title={t(`${scenario}.ask.title`)}
                  subtitle={t(`${scenario}.ask.subtitle`)}
                />
                <YesNoChallenge
                  noAttempts={noAttempts}
                  onNo={handleNo}
                  onYes={handleYes}
                  disabled={isProgressing}
                />
              </section>
            )}

            {step === 2 && (
              <section className="choice-step">
                <ContentIntro
                  eyebrow={t(
                    `${scenario}.${scenario === 'raise' ? 'amount' : scenario === 'hire' ? 'role' : 'vibe'}.eyebrow`,
                  )}
                  title={t(
                    `${scenario}.${scenario === 'raise' ? 'amount' : scenario === 'hire' ? 'role' : 'vibe'}.title`,
                  )}
                  subtitle={t(
                    `${scenario}.${scenario === 'raise' ? 'amount' : scenario === 'hire' ? 'role' : 'vibe'}.subtitle`,
                  )}
                />
                <OptionGrid
                  options={secondaryChoices[scenario]}
                  translationRoot={`${scenario}.${scenario === 'raise' ? 'amount' : scenario === 'hire' ? 'role' : 'vibe'}.options`}
                  ariaLabel={t(
                    `${scenario}.${scenario === 'raise' ? 'amount' : scenario === 'hire' ? 'role' : 'vibe'}.title`,
                  )}
                  selected={
                    scenario === 'raise'
                      ? selections.amount
                      : scenario === 'hire'
                        ? selections.role
                        : selections.vibe
                  }
                  onSelect={handleSecondaryChoice}
                  variant={scenario === 'date' ? 'vibe' : 'default'}
                  disabled={isProgressing}
                />
              </section>
            )}

            {step === 3 && scenario !== 'date' && (
              <section className="choice-step">
                <ContentIntro
                  eyebrow={t(`${scenario}.${scenario === 'raise' ? 'timing' : 'offer'}.eyebrow`)}
                  title={t(`${scenario}.${scenario === 'raise' ? 'timing' : 'offer'}.title`)}
                  subtitle={t(`${scenario}.${scenario === 'raise' ? 'timing' : 'offer'}.subtitle`)}
                />
                <OptionGrid
                  options={tertiaryChoices[scenario]}
                  translationRoot={`${scenario}.${scenario === 'raise' ? 'timing' : 'offer'}.options`}
                  ariaLabel={t(
                    `${scenario}.${scenario === 'raise' ? 'timing' : 'offer'}.title`,
                  )}
                  selected={scenario === 'raise' ? selections.timing : selections.offer}
                  onSelect={handleTertiaryChoice}
                  disabled={isProgressing}
                />
                {scenario === 'raise' && (
                  <RunawayChoices options={raiseTimingDecoys} disabled={isProgressing} />
                )}
              </section>
            )}

            {step === 3 && scenario === 'date' && (
              <section className="schedule-step">
                <ContentIntro
                  eyebrow={t('date.schedule.eyebrow')}
                  title={t('date.schedule.title')}
                  subtitle={t('date.schedule.subtitle')}
                />
                <DateTimePicker
                  date={selections.date}
                  time={selections.time}
                  onDateChange={setDate}
                  onTimeChange={setTime}
                />
                {selections.date && selections.time && (
                  <motion.button
                    type="button"
                    className="continue-button"
                    onClick={finishDate}
                    disabled={isProgressing}
                    initial={reducedMotion ? false : { opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
                  >
                    {t('shared.continue')} <span aria-hidden="true">→</span>
                  </motion.button>
                )}
              </section>
            )}

            {step === 4 && (
              <FinalResult
                scenario={scenario}
                selections={selections}
                callbackKey={finalCallbackKey}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

function ContentIntro({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="content-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
