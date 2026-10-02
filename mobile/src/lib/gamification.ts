import { Entry } from '../types';
import { addDays, dateKey } from './dates';

export const XP_PER_ENTRY = 10;
const XP_BASE = 50; // level n starts at XP_BASE * (n-1)^2

/** XP is derived from the log, so deleting an entry also removes its XP (no farming). */
export function totalXp(entries: Entry[]): number {
  return entries.length * XP_PER_ENTRY;
}

export function levelInfo(xp: number) {
  const level = Math.floor(Math.sqrt(xp / XP_BASE)) + 1;
  const floor = XP_BASE * (level - 1) ** 2;
  const next = XP_BASE * level ** 2;
  return { level, xpIntoLevel: xp - floor, xpForLevel: next - floor };
}

/**
 * Consecutive local days with at least one entry. If nothing is logged yet today
 * the streak is still alive as long as yesterday was logged.
 */
export function currentStreak(entries: Entry[], today: string = dateKey()): number {
  const days = new Set(entries.map((e) => e.date));
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
