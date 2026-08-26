import { useTranslation } from 'react-i18next';
import type { ExperienceStep } from '../features/experience/model';

export function StepProgress({ step }: { step: ExperienceStep }) {
  const { t } = useTranslation();
  return (
    <div className="step-progress" aria-label={t('shared.step', { current: step })}>
      {[1, 2, 3, 4].map((item) => (
        <span key={item} className={item <= step ? 'is-active' : ''} aria-hidden="true" />
      ))}
    </div>
  );
}
