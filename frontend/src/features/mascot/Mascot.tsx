import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  alignmentByAsset,
  allMascotAssetUrls,
  getMascotAsset,
  type MascotAssetKey,
} from './assets';
import { assetMotion, mascotBehavior } from './config';
import { mapPointerToGaze } from './gaze';

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

  return (
    <motion.div
      className="mascot-stage"
      animate={microMotion}
      transition={reducedMotion ? { duration: 0.08 } : { type: 'spring', ...mascotBehavior.spring }}
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
  emotion: MascotAssetKey;
  reaction?: string | null;
  trackingEnabled: boolean;
  companion?: boolean;
};

export function Mascot({ emotion, reaction, trackingEnabled, companion = false }: MascotProps) {
  const { t } = useTranslation();
  const stageHostRef = useRef<HTMLDivElement>(null);
  const gazeRef = useRef<MascotAssetKey>('gaze.center');
  const rafRef = useRef<number | null>(null);
  const [gaze, setGaze] = useState<MascotAssetKey>('gaze.center');
  const [temporary, setTemporary] = useState<MascotAssetKey | null>(null);
  const [showHint, setShowHint] = useState(false);
  const requestedAsset = trackingEnabled ? (temporary ?? gaze) : emotion;

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
    let sequenceTimer: number | undefined;
    const delay = mascotBehavior.blink.minimumDelay + Math.random() * mascotBehavior.blink.variance;
    const timer = window.setTimeout(() => {
      setTemporary('micro.blinkHalf');
      sequenceTimer = window.setTimeout(() => {
        setTemporary('micro.blinkClosed');
        sequenceTimer = window.setTimeout(() => {
          setTemporary('micro.blinkHalf');
          sequenceTimer = window.setTimeout(() => setTemporary(null), mascotBehavior.blink.halfMs);
        }, mascotBehavior.blink.closedMs);
      }, mascotBehavior.blink.halfMs);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      if (sequenceTimer) window.clearTimeout(sequenceTimer);
    };
  }, [trackingEnabled, gaze]);

  useEffect(() => {
    if (!trackingEnabled) return;
    const timer = window.setTimeout(() => {
      setTemporary('action.pointDown');
      setShowHint(true);
      window.setTimeout(() => {
        setTemporary(null);
        setShowHint(false);
      }, 1500);
    }, mascotBehavior.idleHintDelay);
    return () => window.clearTimeout(timer);
  }, [trackingEnabled]);

  return (
    <motion.div
      ref={stageHostRef}
      layout
      className={`mascot ${companion ? 'mascot--companion' : ''}`}
      aria-label="Bee-costume kitten mascot"
    >
      <MascotStage assetKey={requestedAsset} />
      <AnimatePresence mode="wait">
        {(reaction || (trackingEnabled && showHint)) && (
          <motion.div
            key={reaction ?? 'idle-hint'}
            className="reaction-bubble"
            role="status"
            initial={{ opacity: 0, y: 7, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.18 }}
          >
            {reaction ?? t('shared.answerHint')}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
