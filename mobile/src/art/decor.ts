import { ArtName } from './Art';

export interface DecorItem {
  name: ArtName;
  /** Left / top of the piece as a % of the screen area. Pieces near edges are allowed to bleed off-screen. */
  x: number;
  y: number;
  size: number;
  rotate?: number;
  opacity?: number;
}

// Layout idea: bold pieces in the corners and along the bottom (usually empty), a few peeking in from the sides.

/** Autumn kitchen, for the Log (food) screens. */
export const KITCHEN_DECOR: DecorItem[] = [
  { name: 'leaf', x: 76, y: -2, size: 70, rotate: 28 },
  { name: 'acorn', x: 90, y: 9, size: 42, rotate: -15 },
  { name: 'leafGreen', x: -6, y: 22, size: 54, rotate: -30 },
  { name: 'whisk', x: -3, y: 62, size: 66, rotate: -18 },
  { name: 'pumpkin', x: 14, y: 80, size: 78, rotate: -6 },
  { name: 'apple', x: 42, y: 84, size: 58, rotate: 8 },
  { name: 'mug', x: 62, y: 78, size: 66, rotate: 6 },
  { name: 'spoon', x: 87, y: 64, size: 76, rotate: 20 },
  { name: 'acorn', x: 84, y: 90, size: 44, rotate: 14 },
  { name: 'leaf', x: -4, y: 91, size: 52, rotate: 55 },
];

/** Gym gear, for Home. */
export const GYM_DECOR: DecorItem[] = [
  { name: 'dumbbell', x: 74, y: -1, size: 72, rotate: 18 },
  { name: 'star', x: 46, y: 1, size: 32, rotate: 12 },
  { name: 'kettlebell', x: -6, y: 44, size: 62, rotate: -14 },
  { name: 'bottle', x: 92, y: 40, size: 52, rotate: 14 },
  { name: 'dumbbell', x: 4, y: 82, size: 72, rotate: -16 },
  { name: 'kettlebell', x: 36, y: 84, size: 62, rotate: 6 },
  { name: 'bottle', x: 66, y: 82, size: 56, rotate: -10 },
  { name: 'star', x: 88, y: 88, size: 36, rotate: 14 },
  { name: 'star', x: 26, y: 70, size: 28, rotate: -10 },
];

/** Progress symbols, for History. */
export const PROGRESS_DECOR: DecorItem[] = [
  { name: 'star', x: 2, y: 1, size: 36, rotate: -12 },
  { name: 'star', x: 52, y: 1, size: 26, rotate: 10 },
  { name: 'sprout', x: -5, y: 40, size: 60, rotate: -8 },
  { name: 'trophy', x: 88, y: 38, size: 62, rotate: 10 },
  { name: 'stairsFlag', x: 3, y: 80, size: 76, rotate: -5 },
  { name: 'sprout', x: 40, y: 85, size: 56, rotate: 4 },
  { name: 'trophy', x: 66, y: 80, size: 68, rotate: -8 },
  { name: 'star', x: 90, y: 90, size: 34, rotate: 14 },
];
