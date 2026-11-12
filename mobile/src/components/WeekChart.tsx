import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { addDays, dateKey, weekdayLetter } from '../lib/dates';
import { colors, fonts, radius, spacing } from '../theme';
import { Entry } from '../types';
import { sumMacros } from '../lib/macros';

const CHART_H = 96;

interface Props {
  entries: Entry[];
  calorieTarget: number;
}

/** Bars of calories for the last 7 days (today on the right), with a dashed line at the daily target. */
export function WeekChart({ entries, calorieTarget }: Props) {
  const days = useMemo(() => {
    const today = dateKey();
    return Array.from({ length: 7 }, (_, i) => {
      const key = addDays(today, i - 6);
      const kcal = sumMacros(entries.filter((e) => e.date === key)).calories;
      return { key, kcal, isToday: key === today };
    });
  }, [entries]);

  const max = Math.max(calorieTarget, ...days.map((d) => d.kcal)) * 1.1 || 1;
  const grow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    grow.setValue(0);
    Animated.timing(grow, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [grow, entries.length]);

  const logged = days.filter((d) => d.kcal > 0);
  const avg = logged.length ? Math.round(logged.reduce((a, d) => a + d.kcal, 0) / logged.length) : 0;

  return (
    <View>
      <Text style={styles.caption}>
        {logged.length ? `Last 7 days · avg ${avg} kcal on days you logged` : 'Last 7 days'}
      </Text>
      <View style={styles.chart}>
        <View style={[styles.targetLine, { bottom: (calorieTarget / max) * CHART_H }]} />
        {days.map((d) => (
          <View key={d.key} style={styles.col}>
            <Animated.View
              style={[
                styles.bar,
                d.isToday && styles.barToday,
                { height: grow.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max((d.kcal / max) * CHART_H, d.kcal > 0 ? 4 : 0)] }) },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {days.map((d) => (
          <Text key={d.key} style={[styles.label, d.isToday && styles.labelToday]}>
            {weekdayLetter(d.key)}
          </Text>
        ))}
      </View>
      <Text style={styles.legend}>Dashed line = your {calorieTarget} kcal target</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginBottom: spacing.sm },
  chart: { height: CHART_H, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  col: { flex: 1, height: CHART_H, justifyContent: 'flex-end' },
  bar: { backgroundColor: colors.primary, opacity: 0.55, borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm },
  barToday: { opacity: 1 },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
  },
  labels: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  label: { flex: 1, textAlign: 'center', fontSize: fonts.sizes.xs, color: colors.textMuted },
  labelToday: { color: colors.primary, fontWeight: fonts.weights.bold },
  legend: { fontSize: fonts.sizes.xs, color: colors.textMuted, marginTop: spacing.xs },
});
