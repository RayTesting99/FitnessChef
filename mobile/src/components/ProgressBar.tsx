import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color: string;
  large?: boolean;
  /** Optional artwork shown before the label (e.g. a cartoon animal). */
  icon?: React.ReactNode;
}

export function ProgressBar({ label, value, target, unit = 'g', color, large, icon }: Props) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const over = value > target;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.labelRow}>
          {icon}
          <Text style={[styles.label, large && styles.labelLarge]}>{label}</Text>
        </View>
        <Text style={[styles.value, large && styles.valueLarge]}>
          {Math.round(value)}
          <Text style={styles.target}>
            {' '}
            / {Math.round(target)}
            {unit ? ` ${unit}` : ''}
          </Text>
        </Text>
      </View>
      <View style={[styles.track, large && styles.trackLarge]}>
        <View
          style={[
            styles.fill,
            { width: `${pct * 100}%`, backgroundColor: over ? colors.danger : color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.xs },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontSize: fonts.sizes.sm, color: colors.textMuted, fontWeight: fonts.weights.medium },
  labelLarge: { fontSize: fonts.sizes.md, color: colors.text },
  value: { fontSize: fonts.sizes.md, color: colors.text, fontWeight: fonts.weights.bold },
  valueLarge: { fontSize: fonts.sizes.xl },
  target: { fontSize: fonts.sizes.sm, color: colors.textMuted, fontWeight: fonts.weights.regular },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' },
  trackLarge: { height: 12 },
  fill: { height: '100%', borderRadius: radius.pill },
});
