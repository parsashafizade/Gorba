import { mascotBehavior } from '../mascot/config';

export type Bounds = { x: number; y: number; width: number; height: number };
export type Position = { x: number; y: number };

const overlaps = (a: Bounds, b: Bounds, padding = 14) =>
  a.x < b.x + b.width + padding &&
  a.x + a.width + padding > b.x &&
  a.y < b.y + b.height + padding &&
  a.y + a.height + padding > b.y;

export const buttonScales = (attempt: number) => ({
  no: Math.max(mascotBehavior.noMinimumScale, 1 - attempt * 0.1),
  yes: Math.min(mascotBehavior.yesMaximumScale, 1 + attempt * 0.08),
});

export const findSafeNoPosition = ({
  container,
  button,
  forbidden,
  previous,
  random = Math.random,
}: {
  container: Bounds;
  button: Pick<Bounds, 'width' | 'height'>;
  forbidden: Bounds[];
  previous?: Position;
  random?: () => number;
}): Position => {
  const margin = Math.min(mascotBehavior.randomMovementMargin, container.width * 0.035);
  const maxX = Math.max(margin, container.width - button.width - margin);
  const maxY = Math.max(margin, container.height - button.height - margin);
  let best = { x: margin, y: margin };
  let bestScore = -1;

  const anchors: Position[] = [
    { x: margin, y: margin },
    { x: maxX, y: margin },
    { x: margin, y: maxY },
    { x: maxX, y: maxY },
    { x: (margin + maxX) / 2, y: margin },
    { x: (margin + maxX) / 2, y: maxY },
  ];
  const randomCandidates = Array.from({ length: 32 }, () => ({
    x: margin + random() * Math.max(0, maxX - margin),
    y: margin + random() * Math.max(0, maxY - margin),
  }));

  for (const candidate of [...anchors, ...randomCandidates]) {
    const rect = { ...candidate, width: button.width, height: button.height };
    if (forbidden.some((area) => overlaps(rect, area))) continue;

    const distance = previous
      ? Math.hypot(candidate.x - previous.x, candidate.y - previous.y)
      : Math.hypot(candidate.x - container.width / 2, candidate.y - container.height / 2);
    if (distance > bestScore) {
      best = candidate;
      bestScore = distance;
    }
  }

  return {
    x: Math.min(maxX, Math.max(margin, best.x)),
    y: Math.min(maxY, Math.max(margin, best.y)),
  };
};
