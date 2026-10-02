// Macros are stored per 100 g (matches the backend contract) and scaled by grams for display/totals.
export interface Per100 {
  cal100: number;
  protein100: number;
  carbs100: number;
  fat100: number;
}

export interface FoodResult extends Per100 {
  fdcId: number;
  name: string;
  brand?: string;
}

export interface Entry extends Per100 {
  id: string;
  name: string;
  grams: number;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  /** Epoch ms, for ordering within a day. */
  loggedAt: number;
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type Targets = Macros;
