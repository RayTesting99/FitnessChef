import { FoodResult } from '../types';

// Dev only: EXPO_PUBLIC_* values are bundled into the client. Move USDA calls behind the backend before release.
// DEMO_KEY works but is heavily rate limited; get a free key at https://fdc.nal.usda.gov/api-key-signup
const API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
const BASE = 'https://api.nal.usda.gov/fdc/v1';

interface UsdaNutrient {
  nutrientId?: number;
  nutrientNumber?: string;
  value?: number;
}

interface UsdaFood {
  fdcId: number;
  description: string;
  brandName?: string;
  brandOwner?: string;
  foodNutrients?: UsdaNutrient[];
}

// Energy has several ids: 1008 (kcal), 2047/2048 (Atwater factors, used by Foundation foods).
function pick(nutrients: UsdaNutrient[], ids: number[], numbers: string[]): number {
  for (const id of ids) {
    const n = nutrients.find((x) => x.nutrientId === id);
    if (n?.value != null) return n.value;
  }
  const n = nutrients.find((x) => x.nutrientNumber && numbers.includes(x.nutrientNumber));
  return n?.value ?? 0;
}

function toResult(f: UsdaFood): FoodResult {
  const n = f.foodNutrients ?? [];
  return {
    fdcId: f.fdcId,
    name: titleCase(f.description),
    brand: f.brandName || f.brandOwner,
    // Search results report nutrients per 100 g.
    cal100: pick(n, [1008, 2047, 2048], ['208']),
    protein100: pick(n, [1003], ['203']),
    carbs100: pick(n, [1005], ['205']),
    fat100: pick(n, [1004], ['204']),
  };
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/(^|[\s,(])([a-z])/g, (_, p, c) => p + c.toUpperCase());
}

export async function searchFoods(query: string, signal?: AbortSignal): Promise<FoodResult[]> {
  const url =
    `${BASE}/foods/search?api_key=${encodeURIComponent(API_KEY)}` +
    `&query=${encodeURIComponent(query)}&pageSize=25`;
  const res = await fetch(url, { signal });
  if (res.status === 429) throw new Error('USDA rate limit reached. Add your own API key or try again later.');
  if (!res.ok) throw new Error(`USDA search failed (${res.status})`);
  const json = (await res.json()) as { foods?: UsdaFood[] };
  return (json.foods ?? []).map(toResult).filter((f) => f.cal100 > 0 || f.protein100 > 0 || f.carbs100 > 0 || f.fat100 > 0);
}
