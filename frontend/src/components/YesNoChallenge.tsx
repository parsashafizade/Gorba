import { motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buttonScales,
  findSafeNoPosition,
  takeNextNoZone,
  type NoZone,
  type Position,
} from '../features/experience/interactionMath';

type YesNoChallengeProps = {
  noAttempts: number;
  onNo: () => void;
  onYes: () => void;
  disabled?: boolean;
};

export function YesNoChallenge({ noAttempts, onNo, onYes, disabled = false }: YesNoChallengeProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const arenaRef = useRef<HTMLDivElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const yesSlotRef = useRef<HTMLDivElement>(null);
  const zoneBagRef = useRef<NoZone[]>([]);
  const recentZonesRef = useRef<NoZone[]>([]);
  const [position, setPosition] = useState<Position | null>(null);
  const [zone, setZone] = useState<NoZone | null>(null);
  const scales = buttonScales(noAttempts);

  const moveNo = () => {
    if (disabled) return;
    const arena = arenaRef.current?.getBoundingClientRect();
    const noButton = noRef.current?.getBoundingClientRect();
    const yesButton = yesRef.current?.getBoundingClientRect();
    const zoneResult = takeNextNoZone({
      bag: zoneBagRef.current,
      recent: recentZonesRef.current,
    });
    zoneBagRef.current = zoneResult.bag;
    recentZonesRef.current = [...recentZonesRef.current.slice(-1), zoneResult.zone];
    setZone(zoneResult.zone);
    if (arena && noButton && yesButton) {
      setPosition(
        findSafeNoPosition({
          container: { x: 0, y: 0, width: arena.width, height: arena.height },
          button: { width: noButton.width, height: noButton.height },
          forbidden: [
            {
              x: yesButton.left - arena.left,
              y: yesButton.top - arena.top,
              width: yesButton.width,
              height: yesButton.height,
            },
          ],
          zone: zoneResult.zone,
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
          ref={yesRef}
          type="button"
          className="answer-button answer-button--yes"
          onClick={onYes}
          disabled={disabled}
          data-testid="yes-button"
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
        data-zone={zone ?? undefined}
        animate={position ? { left: position.x, top: position.y } : undefined}
        transition={reduced ? { duration: 0.08 } : { type: 'spring', stiffness: 285, damping: 24 }}
      >
        <motion.button
          ref={noRef}
          type="button"
          className="answer-button answer-button--no"
          onClick={moveNo}
          disabled={disabled}
          data-testid="no-button"
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
