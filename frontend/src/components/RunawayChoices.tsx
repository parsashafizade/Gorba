import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlayfulOption } from '../features/experience/model';

const offsets = [
  { x: 0, y: 0 },
  { x: -14, y: 7 },
  { x: 15, y: -7 },
  { x: -9, y: -8 },
  { x: 12, y: 8 },
] as const;

function RunawayChoice({
  option,
  index,
  disabled,
}: {
  option: PlayfulOption;
  index: number;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [attempt, setAttempt] = useState(0);
  const offset = offsets[(attempt + index * 2) % offsets.length];

  return (
    <div className="runaway-choice-zone">
      <motion.button
        type="button"
        className="choice-card choice-card--runaway"
        onClick={() => setAttempt((current) => current + 1)}
        disabled={disabled}
        animate={{ x: offset.x, y: offset.y, rotate: offset.x / 8 }}
        transition={
          reducedMotion
            ? { duration: 0.01 }
            : { type: 'spring', stiffness: 360, damping: 23, mass: 0.72 }
        }
      >
        <span className="choice-copy">
          <strong>{t(option.labelKey)}</strong>
        </span>
        <span className="runaway-choice__mark" aria-hidden="true">
          ↝
        </span>
      </motion.button>
    </div>
  );
}

export function RunawayChoices({
  options,
  disabled = false,
}: {
  options: readonly PlayfulOption[];
  disabled?: boolean;
}) {
  return (
    <div className="runaway-choice-grid">
      {options.map((option, index) => (
        <RunawayChoice key={option.id} option={option} index={index} disabled={disabled} />
      ))}
    </div>
  );
}
