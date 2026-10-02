import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dateKey } from '../lib/dates';
import { XP_PER_ENTRY } from '../lib/gamification';
import { scale } from '../lib/macros';
import { searchFoods } from '../lib/usda';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { FoodResult } from '../types';

export function LogMealScreen() {
  const nav = useNavigation<any>();
  const { addEntry } = useApp();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<FoodResult | null>(null);
  const [gramsText, setGramsText] = useState('100');

  const abortRef = useRef<AbortController | null>(null);

  // Search on submit (not per keystroke) so we don't burn the USDA hourly quota.
  async function runSearch() {
    const q = query.trim();
    if (q.length < 2) return;
    Keyboard.dismiss();
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchFoods(q, ctrl.signal));
      setSearched(true);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError(e?.message ?? 'Search failed');
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }

  useEffect(() => () => abortRef.current?.abort(), []);

  const grams = parseFloat(gramsText.replace(',', '.'));
  const validGrams = Number.isFinite(grams) && grams > 0;
  const preview = selected && validGrams ? scale(selected, grams) : null;

  function pick(food: FoodResult) {
    Keyboard.dismiss();
    setSelected(food);
    setGramsText('100');
  }

  function save() {
    if (!selected || !validGrams) return;
    addEntry(selected, grams, dateKey());
    setSelected(null);
    setQuery('');
    setResults([]);
    setSearched(false);
    nav.navigate('History');
  }

  if (selected) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.content}>
            <Pressable onPress={() => setSelected(null)}>
              <Text style={styles.back}>‹ Back to results</Text>
            </Pressable>
            <Text style={styles.foodName}>{selected.name}</Text>
            {selected.brand ? <Text style={styles.sub}>{selected.brand}</Text> : null}
            <Text style={styles.sub}>
              Per 100 g: {Math.round(selected.cal100)} kcal · P {selected.protein100.toFixed(1)} · C{' '}
              {selected.carbs100.toFixed(1)} · F {selected.fat100.toFixed(1)}
            </Text>

            <Text style={styles.fieldLabel}>Quantity (grams)</Text>
            <TextInput
              style={styles.input}
              value={gramsText}
              onChangeText={setGramsText}
              keyboardType="decimal-pad"
              selectTextOnFocus
              autoFocus
            />

            <View style={[styles.preview, shadow.card]}>
              <Text style={styles.previewKcal}>{preview ? Math.round(preview.calories) : '–'} kcal</Text>
              <Text style={styles.previewMacros}>
                {preview
                  ? `P ${preview.protein.toFixed(1)} g · C ${preview.carbs.toFixed(1)} g · F ${preview.fat.toFixed(1)} g`
                  : 'Enter a quantity above 0'}
              </Text>
            </View>

            <Pressable style={[styles.cta, !validGrams && styles.ctaDisabled]} disabled={!validGrams} onPress={save}>
              <Text style={styles.ctaText}>Add to today (+{XP_PER_ENTRY} XP)</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Log a meal</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={runSearch}
          placeholder="Search foods (e.g. beef flank)"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
          returnKeyType="search"
        />
        {loading ? <ActivityIndicator style={styles.spinner} color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FlatList
          data={results}
          keyExtractor={(f) => String(f.fdcId)}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            !loading && searched && !error ? <Text style={styles.sub}>No results. Try a different search.</Text> : null
          }
          renderItem={({ item }) => (
            <Pressable style={[styles.row, shadow.card]} onPress={() => pick(item)}>
              <Text style={styles.rowName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.sub} numberOfLines={1}>
                {item.brand ? `${item.brand} · ` : ''}
                {Math.round(item.cal100)} kcal / 100 g
              </Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flex: 1, padding: spacing.lg },
  title: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text, marginBottom: spacing.lg },
  back: { color: colors.primary, fontSize: fonts.sizes.md, fontWeight: fonts.weights.medium, marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fonts.sizes.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  spinner: { marginVertical: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowName: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.medium, color: colors.text, marginBottom: 2 },
  sub: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginBottom: spacing.xs },
  foodName: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold, color: colors.text, marginBottom: spacing.xs },
  fieldLabel: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.xs },
  preview: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  previewKcal: { fontSize: fonts.sizes.xxl, fontWeight: fonts.weights.bold, color: colors.calories },
  previewMacros: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: spacing.xs },
  cta: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.lg, alignItems: 'center' },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: colors.onPrimary, fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold },
});
