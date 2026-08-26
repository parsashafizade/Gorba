import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTimePicker } from '../../components/DateTimePicker';
import { Decorations } from '../../components/Decorations';
import { FinalResult } from '../../components/FinalResult';
import { OptionGrid } from '../../components/OptionGrid';
import { StepProgress } from '../../components/StepProgress';
import { YesNoChallenge } from '../../components/YesNoChallenge';
import { Mascot } from '../mascot/Mascot';
import type { MascotAssetKey } from '../mascot/assets';
import type { ChoiceOption, ExperienceStep, ScenarioId, ScenarioSelections } from './model';
import { noEmotionFor, noReactionFor, secondaryChoices, tertiaryChoices } from './scenarioConfig';

type ScenarioExperienceProps = { scenario: ScenarioId };

export function ScenarioExperience({ scenario }: ScenarioExperienceProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<ExperienceStep>(1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [noAttempts, setNoAttempts] = useState(0);
  const [emotion, setEmotion] = useState<MascotAssetKey>('gaze.center');
  const [reactionKey, setReactionKey] = useState<string | null>(null);
  const [selections, setSelections] = useState<ScenarioSelections>({});
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const later = (callback: () => void, delay = 520) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(callback, delay);
  };

  const react = (nextEmotion: MascotAssetKey, nextReaction: string) => {
    setEmotion(nextEmotion);
    setReactionKey(nextReaction);
  };

  const handleNo = () => {
    const attempt = noAttempts + 1;
    setHasInteracted(true);
    setNoAttempts(attempt);
    react(noEmotionFor(attempt), noReactionFor(scenario, attempt));
  };

  const handleYes = () => {
    setHasInteracted(true);
    react('emotion.happySoft', `${scenario}.reactions.yes`);
    later(() => {
      setStep(2);
      setReactionKey(null);
    });
  };

  const handleSecondaryChoice = (option: ChoiceOption) => {
    if (scenario === 'raise')
      setSelections((current) => ({
        ...current,
        amount: option.id as ScenarioSelections['amount'],
      }));
    if (scenario === 'hire')
      setSelections((current) => ({ ...current, role: option.id as ScenarioSelections['role'] }));
    if (scenario === 'date')
      setSelections((current) => ({ ...current, vibe: option.id as ScenarioSelections['vibe'] }));
    react(option.emotion, option.reactionKey);
    later(() => {
      setStep(3);
      setReactionKey(null);
    }, 620);
  };

  const handleTertiaryChoice = (option: ChoiceOption) => {
    if (scenario === 'raise')
      setSelections((current) => ({
        ...current,
        timing: option.id as ScenarioSelections['timing'],
      }));
    if (scenario === 'hire')
      setSelections((current) => ({ ...current, offer: option.id as ScenarioSelections['offer'] }));
    react(option.emotion, option.reactionKey);
    later(() => {
      setStep(4);
      setEmotion('emotion.happyExcited');
      setReactionKey(`${scenario}.final.speech`);
    }, 620);
  };

  const setDate = (date: string) => {
    setSelections((current) => ({ ...current, date }));
    react('emotion.happySoft', 'date.reactions.scheduled');
  };

  const setTime = (time: string) => {
    setSelections((current) => ({ ...current, time }));
    react('emotion.happySoft', 'date.reactions.scheduled');
  };

  const finishDate = () => {
    if (!selections.date || !selections.time) return;
    setStep(4);
    setEmotion('emotion.happyExcited');
    setReactionKey('date.final.speech');
  };

  const isCompanion = hasInteracted || step > 1;

  return (
    <main
      className={`experience experience--${scenario} ${isCompanion ? 'experience--companion' : ''}`}
    >
      <Decorations scenario={scenario} />
      <StepProgress step={step} />
      <div className={`experience-layout experience-layout--step-${step}`}>
        <div className="mascot-column">
          <Mascot
            emotion={emotion}
            reaction={reactionKey ? t(reactionKey) : null}
            trackingEnabled={!hasInteracted && step === 1}
            companion={isCompanion}
          />
        </div>

        <AnimatePresence mode="sync">
          <motion.div
            className="content-column"
            key={step}
            initial={{ opacity: 0, y: 13 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {step === 1 && (
              <section className="ask-step">
                <ContentIntro
                  eyebrow={t(`${scenario}.eyebrow`)}
                  title={t(`${scenario}.ask.title`)}
                  subtitle={t(`${scenario}.ask.subtitle`)}
                />
                <YesNoChallenge noAttempts={noAttempts} onNo={handleNo} onYes={handleYes} />
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
                  selected={
                    scenario === 'raise'
                      ? selections.amount
                      : scenario === 'hire'
                        ? selections.role
                        : selections.vibe
                  }
                  onSelect={handleSecondaryChoice}
                  variant={scenario === 'date' ? 'vibe' : 'default'}
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
                  selected={scenario === 'raise' ? selections.timing : selections.offer}
                  onSelect={handleTertiaryChoice}
                />
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
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {t('shared.continue')} <span aria-hidden="true">→</span>
                  </motion.button>
                )}
              </section>
            )}

            {step === 4 && <FinalResult scenario={scenario} selections={selections} />}
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
