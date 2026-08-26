import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { dateFromId } from '../features/experience/dateTime';
import type { ScenarioId, ScenarioSelections } from '../features/experience/model';

const raiseValues: Record<NonNullable<ScenarioSelections['amount']>, number> = {
  five: 7,
  ten: 12,
  twenty: 22,
  thirty: 32,
};

export function FinalResult({
  scenario,
  selections,
}: {
  scenario: ScenarioId;
  selections: ScenarioSelections;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'fa' ? 'fa-IR' : 'en-US';

  if (scenario === 'raise' && selections.amount && selections.timing) {
    return (
      <ResultFrame scenario="raise" seal={t('raise.final.seal')} title={t('raise.final.title')}>
        <div className="raise-amount">
          <strong>{new Intl.NumberFormat(locale).format(raiseValues[selections.amount])}%</strong>
          <span>{t('raise.final.amountLabel')}</span>
        </div>
        <div className="result-data-row">
          <span>{t('raise.final.timingLabel')}</span>
          <strong>{t(`raise.timing.options.${selections.timing}.label`)}</strong>
        </div>
        <p className="result-statement">{t('raise.final.statement')}</p>
        <span className="mischief-note">✎ {t('raise.final.mischief')}</span>
      </ResultFrame>
    );
  }

  if (scenario === 'hire' && selections.role && selections.offer) {
    return (
      <ResultFrame scenario="hire" seal={t('hire.final.seal')} title={t('hire.final.title')}>
        <div className="hire-badge">
          <span>{t('hire.final.roleLabel')}</span>
          <strong>{t(`hire.role.options.${selections.role}.label`)}</strong>
          <small>{t('hire.final.upgrade')}</small>
        </div>
        <div className="result-data-row">
          <span>{t('hire.final.offerLabel')}</span>
          <strong>{t(`hire.offer.options.${selections.offer}.label`)}</strong>
        </div>
        <p className="result-statement">{t('hire.final.statement')}</p>
      </ResultFrame>
    );
  }

  if (scenario === 'date' && selections.vibe && selections.date && selections.time) {
    const outingRoot = `date.vibe.options.${selections.vibe}`;
    const date = dateFromId(selections.date);
    const formattedDate = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(date);
    return (
      <ResultFrame scenario="date" seal={t('date.final.seal')} title={t('date.final.title')}>
        <div className="date-ticket">
          <span className="date-ticket__icon">{t(`${outingRoot}.icon`)}</span>
          <strong>{t(`${outingRoot}.label`)}</strong>
          <span className="date-ticket__day">{formattedDate}</span>
          <span className="date-ticket__time" dir="ltr">
            {locale === 'fa-IR'
              ? selections.time.replace(/\d/g, (digit) =>
                  new Intl.NumberFormat('fa-IR').format(Number(digit)),
                )
              : selections.time}
          </span>
        </div>
        <p className="result-statement">{t('date.final.statement')}</p>
      </ResultFrame>
    );
  }

  return null;
}

function ResultFrame({
  scenario,
  seal,
  title,
  children,
}: {
  scenario: ScenarioId;
  seal: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      className={`result-card result-card--${scenario}`}
      initial={{ opacity: 0, scale: 0.96, rotate: scenario === 'date' ? -1 : 0 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 19 }}
    >
      <span className="result-seal">{seal}</span>
      <h1>{title}</h1>
      {children}
      <div className="result-sparkles" aria-hidden="true">
        <span>✦</span>
        <span>♡</span>
        <span>✧</span>
      </div>
    </motion.section>
  );
}
