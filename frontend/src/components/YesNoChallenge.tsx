import { motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buttonScales,
  findSafeNoPosition,
  type Position,
} from '../features/experience/interactionMath';

type YesNoChallengeProps = {
  noAttempts: number;
  onNo: () => void;
  onYes: () => void;
};

export function YesNoChallenge({ noAttempts, onNo, onYes }: YesNoChallengeProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const arenaRef = useRef<HTMLDivElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const yesSlotRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const scales = buttonScales(noAttempts);

  const moveNo = () => {
    const arena = arenaRef.current?.getBoundingClientRect();
    const noButton = noRef.current?.getBoundingClientRect();
    const yesSlot = yesSlotRef.current?.getBoundingClientRect();
    if (arena && noButton && yesSlot) {
      setPosition(
        findSafeNoPosition({
          container: { x: 0, y: 0, width: arena.width, height: arena.height },
          button: { width: noButton.width, height: noButton.height },
          forbidden: [
            {
              x: yesSlot.left - arena.left,
              y: yesSlot.top - arena.top,
              width: yesSlot.width,
              height: yesSlot.height,
            },
          ],
          previous: position ?? undefined,
        }),
      );
    }
    onNo();
  };

  return (
    <div className="challenge-arena" ref={arenaRef} data-testid="challenge-arena">
      <div className="yes-slot" ref={yesSlotRef}>
        <motion.button
          type="button"
          className="answer-button answer-button--yes"
          onClick={onYes}
          animate={{ scale: scales.yes }}
          transition={
            reduced ? { duration: 0.08 } : { type: 'spring', stiffness: 330, damping: 20 }
          }
        >
          <span>{t('shared.yes')}</span>
          <span aria-hidden="true">♥</span>
        </motion.button>
      </div>

      <motion.div
        className={`no-slot ${position ? 'no-slot--moved' : ''}`}
        animate={position ? { left: position.x, top: position.y } : undefined}
        transition={reduced ? { duration: 0.08 } : { type: 'spring', stiffness: 285, damping: 24 }}
      >
        <motion.button
          ref={noRef}
          type="button"
          className="answer-button answer-button--no"
          onClick={moveNo}
          animate={{ scale: scales.no }}
          transition={
            reduced ? { duration: 0.08 } : { type: 'spring', stiffness: 320, damping: 22 }
          }
        >
          {t('shared.no')}
        </motion.button>
      </motion.div>
    </div>
  );
}
