import { Entry, Macros, Per100 } from '../types';

export const EMPTY_MACROS: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export function scale(per100: Per100, grams: number): Macros {
  const f = grams / 100;
  return {
    calories: per100.cal100 * f,
    protein: per100.protein100 * f,
    carbs: per100.carbs100 * f,
    fat: per100.fat100 * f,
  };
}

export function entryMacros(e: Entry): Macros {
  return scale(e, e.grams);
}

export function sumMacros(entries: Entry[]): Macros {
  return entries.reduce<Macros>((acc, e) => {
    const m = entryMacros(e);
    return {
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    };
  }, EMPTY_MACROS);
}
