import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { ChoiceOption } from '../features/experience/model';

type OptionGridProps = {
  options: ChoiceOption[];
  translationRoot: string;
  ariaLabel: string;
  selected?: string;
  onSelect: (option: ChoiceOption) => void;
  variant?: 'default' | 'vibe';
  disabled?: boolean;
};

export function OptionGrid({
  options,
  translationRoot,
  ariaLabel,
  selected,
  onSelect,
  variant = 'default',
  disabled = false,
}: OptionGridProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  return (
    <div
      className={`option-grid option-grid--${variant}`}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option, index) => (
        <motion.button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={selected === option.id}
          className={`choice-card ${selected === option.id ? 'is-selected' : ''}`}
          onClick={() => onSelect(option)}
          disabled={disabled}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reducedMotion
              ? { duration: 0.01 }
              : { delay: index * 0.045, duration: 0.22 }
          }
          whileHover={reducedMotion ? undefined : { y: -3 }}
        >
          {option.icon && (
            <span className="choice-icon" aria-hidden="true">
              {option.icon}
            </span>
          )}
          <span className="choice-copy">
            <strong>{t(`${translationRoot}.${option.id}.label`)}</strong>
            <small>{t(`${translationRoot}.${option.id}.detail`)}</small>
          </span>
          <span className="choice-check" aria-hidden="true">
            ✓
          </span>
        </motion.button>
      ))}
    </div>
  );
}
