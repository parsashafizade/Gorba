import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { ChoiceOption } from '../features/experience/model';

type OptionGridProps = {
  options: ChoiceOption[];
  translationRoot: string;
  selected?: string;
  onSelect: (option: ChoiceOption) => void;
  variant?: 'default' | 'vibe';
};

export function OptionGrid({
  options,
  translationRoot,
  selected,
  onSelect,
  variant = 'default',
}: OptionGridProps) {
  const { t } = useTranslation();
  return (
    <div className={`option-grid option-grid--${variant}`} role="radiogroup">
      {options.map((option, index) => (
        <motion.button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={selected === option.id}
          className={`choice-card ${selected === option.id ? 'is-selected' : ''}`}
          onClick={() => onSelect(option)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.045, duration: 0.22 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
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
