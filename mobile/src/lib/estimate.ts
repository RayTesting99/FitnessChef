import { FoodResult } from '../types';

// Render's free tier sleeps when idle, so the first request can take up to a minute.
const BASE = process.env.EXPO_PUBLIC_API_URL || 'https://fitnesschef.onrender.com';
// Optional shared key (matches the server's APP_KEY). Note EXPO_PUBLIC_* values are bundled into the client,
// so this only deters casual abuse; real gating needs per-user auth server-side.
const APP_KEY = process.env.EXPO_PUBLIC_APP_KEY;
export const ESTIMATE_TIMEOUT_MS = 90_000;
export const MAX_FOOD_CHARS = 300;

/** Splits "200g chicken breast and rice" into { food: "chicken breast and rice", grams: 200 }. */
export function parseMealText(text: string): { food: string; grams?: number } {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(?:g|gr|gram|grams)\b/i);
  if (!m) return { food: text.trim() };
  const grams = parseFloat(m[1].replace(',', '.'));
  const food = text
    .replace(m[0], ' ')
    .replace(/^\s*of\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return { food: food || text.trim(), grams: Number.isFinite(grams) && grams > 0 ? grams : undefined };
}

let nextId = -1;

export async function estimateMeal(text: string, signal?: AbortSignal): Promise<{ result: FoodResult; grams?: number }> {
  const { food, grams } = parseMealText(text);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ESTIMATE_TIMEOUT_MS);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    const res = await fetch(`${BASE}/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(APP_KEY ? { 'x-app-key': APP_KEY } : {}) },
      body: JSON.stringify(grams ? { food, grams } : { food }),
      signal: ctrl.signal,
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 429) throw new Error('Too many estimates. Wait a minute and try again.');
    if (!res.ok) throw new Error(body?.error || `Estimate failed (${res.status})`);
    const nums = [body.cal100, body.protein100, body.carbs100, body.fat100].map(Number);
    if (nums.some((n) => !Number.isFinite(n) || n < 0)) throw new Error('The AI returned an unusable estimate. Try rewording.');
    const [cal100, protein100, carbs100, fat100] = nums;
    return { result: { fdcId: nextId--, name: food, brand: 'AI estimate', cal100, protein100, carbs100, fat100 }, grams };
  } catch (e: any) {
    if (e?.name === 'AbortError' && !signal?.aborted) {
      throw new Error('The server took too long to respond. Please try again.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
