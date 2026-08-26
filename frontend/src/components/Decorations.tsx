import { motion, useReducedMotion } from 'motion/react';
import type { ScenarioId } from '../features/experience/model';

const stickerSets: Record<ScenarioId, string[]> = {
  raise: ['paycheck', 'coins', 'chart', 'mug', 'percent'],
  hire: ['resume', 'briefcase', 'laptop', 'hired', 'badge'],
  date: ['coffee', 'cake', 'ticket', 'polaroid', 'flower'],
};

export function Decorations({ scenario }: { scenario: ScenarioId }) {
  const reduced = useReducedMotion();
  return (
    <div className="decorations" aria-hidden="true">
      {stickerSets[scenario].map((kind, index) => (
        <motion.div
          key={kind}
          className={`sticker sticker--${kind} sticker--position-${index + 1}`}
          animate={
            reduced
              ? undefined
              : {
                  y: [0, index % 2 ? -5 : 4, 0],
                  rotate: [0, index % 2 ? 2.5 : -2.5, 0],
                }
          }
          transition={{ duration: 6 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <StickerArt kind={kind} />
        </motion.div>
      ))}
    </div>
  );
}

function StickerArt({ kind }: { kind: string }) {
  if (kind === 'paycheck')
    return (
      <div className="sticker-paper">
        <b>PAY</b>
        <i />
        <i />
        <span>+$</span>
      </div>
    );
  if (kind === 'coins')
    return (
      <div className="sticker-coins">
        <i />
        <i />
        <i />
      </div>
    );
  if (kind === 'chart')
    return (
      <div className="sticker-chart">
        <i />
        <i />
        <i />
        <b>↗</b>
      </div>
    );
  if (kind === 'mug' || kind === 'coffee')
    return (
      <div className="sticker-mug">
        <i />
        <b>{kind === 'coffee' ? '♡' : '☕'}</b>
      </div>
    );
  if (kind === 'percent') return <div className="sticker-tag">+%</div>;
  if (kind === 'resume')
    return (
      <div className="sticker-resume">
        <b>CV</b>
        <i />
        <i />
        <span>★</span>
      </div>
    );
  if (kind === 'briefcase')
    return (
      <div className="sticker-briefcase">
        <i />
        <b>✓</b>
      </div>
    );
  if (kind === 'laptop')
    return (
      <div className="sticker-laptop">
        <i>⌁</i>
      </div>
    );
  if (kind === 'hired') return <div className="sticker-stamp">HIRED</div>;
  if (kind === 'badge')
    return (
      <div className="sticker-badge">
        <b>★</b>
        <i />
      </div>
    );
  if (kind === 'cake')
    return (
      <div className="sticker-cake">
        <i />
        <b>♡</b>
      </div>
    );
  if (kind === 'ticket')
    return (
      <div className="sticker-ticket">
        <b>2 ×</b>
        <span>20:00</span>
      </div>
    );
  if (kind === 'polaroid')
    return (
      <div className="sticker-polaroid">
        <i />
        <b>♡</b>
      </div>
    );
  return (
    <div className="sticker-flower">
      <i />
      <i />
      <i />
      <i />
      <b />
    </div>
  );
}
