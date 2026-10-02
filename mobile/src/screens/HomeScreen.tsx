import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '../components/ProgressBar';
import { dateKey } from '../lib/dates';
import { currentStreak, levelInfo, totalXp } from '../lib/gamification';
import { sumMacros } from '../lib/macros';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';

export function HomeScreen() {
  const nav = useNavigation<any>();
  const { entries, targets } = useApp();

  const today = dateKey();
  const todays = entries.filter((e) => e.date === today);
  const totals = sumMacros(todays);
  const streak = currentStreak(entries, today);
  const xp = totalXp(entries);
  const { level, xpIntoLevel, xpForLevel } = levelInfo(xp);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>FitnessChef</Text>

        <View style={styles.badges}>
          <View style={[styles.badge, shadow.card]}>
            <Ionicons name="flame" size={26} color={colors.streak} />
            <Text style={styles.badgeValue}>{streak}</Text>
            <Text style={styles.badgeLabel}>day streak</Text>
          </View>
          <View style={[styles.badge, shadow.card]}>
            <Ionicons name="star" size={26} color={colors.xp} />
            <Text style={styles.badgeValue}>Lv {level}</Text>
            <Text style={styles.badgeLabel}>
              {xpIntoLevel} / {xpForLevel} XP
            </Text>
          </View>
        </View>

        <View style={[styles.card, shadow.card]}>
          <Text style={styles.cardTitle}>Today</Text>
          <ProgressBar large label="Calories" unit="kcal" color={colors.calories} value={totals.calories} target={targets.calories} />
          <ProgressBar label="Protein" color={colors.protein} value={totals.protein} target={targets.protein} />
          <ProgressBar label="Carbs" color={colors.carbs} value={totals.carbs} target={targets.carbs} />
          <ProgressBar label="Fat" color={colors.fat} value={totals.fat} target={targets.fat} />
          <Text style={styles.meta}>
            {todays.length} {todays.length === 1 ? 'meal' : 'meals'} logged today
          </Text>
        </View>

        <Pressable style={styles.cta} onPress={() => nav.navigate('Log')}>
          <Ionicons name="add-circle" size={22} color={colors.onPrimary} />
          <Text style={styles.ctaText}>Log a meal</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text, marginBottom: spacing.lg },
  badges: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  badge: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  badgeValue: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text },
  badgeLabel: { fontSize: fonts.sizes.xs, color: colors.textMuted },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  cardTitle: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold, color: colors.text, marginBottom: spacing.md },
  meta: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: spacing.xs },
  cta: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: colors.onPrimary, fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold },
});
