/**
 * SectionHeader - Section label with accent line and count badge.
 * Used for "Expenses" and "Income" section dividers.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, Radii, Spacing } from '@/theme/theme';

interface SectionHeaderProps {
  title: string;
  count: number;
  accentColor: string;
}

export default function SectionHeader({ title, count, accentColor }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
      <Text style={styles.title}>{title}</Text>
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: accentColor + '20' }]}>
          <Text style={[styles.badgeText, { color: accentColor }]}>{count}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  accentLine: {
    width: 3,
    height: 18,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.full,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
  },
});
