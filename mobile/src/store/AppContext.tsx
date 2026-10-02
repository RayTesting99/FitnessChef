import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Entry, FoodResult, Targets } from '../types';

const ENTRIES_KEY = 'fitnesschef.entries.v1';

export const DEFAULT_TARGETS: Targets = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

interface AppState {
  loaded: boolean;
  entries: Entry[];
  targets: Targets;
  addEntry: (food: FoodResult, grams: number, date: string) => void;
  deleteEntry: (id: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ENTRIES_KEY)
      .then((raw) => {
        if (raw) setEntries(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Only persist after the initial load so we never overwrite saved data with [].
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries)).catch(() => {});
  }, [entries, loaded]);

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

  const value = useMemo<AppState>(
    () => ({ loaded, entries, targets: DEFAULT_TARGETS, addEntry, deleteEntry }),
    [loaded, entries, addEntry, deleteEntry],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
