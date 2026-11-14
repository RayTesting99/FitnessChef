import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { WavingAnimal } from '../components/WavingAnimal';
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

type Icon = keyof typeof Ionicons.glyphMap;
const MISSION: { icon: Icon; title: string; text: string }[] = [
  { icon: 'flash-outline', title: 'Tracking made easy', text: 'Logging a meal should take seconds, not a spreadsheet.' },
  {
    icon: 'shield-checkmark-outline',
    title: 'A source you can trust',
    text: 'Real nutrition data from the USDA. Anything the AI guesses is clearly labelled as an estimate.',
  },
  { icon: 'gift-outline', title: 'Free to use', text: 'No sign-up needed. Just open it and start tracking.' },
  { icon: 'lock-closed-outline', title: 'Private by default', text: 'Your meals stay on your phone.' },
];
const WAYS: { icon: Icon; title: string; text: string }[] = [
  { icon: 'search', title: 'Search foods', text: 'Look up real, published nutrition data from the USDA database.' },
  { icon: 'create-outline', title: 'Enter it yourself', text: 'Type in exactly what is on the label, per serving or per 100 g.' },
  {
    icon: 'sparkles',
    title: 'Estimate with AI',
    text: 'Describe a meal in a sentence and get an estimate. It is a smart guess, so check it and edit if you know better.',
  },
];

const PAGES = 5;
const GOALS_PAGE = 3;

/** A star that gently floats, used for the celebration on the last page. */
function FloatingStar({ left, top, size, delay }: { left: number; top: number; size: number; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const t = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, [v, delay]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }],
      }}
    >
      <Art name="star" size={size} />
    </Animated.View>
  );
}

/** First-launch tour: welcome, mission, how logging works, goals, and a "welcome in" finish. */
export function OnboardingScreen({ initialTargets, onDone }: Props) {
  const [page, setPage] = useState(0);
  const [texts, setTexts] = useState<Texts>(toTexts(initialTargets));
  const [chosen, setChosen] = useState<Targets>(initialTargets);
  const [error, setError] = useState<string | null>(null);
  const fade = useRef(new Animated.Value(0)).current;

  // Fade each page in as it appears.
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [page, fade]);

  function next() {
    if (page === GOALS_PAGE) {
      const parsed = parseTargets(texts);
      if ('error' in parsed) {
        setError(parsed.error);
        return;
      }
      setChosen(parsed.targets);
    }
    if (page === PAGES - 1) onDone(chosen);
    else setPage(page + 1);
  }

  const ctaLabel = page === 0 ? "Let's go" : page === PAGES - 1 ? 'Welcome in!' : page === GOALS_PAGE ? 'Save my goals' : 'Next';

  return (
    <SafeAreaView style={styles.safe}>
      <Decor items={KITCHEN_DECOR} opacity={0.35} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          <View style={styles.dots}>
            {Array.from({ length: PAGES }, (_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
            ))}
          </View>
          {page < GOALS_PAGE ? (
            <Pressable onPress={() => onDone(initialTargets)} hitSlop={12}>
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fade }}>
            {page === 0 ? (
              <View style={styles.center}>
                <View style={styles.animalRow}>
                  <WavingAnimal kind="Bear" size={96} delay={0} />
                  <WavingAnimal kind="Rabbit" size={96} delay={250} />
                  <WavingAnimal kind="Fox" size={96} delay={500} />
                </View>
                <Text style={styles.title}>Hi, welcome to FitnessChef!</Text>
                <Text style={styles.lead}>
                  We are so glad you are here. Let us show you around, it only takes a minute.
                </Text>
              </View>
            ) : null}

            {page === 1 ? (
              <View>
                <Text style={styles.titleLeft}>What we are about</Text>
                <Text style={styles.leadLeft}>
                  Our mission is to be a reliable, easy way to keep track of what you eat, for everyone.
                </Text>
                {MISSION.map((m) => (
                  <View key={m.title} style={[styles.card, shadow.card]}>
                    <View style={styles.iconWrap}>
                      <Ionicons name={m.icon} size={22} color={colors.primary} />
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>{m.title}</Text>
                      <Text style={styles.cardText}>{m.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {page === 2 ? (
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

            {page === GOALS_PAGE ? (
              <View>
                <Text style={styles.titleLeft}>Set your daily goals</Text>
                <Text style={styles.leadLeft}>
                  Tell us what you are aiming for each day. These are just starting numbers, and you can change them any time with the pencil icon on the Home screen.
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

            {page === PAGES - 1 ? (
              <View style={styles.center}>
                <View style={styles.cheer}>
                  <FloatingStar left={2} top={0} size={30} delay={0} />
                  <FloatingStar left={136} top={-6} size={24} delay={300} />
                  <FloatingStar left={262} top={4} size={32} delay={600} />
                  <View style={styles.animalRow}>
                    <WavingAnimal kind="Bear" size={96} speed={2.2} />
                    <WavingAnimal kind="Rabbit" size={96} speed={2.2} delay={150} />
                    <WavingAnimal kind="Fox" size={96} speed={2.2} delay={300} />
                  </View>
                </View>
                <Text style={styles.title}>You are all set!</Text>
                <Text style={styles.lead}>
                  Your goals are saved. Welcome in! Log your first meal to start your streak.
                </Text>
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          {page > 0 ? (
            <Pressable style={styles.back} onPress={() => setPage(page - 1)}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.back} />
          )}
          <Pressable style={styles.cta} onPress={next}>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
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
  animalRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  cheer: { alignItems: 'center', justifyContent: 'center', width: 296, height: 120 },
  title: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  lead: { fontSize: fonts.sizes.md, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md, lineHeight: 22 },
  titleLeft: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text, marginBottom: spacing.sm },
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
