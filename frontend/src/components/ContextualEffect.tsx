import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  contextualEffects,
  type ContextualEffectId,
} from '../features/experience/contextualEffects';

export type ActiveContextualEffect = {
  token: number;
  effectId: ContextualEffectId;
};

export function ContextualEffect({ active }: { active: ActiveContextualEffect | null }) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const definition = active ? contextualEffects[active.effectId] : null;

  return (
    <div className="contextual-effect-layer" aria-hidden="true">
      <AnimatePresence>
        {active && definition && (
          <motion.div
            key={active.token}
            className="contextual-effect"
            data-effect={active.effectId}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, rotate: -5, scale: 0.72 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -9, rotate: 4, scale: 0.92 }
            }
            transition={
              reducedMotion
                ? { duration: 0.08 }
                : { type: 'spring', stiffness: 310, damping: 19, mass: 0.7 }
            }
          >
            <span className="contextual-effect__label">{t(definition.labelKey)}</span>
            <span className="contextual-effect__glyphs">
              {definition.glyphs.map((glyph, index) => (
                <i key={`${glyph}-${index}`}>{glyph}</i>
              ))}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
