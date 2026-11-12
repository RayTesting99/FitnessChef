import { FoodResult } from '../types';

export type Basis = 'per100' | 'serving';

export interface ManualTexts {
  name: string;
  grams: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export const EMPTY_MANUAL: ManualTexts = { name: '', grams: '100', calories: '', protein: '', carbs: '', fat: '' };

const MAX_NAME = 80;
const MAX_GRAMS = 5000;
// Per-100g sanity limits: pure fat is ~900 kcal/100 g and no macro can exceed 100 g per 100 g.
const MAX_CAL100 = 900;
const MAX_MACRO100 = 100;

let nextId = -1_000_000;

function num(text: string): number {
  const t = text.trim().replace(',', '.');
  return t === '' ? NaN : Number(t);
}

/**
 * Validates the form and returns macros normalized to per 100 g (the app's storage format).
 * With basis "serving" the typed macros are for the whole `grams` amount (like a nutrition label).
 * Calories may be left blank and are then computed from the macros (4/4/9 kcal per g).
 */
export function parseManual(
  t: ManualTexts,
  basis: Basis,
): { food: FoodResult; grams: number } | { error: string } {
  const name = t.name.trim();
  if (!name) return { error: 'Enter a food name.' };
  if (name.length > MAX_NAME) return { error: `Name must be at most ${MAX_NAME} characters.` };

  const grams = num(t.grams);
  if (!Number.isFinite(grams) || grams <= 0 || grams > MAX_GRAMS) {
    return { error: `Grams must be a number between 0 and ${MAX_GRAMS}.` };
  }

  const fields: [string, string][] = [
    ['Protein', t.protein],
    ['Carbs', t.carbs],
    ['Fat', t.fat],
  ];
  const [protein, carbs, fat] = fields.map(([label, text]) => {
    // A blank macro counts as 0 so people can skip ones they don't know.
    const n = text.trim() === '' ? 0 : num(text);
    return { label, n };
  });
  for (const m of [protein, carbs, fat]) {
    if (!Number.isFinite(m.n) || m.n < 0) return { error: `${m.label}: enter a number (0 or more).` };
  }

  let calories = num(t.calories);
  if (t.calories.trim() === '') {
    calories = protein.n * 4 + carbs.n * 4 + fat.n * 9;
  } else if (!Number.isFinite(calories) || calories < 0) {
    return { error: 'Calories: enter a number (0 or more), or leave blank to calculate.' };
  }

  if (calories === 0 && protein.n === 0 && carbs.n === 0 && fat.n === 0) {
    return { error: 'Enter at least one nutrition value.' };
  }

  const k = basis === 'serving' ? 100 / grams : 1;
  const food: FoodResult = {
    fdcId: nextId--,
    name,
    brand: 'Manual entry',
    cal100: calories * k,
    protein100: protein.n * k,
    carbs100: carbs.n * k,
    fat100: fat.n * k,
  };

  if (food.cal100 > MAX_CAL100) {
    return {
      error:
        basis === 'serving'
          ? 'Those values are too high for the grams entered. Check the amount, or switch to "per 100 g".'
          : `Calories can't exceed ${MAX_CAL100} per 100 g.`,
    };
  }
  if (food.protein100 > MAX_MACRO100 || food.carbs100 > MAX_MACRO100 || food.fat100 > MAX_MACRO100) {
    return {
      error:
        basis === 'serving'
          ? 'Macros exceed 100 g per 100 g. Check the amount, or the basis.'
          : "A macro can't exceed 100 g per 100 g.",
    };
  }
  if (food.protein100 + food.carbs100 + food.fat100 > 100.5) {
    return { error: 'Protein + carbs + fat exceed 100 g per 100 g. Check your numbers.' };
  }

  return { food, grams };
}
