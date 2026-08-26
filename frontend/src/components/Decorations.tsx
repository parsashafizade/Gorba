import { motion, useReducedMotion } from 'motion/react';
import { scenarioDecorations } from '../features/experience/scenarioConfig';
import type { ScenarioId } from '../features/experience/model';

export function Decorations({ scenario }: { scenario: ScenarioId }) {
  const reduced = useReducedMotion();
  return (
    <div className="decorations" aria-hidden="true">
      {scenarioDecorations[scenario].map((symbol, index) => (
        <motion.span
          key={`${symbol}-${index}`}
          className={`decoration decoration--${index + 1}`}
          animate={
            reduced
              ? undefined
              : { y: [0, index % 2 ? -7 : 6, 0], rotate: [0, index % 2 ? 4 : -4, 0] }
          }
          transition={{ duration: 5 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
        >
          {symbol}
        </motion.span>
      ))}
    </div>
  );
}
