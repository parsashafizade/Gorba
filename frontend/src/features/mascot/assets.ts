const gazeCenter = `${import.meta.env.BASE_URL}mascot/01_gaze_center_idle.webp`;
import gazeLeft from '../../assets/bee-kitten/gaze/02_gaze_left.webp';
import gazeRight from '../../assets/bee-kitten/gaze/03_gaze_right.webp';
import gazeUp from '../../assets/bee-kitten/gaze/04_gaze_up.webp';
import gazeDown from '../../assets/bee-kitten/gaze/05_gaze_down.webp';
import gazeUpLeft from '../../assets/bee-kitten/gaze/06_gaze_up_left.webp';
import gazeUpRight from '../../assets/bee-kitten/gaze/07_gaze_up_right.webp';
import gazeDownLeft from '../../assets/bee-kitten/gaze/08_gaze_down_left.webp';
import gazeDownRight from '../../assets/bee-kitten/gaze/09_gaze_down_right.webp';
import blinkHalf from '../../assets/bee-kitten/micro/10_micro_blink_half.webp';
import blinkClosed from '../../assets/bee-kitten/micro/11_micro_blink_closed.webp';
import sadSoft from '../../assets/bee-kitten/emotion/12_emotion_sad_soft.webp';
import sadPleading from '../../assets/bee-kitten/emotion/13_emotion_sad_pleading.webp';
import angryPouty from '../../assets/bee-kitten/emotion/14_emotion_angry_pouty.webp';
import happySoft from '../../assets/bee-kitten/emotion/15_emotion_happy_soft.webp';
import happyExcited from '../../assets/bee-kitten/emotion/16_emotion_happy_excited_yes.webp';
import pointDown from '../../assets/bee-kitten/action/17_action_point_down_cat_right_paw.webp';
import headTilt from '../../assets/bee-kitten/idle/18_idle_head_tilt_playful.webp';

export const mascotAssets = {
  gaze: {
    center: gazeCenter,
    left: gazeLeft,
    right: gazeRight,
    up: gazeUp,
    down: gazeDown,
    upLeft: gazeUpLeft,
    upRight: gazeUpRight,
    downLeft: gazeDownLeft,
    downRight: gazeDownRight,
  },
  micro: {
    blinkHalf,
    blinkClosed,
  },
  emotion: {
    sadSoft,
    sadPleading,
    angryPouty,
    happySoft,
    happyExcited,
  },
  action: { pointDown },
  idle: { headTilt },
} as const;

export type MascotAssetKey =
  | `gaze.${keyof typeof mascotAssets.gaze}`
  | `micro.${keyof typeof mascotAssets.micro}`
  | `emotion.${keyof typeof mascotAssets.emotion}`
  | `action.${keyof typeof mascotAssets.action}`
  | `idle.${keyof typeof mascotAssets.idle}`;

const assetLookup = Object.fromEntries(
  Object.entries(mascotAssets).flatMap(([group, entries]) =>
    Object.entries(entries).map(([name, src]) => [`${group}.${name}`, src]),
  ),
) as Record<MascotAssetKey, string>;

export const getMascotAsset = (key: MascotAssetKey) => assetLookup[key];
export const allMascotAssetUrls = Object.values(assetLookup);

export const alignmentByAsset: Partial<Record<MascotAssetKey, { x: number; y: number }>> = {
  'action.pointDown': { x: 0, y: 1 },
  'idle.headTilt': { x: 1, y: 0 },
};
