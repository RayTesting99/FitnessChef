import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dateKey, formatDayHeading } from '../lib/dates';
import { entryMacros, sumMacros } from '../lib/macros';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { Entry } from '../types';

export function HistoryScreen() {
  const { entries, deleteEntry } = useApp();

  // Today gets its own section (always shown once anything has been logged); other days follow under "Earlier".
  const { sections, hasEarlier } = useMemo(() => {
    const today = dateKey();
    const byDay = new Map<string, Entry[]>();
    for (const e of entries) {
      const list = byDay.get(e.date) ?? [];
      list.push(e);
      byDay.set(e.date, list);
    }
    const build = (date: string, data: Entry[]) => ({
      date,
      isToday: date === today,
      data: [...data].sort((a, b) => b.loggedAt - a.loggedAt),
      total: sumMacros(data),
    });
    const earlier = [...byDay.entries()]
      .filter(([date]) => date !== today)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([date, data]) => build(date, data));
    const todaySection = build(today, byDay.get(today) ?? []);
    return {
      sections: entries.length === 0 ? [] : [todaySection, ...earlier],
      hasEarlier: earlier.length > 0,
    };
  }, [entries]);

  function confirmDelete(e: Entry) {
    Alert.alert('Delete entry?', `${e.name} (${Math.round(e.grams)} g)`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(e.id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={styles.title}>History</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No meals logged yet. Head to the Log tab to add your first one.</Text>}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, section.isToday && styles.todayHeader]}>
            <Text style={[styles.sectionTitle, section.isToday && styles.todayTitle]}>
              {formatDayHeading(section.date)}
            </Text>
            <Text style={styles.sectionTotal}>
              {Math.round(section.total.calories)} kcal · P {Math.round(section.total.protein)} · C{' '}
              {Math.round(section.total.carbs)} · F {Math.round(section.total.fat)}
            </Text>
          </View>
        )}
        renderSectionFooter={({ section }) =>
          section.isToday ? (
            <View>
              {section.data.length === 0 ? <Text style={styles.todayEmpty}>Nothing logged today yet.</Text> : null}
              {hasEarlier ? (
                <View style={styles.earlierDivider}>
                  <View style={styles.earlierLine} />
                  <Text style={styles.earlierLabel}>EARLIER</Text>
                  <View style={styles.earlierLine} />
                </View>
              ) : null}
            </View>
          ) : null
        }
        renderItem={({ item, section }) => {
          const m = entryMacros(item);
          return (
            <View style={[styles.row, shadow.card, section.isToday && styles.todayRow]}>
              <View style={styles.rowMain}>
                <Text style={styles.rowName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.rowSub}>
                  {Math.round(item.grams)} g · {Math.round(m.calories)} kcal · P {m.protein.toFixed(0)} · C{' '}
                  {m.carbs.toFixed(0)} · F {m.fat.toFixed(0)}
                </Text>
              </View>
              <Pressable hitSlop={10} onPress={() => confirmDelete(item)}>
                <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.text, marginBottom: spacing.md },
  empty: { color: colors.textMuted, fontSize: fonts.sizes.md, marginTop: spacing.lg },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  todayHeader: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
  },
  todayTitle: { color: colors.primary },
  todayRow: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  todayEmpty: { color: colors.textMuted, fontSize: fonts.sizes.sm, marginBottom: spacing.sm },
  earlierDivider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  earlierLine: { flex: 1, height: 1, backgroundColor: colors.border },
  earlierLabel: { fontSize: fonts.sizes.xs, color: colors.textMuted, fontWeight: fonts.weights.bold, letterSpacing: 1 },
  sectionTitle: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold, color: colors.text },
  sectionTotal: { fontSize: fonts.sizes.sm, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowMain: { flex: 1 },
  rowName: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.medium, color: colors.text },
  rowSub: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: 2 },
});
