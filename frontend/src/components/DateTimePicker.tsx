import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { generateLocalDays, hourlyTimes } from '../features/experience/dateTime';

type DateTimePickerProps = {
  date?: string;
  time?: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
};

export function DateTimePicker({ date, time, onDateChange, onTimeChange }: DateTimePickerProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'fa' ? 'fa-IR' : 'en-US';
  const days = useMemo(() => generateLocalDays(), []);
  const weekday = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'short' }), [locale]);
  const dayNumber = useMemo(() => new Intl.DateTimeFormat(locale, { day: 'numeric' }), [locale]);
  const month = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'short' }), [locale]);
  const localizedTime = (value: string) => {
    if (locale !== 'fa-IR') return value;
    return value.replace(/\d/g, (digit) => new Intl.NumberFormat('fa-IR').format(Number(digit)));
  };

  return (
    <div className="date-time-picker">
      <fieldset>
        <legend>{t('date.schedule.dateLabel')}</legend>
        <div className="date-rail" role="radiogroup" aria-label={t('date.schedule.dateLabel')}>
          {days.map((day) => (
            <button
              type="button"
              role="radio"
              aria-checked={date === day.id}
              className={date === day.id ? 'is-selected' : ''}
              key={day.id}
              onClick={() => onDateChange(day.id)}
            >
              <small>{weekday.format(day.date)}</small>
              <strong>{dayNumber.format(day.date)}</strong>
              <span>{month.format(day.date)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>{t('date.schedule.timeLabel')}</legend>
        <div className="time-rail" role="radiogroup" aria-label={t('date.schedule.timeLabel')}>
          {hourlyTimes.map((value) => (
            <button
              type="button"
              role="radio"
              aria-checked={time === value}
              className={time === value ? 'is-selected' : ''}
              key={value}
              onClick={() => onTimeChange(value)}
            >
              <span dir="ltr">{localizedTime(value)}</span>
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
