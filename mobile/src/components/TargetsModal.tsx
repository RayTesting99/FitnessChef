import React, { useEffect, useState } from 'react';
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
import { DEFAULT_TARGETS, parseTargets, TARGET_FIELDS } from '../lib/targets';
import { colors, fonts, radius, spacing } from '../theme';
import { Targets } from '../types';

interface Props {
  visible: boolean;
  targets: Targets;
  onSave: (t: Targets) => void;
  onClose: () => void;
}

type Texts = Record<keyof Targets, string>;

function toTexts(t: Targets): Texts {
  return {
    calories: String(t.calories),
    protein: String(t.protein),
    carbs: String(t.carbs),
    fat: String(t.fat),
  };
}

export function TargetsModal({ visible, targets, onSave, onClose }: Props) {
  const [texts, setTexts] = useState<Texts>(toTexts(targets));
  const [error, setError] = useState<string | null>(null);

  // Start from the saved values each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setTexts(toTexts(targets));
      setError(null);
    }
  }, [visible, targets]);

  function save() {
    const parsed = parseTargets(texts);
    if ('error' in parsed) {
      setError(parsed.error);
      return;
    }
    onSave(parsed.targets);
  }

  // Rough check: 4 kcal/g protein and carbs, 9 kcal/g fat.
  const p = Number(texts.protein), c = Number(texts.carbs), f = Number(texts.fat);
  const macroKcal = [p, c, f].every(Number.isFinite) ? Math.round(p * 4 + c * 4 + f * 9) : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Daily targets</Text>
            {TARGET_FIELDS.map((f) => (
              <View key={f.key}>
                <Text style={styles.label}>
                  {f.label} ({f.unit})
                </Text>
                <TextInput
                  style={styles.input}
                  value={texts[f.key]}
                  onChangeText={(v) => setTexts((prev) => ({ ...prev, [f.key]: v }))}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                  maxLength={6}
                />
              </View>
            ))}
            {macroKcal !== null ? (
              <Text style={styles.hint}>
                Your macros add up to about {macroKcal} kcal (calorie target: {texts.calories || '–'}).
              </Text>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable style={styles.cta} onPress={save}>
              <Text style={styles.ctaText}>Save</Text>
            </Pressable>
            <Pressable style={styles.secondary} onPress={() => setTexts(toTexts(DEFAULT_TARGETS))}>
              <Text style={styles.secondaryText}>Reset to defaults</Text>
            </Pressable>
            <Pressable style={styles.secondary} onPress={onClose}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg },
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
  hint: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginBottom: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaText: { color: colors.onPrimary, fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold },
  secondary: { paddingVertical: spacing.md, alignItems: 'center' },
  secondaryText: { color: colors.primary, fontSize: fonts.sizes.md, fontWeight: fonts.weights.medium },
});
