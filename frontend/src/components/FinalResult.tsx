import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { buildCompletedResult, selectedRaisePercentage } from '../../../shared/results';
import { dateFromId } from '../features/experience/dateTime';
import type { ScenarioId, ScenarioSelections } from '../features/experience/model';

type FinalResultProps = {
  scenario: ScenarioId;
  selections: ScenarioSelections;
  callbackKey?: string | null;
};

export function FinalResult({ scenario, selections, callbackKey }: FinalResultProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'fa' ? 'fa-IR' : 'en-US';
  const result = buildCompletedResult(scenario, selections);

  if (result?.scenario === 'raise') {
    const selected = selectedRaisePercentage[result.amount];
    const adjustment = result.finalPercentage - selected;
    return (
      <ResultMotion scenario="raise">
        <div className="raise-certificate__topline">
          <span className="result-seal">{t('raise.final.seal')}</span>
          <span className="raise-certificate__stamp" dir="ltr" aria-hidden="true">
            +{adjustment}%
          </span>
        </div>
        <h1>{t('raise.final.title')}</h1>

        <div className="raise-certificate__hero">
          <span className="raise-certificate__label">{t('raise.final.amountLabel')}</span>
          <strong dir="ltr">
            {new Intl.NumberFormat(locale).format(result.finalPercentage)}%
          </strong>
          <div className="raise-certificate__scribble" aria-hidden="true" />
        </div>

        <div className="raise-certificate__details">
          <div>
            <span>{t('raise.final.selectedLabel')}</span>
            <strong dir="ltr">{new Intl.NumberFormat(locale).format(selected)}%</strong>
          </div>
          <div className="raise-certificate__plus" aria-hidden="true">
            +
          </div>
          <div>
            <span>{t('raise.final.adjustmentLabel')}</span>
            <strong dir="ltr">+{new Intl.NumberFormat(locale).format(adjustment)}%</strong>
          </div>
          <div className="raise-certificate__timing">
            <span>{t('raise.final.timingLabel')}</span>
            <strong>{t(`raise.timing.options.${result.timing}.label`)}</strong>
          </div>
        </div>

        <p className="result-statement">{t(callbackKey ?? 'raise.final.statement')}</p>
        <span className="mischief-note">✎ {t('raise.final.mischief')}</span>
      </ResultMotion>
    );
  }

  if (result?.scenario === 'hire') {
    return (
      <ResultMotion scenario="hire">
        <div className="hire-pass__clip" aria-hidden="true">
          <span />
        </div>
        <div className="hire-pass__header">
          <span className="result-seal">{t('hire.final.seal')}</span>
          <span className="hire-pass__number" aria-hidden="true">
            01
          </span>
        </div>

        <div className="hire-pass__identity">
          <div className="hire-pass__avatar" aria-hidden="true">
            <span>★</span>
          </div>
          <div>
            <small>{t('hire.final.passLabel')}</small>
            <h1>{t('hire.final.title')}</h1>
          </div>
        </div>

        <div className="hire-pass__fields">
          <div>
            <span>{t('hire.final.roleLabel')}</span>
            <strong>{t(`hire.role.options.${result.role}.label`)}</strong>
          </div>
          <div>
            <span>{t('hire.final.offerLabel')}</span>
            <strong>{t(`hire.offer.options.${result.offer}.label`)}</strong>
          </div>
        </div>

        <div className="hire-pass__footer">
          <p>{t(callbackKey ?? 'hire.final.statement')}</p>
          <span>{t('hire.final.upgrade')}</span>
          <i aria-hidden="true" />
        </div>
      </ResultMotion>
    );
  }

  if (result?.scenario === 'date') {
    const outingRoot = `date.vibe.options.${result.vibe}`;
    const date = dateFromId(result.date);
    const formattedDate = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(date);
    const localizedTime =
      locale === 'fa-IR'
        ? result.time.replace(/\d/g, (digit) =>
            new Intl.NumberFormat('fa-IR').format(Number(digit)),
          )
        : result.time;

    return (
      <ResultMotion scenario="date">
        <div className="date-keepsake__pin" aria-hidden="true" />
        <span className="result-seal">{t('date.final.seal')}</span>
        <h1>{t('date.final.title')}</h1>

        <div className="date-keepsake__ticket">
          <div className="date-keepsake__activity">
            <span className="date-keepsake__icon" aria-hidden="true">
              {t(`${outingRoot}.icon`)}
            </span>
            <div>
              <small>{t('date.final.activityLabel')}</small>
              <strong>{t(`${outingRoot}.label`)}</strong>
            </div>
          </div>
          <div className="date-keepsake__tear" aria-hidden="true" />
          <div className="date-keepsake__when">
            <div>
              <small>{t('date.final.dateLabel')}</small>
              <strong>{formattedDate}</strong>
            </div>
            <div>
              <small>{t('date.final.timeLabel')}</small>
              <strong dir="ltr">{localizedTime}</strong>
            </div>
          </div>
          <div className="date-keepsake__barcode" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <p className="result-statement">{t(callbackKey ?? 'date.final.statement')}</p>
        <span className="date-keepsake__note">{t('date.final.ticketNote')}</span>
        <DateOrnaments />
      </ResultMotion>
    );
  }

  return null;
}

function ResultMotion({ scenario, children }: { scenario: ScenarioId; children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.section
      className={`result-card result-card--${scenario}`}
      initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reducedMotion
          ? { duration: 0.01 }
          : { type: 'spring', stiffness: 175, damping: 19, mass: 0.85 }
      }
    >
      {children}
    </motion.section>
  );
}

function DateOrnaments() {
  return (
    <div className="result-ornaments" aria-hidden="true">
      <span>☕</span>
      <span>✦</span>
      <span>○</span>
    </div>
  );
}
