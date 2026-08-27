import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ScenarioId } from '../experience/model';
import {
  alignmentByAsset,
  allMascotAssetUrls,
  getMascotAsset,
  type MascotAssetKey,
} from './assets';
import { assetMotion, mascotBehavior } from './config';
import { reactionPlacementFor } from './dialogue';
import { mapPointerToGaze } from './gaze';

function SpeakerIcon({
  speaker,
  scenario,
}: {
  speaker: 'kitten' | 'recipient';
  scenario: ScenarioId;
}) {
  if (speaker === 'kitten') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 9 4 3l5 3a9 9 0 0 1 6 0l5-3-1 6a8 8 0 1 1-14 0Z" />
        <path d="M9 13h.01M15 13h.01M10 17c1.2.8 2.8.8 4 0" />
      </svg>
    );
  }

  if (scenario === 'raise') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8h16v11H4zM9 8V5h6v3M4 12h16M10 12v2h4v-2" />
      </svg>
    );
  }

  if (scenario === 'hire') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 5h10a2 2 0 0 1 2 2v13H5V7a2 2 0 0 1 2-2Z" />
        <path d="M9 5V3h6v2M8 10h8M8 14h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8 10h.01M12 10h.01M16 10h.01" />
    </svg>
  );
}

const decodeImage = async (src: string) => {
  const image = new Image();
  image.src = src;
  try {
    await image.decode();
  } catch {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Mascot asset failed to load: ${src}`));
    });
  }
};

function MascotStage({ assetKey }: { assetKey: MascotAssetKey }) {
  const reducedMotion = useReducedMotion();
  const initialSrc = getMascotAsset('gaze.center');
  const [layers, setLayers] = useState<[string, string]>([initialSrc, initialSrc]);
  const [activeLayer, setActiveLayer] = useState<0 | 1>(0);
  const lastValidKey = useRef<MascotAssetKey>('gaze.center');

  useEffect(() => {
    const nextSrc = getMascotAsset(assetKey);
    if (!nextSrc || assetKey === lastValidKey.current) return;
    let cancelled = false;

    void decodeImage(nextSrc)
      .then(() => {
        if (cancelled) return;
        const inactive = activeLayer === 0 ? 1 : 0;
        setLayers((current) => {
          const next = [...current] as [string, string];
          next[inactive] = nextSrc;
          return next;
        });
        requestAnimationFrame(() => {
          if (!cancelled) {
            setActiveLayer(inactive);
            lastValidKey.current = assetKey;
          }
        });
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV) console.warn(error);
      });

    return () => {
      cancelled = true;
    };
  }, [activeLayer, assetKey]);

  const microMotion = reducedMotion
    ? { x: 0, y: 0, rotate: 0 }
    : (assetMotion[assetKey] ?? { x: 0, y: 0, rotate: 0 });
  const alignment = alignmentByAsset[assetKey] ?? { x: 0, y: 0 };
  const duration = assetKey.startsWith('gaze.')
    ? mascotBehavior.crossfade.gaze
    : mascotBehavior.crossfade.emotion;
  const movementTransition = assetKey.startsWith('gaze.')
    ? mascotBehavior.movement.gaze
    : mascotBehavior.movement.emotion;

  return (
    <motion.div
      className="mascot-stage"
      animate={microMotion}
      transition={reducedMotion ? { duration: 0.05 } : movementTransition}
      data-testid="mascot-stage"
      data-asset={assetKey}
    >
      {layers.map((src, index) => (
        <motion.img
          // The two persistent slots intentionally reuse indexes.
          key={index}
          src={src}
          alt=""
          aria-hidden="true"
          className="mascot-layer"
          draggable={false}
          style={{ translateX: alignment.x, translateY: alignment.y }}
          animate={{ opacity: activeLayer === index ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0.08 : duration, ease: 'easeOut' }}
        />
      ))}
    </motion.div>
  );
}

type MascotProps = {
  scenario?: ScenarioId;
  emotion: MascotAssetKey;
  reaction?: string | null;
  reactionTurn?: number;
  recipientMessage?: string | null;
  recipientLabel?: string | null;
  trackingEnabled: boolean;
  companion?: boolean;
};

export function Mascot({
  scenario = 'raise',
  emotion,
  reaction,
  reactionTurn = 0,
  recipientMessage,
  recipientLabel,
  trackingEnabled,
  companion = false,
}: MascotProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const stageHostRef = useRef<HTMLDivElement>(null);
  const gazeRef = useRef<MascotAssetKey>('gaze.center');
  const rafRef = useRef<number | null>(null);
  const [gaze, setGaze] = useState<MascotAssetKey>('gaze.center');
  const [temporary, setTemporary] = useState<MascotAssetKey | null>(null);
  const requestedAsset = trackingEnabled ? (temporary ?? gaze) : emotion;
  const placement = reactionPlacementFor(reactionTurn);
  const recipientInitialX = 36;

  useEffect(() => {
    const idle =
      window.requestIdleCallback ??
      ((callback: IdleRequestCallback) => window.setTimeout(callback, 1));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => {
      for (const src of allMascotAssetUrls) {
        const image = new Image();
        image.src = src;
      }
    });
    return () => cancelIdle(handle);
  }, []);

  useEffect(() => {
    if (!trackingEnabled || !window.matchMedia('(hover: hover) and (pointer: fine)').matches)
      return;

    const handlePointer = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = stageHostRef.current?.getBoundingClientRect();
        if (!rect) return;
        const next = mapPointerToGaze(
          { x: event.clientX, y: event.clientY },
          { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.42 },
          gazeRef.current,
        );
        if (next !== gazeRef.current) {
          gazeRef.current = next;
          setGaze(next);
        }
      });
    };

    window.addEventListener('pointermove', handlePointer, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trackingEnabled]);

  useEffect(() => {
    if (!trackingEnabled) return;
    const timers = new Set<number>();
    const schedule = () => {
      const delay =
        mascotBehavior.blink.minimumDelay + Math.random() * mascotBehavior.blink.variance;
      const timer = window.setTimeout(() => {
        setTemporary('micro.blinkHalf');
        const halfTimer = window.setTimeout(() => {
          setTemporary('micro.blinkClosed');
          const closedTimer = window.setTimeout(() => {
            setTemporary('micro.blinkHalf');
            const finishTimer = window.setTimeout(() => {
              setTemporary(null);
              schedule();
            }, mascotBehavior.blink.halfMs);
            timers.add(finishTimer);
          }, mascotBehavior.blink.closedMs);
          timers.add(closedTimer);
        }, mascotBehavior.blink.halfMs);
        timers.add(halfTimer);
      }, delay);
      timers.add(timer);
    };
    schedule();

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [trackingEnabled]);

  return (
    <motion.div
      ref={stageHostRef}
      layout={!reducedMotion}
      className={`mascot ${companion ? 'mascot--companion' : ''}`}
      aria-label={t('shared.mascotLabel')}
      data-scenario={scenario}
    >
      <MascotStage assetKey={requestedAsset} />
      <div className="dialogue-layer">
        <AnimatePresence mode="wait">
          {recipientMessage && (
            <motion.div
              key={recipientMessage}
              className="recipient-bubble"
              role="status"
              data-testid="recipient-bubble"
              initial={reducedMotion ? false : { opacity: 0, x: recipientInitialX, scale: 0.93 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: recipientInitialX * 0.4, scale: 0.96 }
              }
              transition={
                reducedMotion
                  ? { duration: 0.01 }
                  : { type: 'spring', stiffness: 390, damping: 27, mass: 0.7 }
              }
            >
              <span className="recipient-bubble__avatar dialogue-identity" aria-hidden="true">
                <SpeakerIcon speaker="recipient" scenario={scenario} />
              </span>
              <span className="recipient-bubble__body">
                {recipientLabel && <span className="sr-only">{recipientLabel}</span>}
                <span>{recipientMessage}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {reaction && (
            <motion.div
              key={`${reactionTurn}-${reaction}`}
              className="reaction-bubble reaction-bubble--anchored"
              role="status"
              data-testid="kitten-bubble"
              data-placement={placement}
              initial={
                reducedMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 8,
                      scale: 0.92,
                      rotate: -1,
                    }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 }}
              transition={
                reducedMotion
                  ? { duration: 0.01 }
                  : { type: 'spring', stiffness: 410, damping: 27, mass: 0.68 }
              }
            >
              <span className="dialogue-identity dialogue-identity--kitten" aria-hidden="true">
                <SpeakerIcon speaker="kitten" scenario={scenario} />
              </span>
              <span className="sr-only">{t('shared.kitten')}</span>
              <span>{reaction}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
