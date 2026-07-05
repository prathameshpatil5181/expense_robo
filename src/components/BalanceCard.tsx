/**
 * BalanceCard - Hero card showing income/expense summary and net balance.
 * Uses gradient-like layered backgrounds for a premium CRED aesthetic.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors, FontFamily, FontSize, Radii, Spacing, Shadows } from '@/theme/theme';
import { formatCurrency } from '@/utils/utils';
import type { Entry } from '@/types/types';

interface BalanceCardProps {
  entries: Entry[];
}

export default function BalanceCard({ entries }: BalanceCardProps) {
  const totalIncome = entries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
      {/* Gradient border effect using nested views */}
      <View style={styles.gradientBorder}>
        <View style={styles.card}>
          <Text style={styles.label}>Net Balance</Text>
          <Text
            style={[
              styles.balance,
              { color: netBalance >= 0 ? Colors.incomeGreen : Colors.expenseRed },
            ]}
          >
            {formatCurrency(netBalance)}
          </Text>

          <View style={styles.divider} />

          <View style={styles.breakdown}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownDot}>
                <View style={[styles.dot, { backgroundColor: Colors.incomeGreen }]} />
              </View>
              <View>
                <Text style={styles.breakdownLabel}>Income</Text>
                <Text style={[styles.breakdownAmount, { color: Colors.incomeGreen }]}>
                  {formatCurrency(totalIncome)}
                </Text>
              </View>
            </View>

            <View style={styles.breakdownSpacer} />

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownDot}>
                <View style={[styles.dot, { backgroundColor: Colors.expenseRed }]} />
              </View>
              <View>
                <Text style={styles.breakdownLabel}>Expense</Text>
                <Text style={[styles.breakdownAmount, { color: Colors.expenseRed }]}>
                  {formatCurrency(totalExpense)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  gradientBorder: {
    borderRadius: Radii.xl + 1,
    padding: 1,
    backgroundColor: Colors.borderLight,
    ...Shadows.card,
  },
  card: {
    backgroundColor: Colors.cardSurface,
    borderRadius: Radii.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  balance: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize['4xl'],
    letterSpacing: 0.5,
  },
  divider: {
    width: '60%',
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xl,
  },
  breakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  breakdownItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownSpacer: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },
  breakdownDot: {
    marginRight: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  breakdownAmount: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.lg,
    letterSpacing: 0.3,
  },
});
