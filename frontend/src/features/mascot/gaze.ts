import { mascotBehavior } from './config';
import type { MascotAssetKey } from './assets';

export type Point = { x: number; y: number };

type Axis = -1 | 0 | 1;

const axisFromDelta = (delta: number, previous: Axis): Axis => {
  const enter = mascotBehavior.gazeDeadZone;
  const exit = enter - mascotBehavior.gazeHysteresis;

  if (previous === -1 && delta < -exit) return -1;
  if (previous === 1 && delta > exit) return 1;
  if (delta < -enter) return -1;
  if (delta > enter) return 1;
  return 0;
};

const gazeAxes: Record<MascotAssetKey, [Axis, Axis]> = {
  'gaze.center': [0, 0],
  'gaze.left': [-1, 0],
  'gaze.right': [1, 0],
  'gaze.up': [0, -1],
  'gaze.down': [0, 1],
  'gaze.upLeft': [-1, -1],
  'gaze.upRight': [1, -1],
  'gaze.downLeft': [-1, 1],
  'gaze.downRight': [1, 1],
  'micro.blinkHalf': [0, 0],
  'micro.blinkClosed': [0, 0],
  'emotion.sadSoft': [0, 0],
  'emotion.sadPleading': [0, 0],
  'emotion.angryPouty': [0, 0],
  'emotion.happySoft': [0, 0],
  'emotion.happyExcited': [0, 0],
  'action.pointDown': [0, 1],
  'idle.headTilt': [1, 0],
};

const keyByAxes: Record<`${Axis},${Axis}`, MascotAssetKey> = {
  '-1,-1': 'gaze.upLeft',
  '0,-1': 'gaze.up',
  '1,-1': 'gaze.upRight',
  '-1,0': 'gaze.left',
  '0,0': 'gaze.center',
  '1,0': 'gaze.right',
  '-1,1': 'gaze.downLeft',
  '0,1': 'gaze.down',
  '1,1': 'gaze.downRight',
};

export const mapPointerToGaze = (
  point: Point,
  center: Point,
  previous: MascotAssetKey = 'gaze.center',
): MascotAssetKey => {
  const [previousX, previousY] = gazeAxes[previous];
  const x = axisFromDelta(point.x - center.x, previousX);
  const y = axisFromDelta(point.y - center.y, previousY);
  return keyByAxes[`${x},${y}`];
};
