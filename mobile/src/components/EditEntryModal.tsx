import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ManualTexts, parseManual } from '../lib/manual';
import { scale } from '../lib/macros';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { Entry } from '../types';

interface Props {
  entry: Entry | null;
  onSave: (id: string, patch: Pick<Entry, 'name' | 'grams' | 'cal100' | 'protein100' | 'carbs100' | 'fat100'>) => void;
  onClose: () => void;
}

// Up to 2 decimals, no trailing zeros, so editing doesn't visibly change untouched numbers.
const fmt = (n: number) => String(+n.toFixed(2));

function toTexts(e: Entry): ManualTexts {
  return {
    name: e.name,
    grams: fmt(e.grams),
    calories: fmt(e.cal100),
    protein: fmt(e.protein100),
    carbs: fmt(e.carbs100),
    fat: fmt(e.fat100),
  };
}

export function EditEntryModal({ entry, onSave, onClose }: Props) {
  const [t, setT] = useState<ManualTexts | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setT(entry ? toTexts(entry) : null);
    setError(null);
  }, [entry]);

  const parsed = useMemo(() => (t ? parseManual(t, 'per100') : null), [t]);
  const preview = parsed && 'food' in parsed ? scale(parsed.food, parsed.grams) : null;

  const set = (key: keyof ManualTexts) => (v: string) => {
    setT((prev) => (prev ? { ...prev, [key]: v } : prev));
    setError(null);
  };

  function save() {
    if (!entry || !parsed) return;
    if ('error' in parsed) {
      setError(parsed.error);
      return;
    }
    const { food, grams } = parsed;
    onSave(entry.id, {
      name: food.name,
      grams,
      cal100: food.cal100,
      protein100: food.protein100,
      carbs100: food.carbs100,
      fat100: food.fat100,
    });
  }

  return (
    <Modal visible={!!entry} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {t ? (
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <Text style={styles.title}>Edit entry</Text>

              <Text style={styles.label}>Food name</Text>
              <TextInput style={styles.input} value={t.name} onChangeText={set('name')} maxLength={80} />

              <Text style={styles.label}>Amount eaten (grams)</Text>
              <TextInput
                style={styles.input}
                value={t.grams}
                onChangeText={set('grams')}
                keyboardType="decimal-pad"
                selectTextOnFocus
                maxLength={7}
              />

              <Text style={styles.section}>Nutrition per 100 g</Text>
              <Text style={styles.label}>Calories (kcal)</Text>
              <TextInput
                style={styles.input}
                value={t.calories}
                onChangeText={set('calories')}
                keyboardType="decimal-pad"
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
                    : 'Fix the highlighted problem to see the total'}
                </Text>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable style={[styles.cta, !preview && styles.ctaDisabled]} onPress={save}>
                <Text style={styles.ctaText}>Save changes</Text>
              </Pressable>
              <Pressable style={styles.secondary} onPress={onClose}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text, marginBottom: spacing.lg },
  section: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold, color: colors.text, marginBottom: spacing.sm },
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
  secondary: { paddingVertical: spacing.md, alignItems: 'center' },
  secondaryText: { color: colors.primary, fontSize: fonts.sizes.md, fontWeight: fonts.weights.medium },
});
