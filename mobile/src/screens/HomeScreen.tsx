import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art } from '../art/Art';
import { Decor } from '../art/Decor';
import { GYM_DECOR } from '../art/decor';
import { ProgressBar } from '../components/ProgressBar';
import { TargetsModal } from '../components/TargetsModal';
import { dateKey } from '../lib/dates';
import { currentStreak, levelInfo, totalXp } from '../lib/gamification';
import { sumMacros } from '../lib/macros';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';

export function HomeScreen() {
  const nav = useNavigation<any>();
  const { entries, targets, setTargets, openTour } = useApp();
  const [editing, setEditing] = useState(false);

  const today = dateKey();
  const todays = entries.filter((e) => e.date === today);
  const totals = sumMacros(todays);
  const streak = currentStreak(entries, today);
  const xp = totalXp(entries);
  const { level, xpIntoLevel, xpForLevel } = levelInfo(xp);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Decor items={GYM_DECOR} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>FitnessChef</Text>
          <Pressable onPress={openTour} hitSlop={12} accessibilityLabel="How FitnessChef works">
            <Ionicons name="help-circle-outline" size={26} color={colors.textMuted} />
          </Pressable>
        </View>

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

        {entries.length === 0 ? (
          <View style={[styles.emptyCard, shadow.card]}>
            <Art name="bear" size={64} />
            <View style={styles.emptyText}>
              <Text style={styles.emptyTitle}>Nothing logged yet</Text>
              <Text style={styles.emptySub}>Log your first meal to start your streak and fill these bars.</Text>
            </View>
          </View>
        ) : null}

        <Pressable
          style={[styles.card, shadow.card]}
          onPress={() => nav.navigate('History')}
          accessibilityRole="button"
          accessibilityLabel="View today's logged meals"
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today</Text>
            <Pressable onPress={() => setEditing(true)} hitSlop={12} accessibilityLabel="Edit daily targets">
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </Pressable>
          </View>
          <ProgressBar large icon={<Ionicons name="flame" size={26} color={colors.calories} />} label="Calories" unit="kcal" color={colors.calories} value={totals.calories} target={targets.calories} />
          <ProgressBar icon={<Art name="bear" size={44} />} label="Protein" color={colors.protein} value={totals.protein} target={targets.protein} />
          <ProgressBar icon={<Art name="rabbit" size={44} />} label="Carbs" color={colors.carbs} value={totals.carbs} target={targets.carbs} />
          <ProgressBar icon={<Art name="fox" size={44} />} label="Fat" color={colors.fat} value={totals.fat} target={targets.fat} />
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {todays.length} {todays.length === 1 ? 'meal' : 'meals'} logged today
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Pressable>

        <Pressable style={styles.cta} onPress={() => nav.navigate('Log')}>
          <Ionicons name="add-circle" size={22} color={colors.onPrimary} />
          <Text style={styles.ctaText}>Log a meal</Text>
        </Pressable>
      </ScrollView>
      <TargetsModal
        visible={editing}
        targets={targets}
        onSave={(t) => {
          setTargets(t);
          setEditing(false);
        }}
        onClose={() => setEditing(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyText: { flex: 1 },
  emptyTitle: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold, color: colors.text },
  emptySub: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: 2 },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardTitle: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold, color: colors.text },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  meta: { fontSize: fonts.sizes.sm, color: colors.textMuted },
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
