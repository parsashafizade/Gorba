import { interactionBehavior } from './interactionConfig';

export type Bounds = { x: number; y: number; width: number; height: number };
export type Position = { x: number; y: number };
export type NoZone =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'middleLeft'
  | 'middleRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

export const noZones: NoZone[] = [
  'topLeft',
  'topCenter',
  'topRight',
  'middleLeft',
  'middleRight',
  'bottomLeft',
  'bottomCenter',
  'bottomRight',
];

const overlaps = (a: Bounds, b: Bounds, padding: number) =>
  a.x < b.x + b.width + padding &&
  a.x + a.width + padding > b.x &&
  a.y < b.y + b.height + padding &&
  a.y + a.height + padding > b.y;

const shuffle = <T>(items: T[], random: () => number) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

export const takeNextNoZone = ({
  bag,
  recent,
  random = Math.random,
}: {
  bag: NoZone[];
  recent: NoZone[];
  random?: () => number;
}): { zone: NoZone; bag: NoZone[] } => {
  const nextBag = bag.length ? [...bag] : shuffle(noZones, random);
  const avoid = new Set(recent.slice(-2));
  let nextIndex = nextBag.findIndex((zone) => !avoid.has(zone));
  if (nextIndex < 0) nextIndex = nextBag.findIndex((zone) => zone !== recent.at(-1));
  if (nextIndex < 0) nextIndex = 0;
  const [zone] = nextBag.splice(nextIndex, 1);
  return { zone, bag: nextBag };
};

export const buttonScales = (attempt: number) => ({
  no: Number(
    Math.max(
      interactionBehavior.buttons.noMinimumScale,
      1 - attempt * interactionBehavior.buttons.noScaleStep,
    ).toFixed(2),
  ),
  yes: Number(
    Math.min(
      interactionBehavior.buttons.yesMaximumScale,
      1 + attempt * interactionBehavior.buttons.yesScaleStep,
    ).toFixed(2),
  ),
});

const zoneRanges: Record<NoZone, { x: [number, number]; y: [number, number] }> = {
  topLeft: { x: [0, 0.2], y: [0, 0.18] },
  topCenter: { x: [0.35, 0.65], y: [0, 0.18] },
  topRight: { x: [0.8, 1], y: [0, 0.18] },
  middleLeft: { x: [0, 0.08], y: [0.34, 0.66] },
  middleRight: { x: [0.92, 1], y: [0.34, 0.66] },
  bottomLeft: { x: [0, 0.2], y: [0.82, 1] },
  bottomCenter: { x: [0.35, 0.65], y: [0.82, 1] },
  bottomRight: { x: [0.8, 1], y: [0.82, 1] },
};

export const findSafeNoPosition = ({
  container,
  button,
  forbidden,
  zone,
  previous,
  random = Math.random,
}: {
  container: Bounds;
  button: Pick<Bounds, 'width' | 'height'>;
  forbidden: Bounds[];
  zone: NoZone;
  previous?: Position;
  random?: () => number;
}): Position => {
  const margin = Math.min(
    interactionBehavior.buttons.randomMovementMargin,
    Math.max(8, container.width * 0.025),
  );
  const clearance = Math.min(8, Math.max(4, container.width * 0.0125));
  const maxX = Math.max(margin, container.width - button.width - margin);
  const maxY = Math.max(margin, container.height - button.height - margin);
  const range = zoneRanges[zone];
  const positionInRange = (axis: 'x' | 'y', factor: number) => {
    const [start, end] = range[axis];
    const maximum = axis === 'x' ? maxX : maxY;
    return margin + (start + (end - start) * factor) * (maximum - margin);
  };
  const candidates: Position[] = [
    { x: positionInRange('x', 0.5), y: positionInRange('y', 0.5) },
    ...Array.from({ length: 20 }, () => ({
      x: positionInRange('x', random()),
      y: positionInRange('y', random()),
    })),
  ];

  let best: Position | null = null;
  let bestScore = -1;
  for (const candidate of candidates) {
    const rect = { ...candidate, width: button.width, height: button.height };
    if (forbidden.some((area) => overlaps(rect, area, clearance))) continue;
    const distance = previous ? Math.hypot(candidate.x - previous.x, candidate.y - previous.y) : 1;
    if (distance > bestScore) {
      best = candidate;
      bestScore = distance;
    }
  }

  if (!best) {
    const globalCandidates = noZones.map((fallbackZone) => {
      const fallbackRange = zoneRanges[fallbackZone];
      return {
        x: margin + ((fallbackRange.x[0] + fallbackRange.x[1]) / 2) * (maxX - margin),
        y: margin + ((fallbackRange.y[0] + fallbackRange.y[1]) / 2) * (maxY - margin),
      };
    });
    best = globalCandidates.find(
      (candidate) =>
        !forbidden.some((area) =>
          overlaps({ ...candidate, width: button.width, height: button.height }, area, clearance),
        ),
    ) ?? { x: margin, y: margin };
  }

  return {
    x: Math.min(maxX, Math.max(margin, best.x)),
    y: Math.min(maxY, Math.max(margin, best.y)),
  };
};
