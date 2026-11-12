import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XP_PER_ENTRY } from '../lib/gamification';
import { Basis, EMPTY_MANUAL, ManualTexts, parseManual } from '../lib/manual';
import { scale } from '../lib/macros';
import { fonts, kitchen as colors, radius, shadow, spacing } from '../theme';
import { FoodResult } from '../types';

interface Props {
  onSave: (food: FoodResult, grams: number) => void;
  onBack: () => void;
}

export function ManualEntryForm({ onSave, onBack }: Props) {
  const [t, setT] = useState<ManualTexts>(EMPTY_MANUAL);
  const [basis, setBasis] = useState<Basis>('serving');
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof ManualTexts) => (v: string) => {
    setT((prev) => ({ ...prev, [key]: v }));
    setError(null);
  };

  const parsed = useMemo(() => parseManual(t, basis), [t, basis]);
  const preview = 'food' in parsed ? scale(parsed.food, parsed.grams) : null;

  function save() {
    if ('error' in parsed) {
      setError(parsed.error);
      return;
    }
    onSave(parsed.food, parsed.grams);
  }

  const macroLabel = basis === 'serving' ? 'for this amount' : 'per 100 g';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={onBack}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
          <Text style={styles.title}>Enter manually</Text>

          <Text style={styles.label}>Food name</Text>
          <TextInput
            style={styles.input}
            value={t.name}
            onChangeText={set('name')}
            placeholder="e.g. Protein bar"
            placeholderTextColor={colors.textMuted}
            maxLength={80}
          />

          <Text style={styles.label}>Amount eaten (grams)</Text>
          <TextInput
            style={styles.input}
            value={t.grams}
            onChangeText={set('grams')}
            keyboardType="decimal-pad"
            selectTextOnFocus
            maxLength={7}
          />

          <Text style={styles.label}>The nutrition values below are…</Text>
          <View style={styles.toggle}>
            {(
              [
                ['serving', 'For this amount'],
                ['per100', 'Per 100 g'],
              ] as [Basis, string][]
            ).map(([b, text]) => (
              <Pressable key={b} style={[styles.toggleBtn, basis === b && styles.toggleOn]} onPress={() => setBasis(b)}>
                <Text style={[styles.toggleText, basis === b && styles.toggleTextOn]}>{text}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Calories ({macroLabel}, blank = calculate from macros)</Text>
          <TextInput
            style={styles.input}
            value={t.calories}
            onChangeText={set('calories')}
            keyboardType="decimal-pad"
            placeholder="kcal"
            placeholderTextColor={colors.textMuted}
            maxLength={7}
          />
          <View style={styles.row}>
            {(
              [
                ['protein', 'Protein (g)'],
                ['carbs', 'Carbs (g)'],
                ['fat', 'Fat (g)'],
              ] as [keyof ManualTexts, string][]
            ).map(([key, label]) => (
              <View key={key} style={styles.col}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={t[key]}
                  onChangeText={set(key)}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  maxLength={7}
                />
              </View>
            ))}
          </View>

          <View style={[styles.preview, shadow.card]}>
            <Text style={styles.previewKcal}>{preview ? Math.round(preview.calories) : '–'} kcal</Text>
            <Text style={styles.previewMacros}>
              {preview
                ? `P ${preview.protein.toFixed(1)} g · C ${preview.carbs.toFixed(1)} g · F ${preview.fat.toFixed(1)} g`
                : 'Fill in the details above'}
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={[styles.cta, !preview && styles.ctaDisabled]} onPress={save}>
            <Text style={styles.ctaText}>Add to today (+{XP_PER_ENTRY} XP)</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  back: { color: colors.primary, fontSize: fonts.sizes.md, fontWeight: fonts.weights.medium, marginBottom: spacing.lg },
  title: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text, marginBottom: spacing.lg },
  label: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginBottom: spacing.xs },
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
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.track,
    borderRadius: radius.pill,
    padding: 3,
    marginBottom: spacing.md,
  },
  toggleBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center' },
  toggleOn: { backgroundColor: colors.surface },
  toggleText: { color: colors.textMuted, fontSize: fonts.sizes.sm, fontWeight: fonts.weights.medium },
  toggleTextOn: { color: colors.text },
  row: { flexDirection: 'row', gap: spacing.sm },
  col: { flex: 1 },
  preview: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  previewKcal: { fontSize: fonts.sizes.xxl, fontWeight: fonts.weights.bold, color: colors.calories },
  previewMacros: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: spacing.xs },
  error: { color: colors.danger, marginBottom: spacing.md },
  cta: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.lg, alignItems: 'center' },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: colors.onPrimary, fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold },
});
