import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TARGETS, sanitizeTargets } from '../lib/targets';
import { Entry, FoodResult, Targets } from '../types';

const ENTRIES_KEY = 'fitnesschef.entries.v1';
const TARGETS_KEY = 'fitnesschef.targets.v1';

export { DEFAULT_TARGETS };

interface AppState {
  loaded: boolean;
  entries: Entry[];
  targets: Targets;
  setTargets: (t: Targets) => void;
  addEntry: (food: FoodResult, grams: number, date: string) => void;
  deleteEntry: (id: string) => void;
  /** Edits name, grams or per-100g macros. Keeps id, date and loggedAt so streak, XP and ordering are unchanged. */
  updateEntry: (id: string, patch: EntryPatch) => void;
}

export type EntryPatch = Partial<Pick<Entry, 'name' | 'grams' | 'cal100' | 'protein100' | 'carbs100' | 'fat100'>>;

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [targets, setTargetsState] = useState<Targets>(DEFAULT_TARGETS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const entriesP = AsyncStorage.getItem(ENTRIES_KEY).then((raw) => {
      if (raw) setEntries(JSON.parse(raw));
    });
    const targetsP = AsyncStorage.getItem(TARGETS_KEY).then((raw) => {
      if (raw) setTargetsState(sanitizeTargets(JSON.parse(raw)));
    });
    Promise.allSettled([entriesP, targetsP]).finally(() => setLoaded(true));
  }, []);

  // Only persist after the initial load so we never overwrite saved data with [].
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries)).catch(() => {});
  }, [entries, loaded]);

  const setTargets = useCallback((t: Targets) => {
    setTargetsState(t);
    AsyncStorage.setItem(TARGETS_KEY, JSON.stringify(t)).catch(() => {});
  }, []);

  const addEntry = useCallback((food: FoodResult, grams: number, date: string) => {
    const entry: Entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: food.name,
      grams,
      cal100: food.cal100,
      protein100: food.protein100,
      carbs100: food.carbs100,
      fat100: food.fat100,
      date,
      loggedAt: Date.now(),
    };
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback((id: string, patch: EntryPatch) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const value = useMemo<AppState>(
    () => ({ loaded, entries, targets, setTargets, addEntry, deleteEntry, updateEntry }),
    [loaded, entries, targets, setTargets, addEntry, deleteEntry, updateEntry],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
