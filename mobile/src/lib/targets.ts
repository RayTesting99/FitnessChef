import { Targets } from '../types';

export const DEFAULT_TARGETS: Targets = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

export const TARGET_FIELDS: { key: keyof Targets; label: string; unit: string; min: number; max: number }[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', min: 500, max: 10000 },
  { key: 'protein', label: 'Protein', unit: 'g', min: 0, max: 1000 },
  { key: 'carbs', label: 'Carbs', unit: 'g', min: 0, max: 1000 },
  { key: 'fat', label: 'Fat', unit: 'g', min: 0, max: 1000 },
];

/** Validates user-typed values. Returns the targets, or a message for the first problem. */
export function parseTargets(texts: Record<keyof Targets, string>): { targets: Targets } | { error: string } {
  const out = { ...DEFAULT_TARGETS };
  for (const f of TARGET_FIELDS) {
    const raw = texts[f.key].trim().replace(',', '.');
    const n = Number(raw);
    if (raw === '' || !Number.isFinite(n)) return { error: `${f.label}: enter a number.` };
    if (n < f.min || n > f.max) return { error: `${f.label}: must be between ${f.min} and ${f.max}.` };
    out[f.key] = Math.round(n);
  }
  return { targets: out };
}

/** Defends against corrupt or hand-edited storage: falls back to defaults for any bad field. */
export function sanitizeTargets(raw: unknown): Targets {
  const out = { ...DEFAULT_TARGETS };
  if (raw && typeof raw === 'object') {
    for (const f of TARGET_FIELDS) {
      const n = (raw as Record<string, unknown>)[f.key];
      if (typeof n === 'number' && Number.isFinite(n) && n >= f.min && n <= f.max) out[f.key] = Math.round(n);
    }
  }
  return out;
}
