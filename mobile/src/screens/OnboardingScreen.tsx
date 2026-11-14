import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
import { Art } from '../art/Art';
import { Decor } from '../art/Decor';
import { KITCHEN_DECOR } from '../art/decor';
import { parseTargets, TARGET_FIELDS } from '../lib/targets';
import { fonts, kitchen as colors, radius, shadow, spacing } from '../theme';
import { Targets } from '../types';

interface Props {
  initialTargets: Targets;
  onDone: (t: Targets) => void;
}

type Texts = Record<keyof Targets, string>;
const toTexts = (t: Targets): Texts => ({
  calories: String(t.calories),
  protein: String(t.protein),
  carbs: String(t.carbs),
  fat: String(t.fat),
});

const WAYS: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  { icon: 'search', title: 'Search foods', text: 'Look up real, published nutrition data from the USDA database.' },
  { icon: 'create-outline', title: 'Enter it yourself', text: 'Type in exactly what is on the label, per serving or per 100 g.' },
  {
    icon: 'sparkles',
    title: 'Estimate with AI',
    text: 'Describe a meal in a sentence and get an estimate. It is a smart guess, so check it and edit if you know better.',
  },
];

/** First-launch welcome tour: welcome, how logging works, then set daily targets. */
export function OnboardingScreen({ initialTargets, onDone }: Props) {
  const [page, setPage] = useState(0);
  const [texts, setTexts] = useState<Texts>(toTexts(initialTargets));
  const [error, setError] = useState<string | null>(null);
  const last = page === 2;

  function finish() {
    const parsed = parseTargets(texts);
    if ('error' in parsed) {
      setError(parsed.error);
      return;
    }
    onDone(parsed.targets);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Decor items={KITCHEN_DECOR} opacity={0.35} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
            ))}
          </View>
          {!last ? (
            <Pressable onPress={() => onDone(initialTargets)} hitSlop={12}>
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {page === 0 ? (
            <View style={styles.center}>
              <Art name="bear" size={150} />
              <Text style={styles.title}>Welcome to FitnessChef</Text>
              <Text style={styles.lead}>
                A cozy little tracker for your calories and macros. Log what you eat, hit your daily targets, and keep your streak going.
              </Text>
            </View>
          ) : null}

          {page === 1 ? (
            <View>
              <Text style={styles.titleLeft}>Three ways to log a meal</Text>
              {WAYS.map((w) => (
                <View key={w.title} style={[styles.card, shadow.card]}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={w.icon} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{w.title}</Text>
                    <Text style={styles.cardText}>{w.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {page === 2 ? (
            <View>
              <Text style={styles.titleLeft}>Set your daily targets</Text>
              <Text style={styles.leadLeft}>
                These are just starting numbers. You can change them any time with the pencil icon on the Home screen.
              </Text>
              {TARGET_FIELDS.map((f) => (
                <View key={f.key}>
                  <Text style={styles.label}>
                    {f.label} ({f.unit})
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={texts[f.key]}
                    onChangeText={(v) => {
                      setTexts((prev) => ({ ...prev, [f.key]: v }));
                      setError(null);
                    }}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    maxLength={6}
                  />
                </View>
              ))}
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          {page > 0 ? (
            <Pressable style={styles.back} onPress={() => setPage(page - 1)}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.back} />
          )}
          <Pressable style={styles.cta} onPress={last ? finish : () => setPage(page + 1)}>
            <Text style={styles.ctaText}>{last ? 'Start tracking' : 'Next'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.primary, width: 22 },
  skip: { color: colors.textMuted, fontSize: fonts.sizes.md },
  body: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  center: { alignItems: 'center' },
  title: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  lead: { fontSize: fonts.sizes.md, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md, lineHeight: 22 },
  titleLeft: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text, marginBottom: spacing.lg },
  leadLeft: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 20 },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold, color: colors.text },
  cardText: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: 2, lineHeight: 20 },
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
  error: { color: colors.danger, marginBottom: spacing.md },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  back: { minWidth: 80, paddingVertical: spacing.md },
  backText: { color: colors.primary, fontSize: fonts.sizes.md, fontWeight: fonts.weights.medium },
  cta: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  ctaText: { color: colors.onPrimary, fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold },
});
