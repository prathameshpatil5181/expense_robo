/**
 * EntryCard - A single expense/income list item.
 * Features color-coded amounts, status badges, and tap-to-edit.
 */
import { Colors, FontFamily, FontSize, Radii, Spacing } from '@/theme/theme';
import type { Entry } from '@/types/types';
import { formatCurrency } from '@/utils/utils';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface EntryCardProps {
  entry: Entry;
  index: number;
  onPress: (entry: Entry) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function EntryCard({ entry, index, onPress }: EntryCardProps) {
  const isExpense = entry.type === 'expense';
  const amountColor = isExpense ? Colors.expenseRed : Colors.incomeGreen;
  const accentColor = isExpense ? Colors.expenseRedGlow : Colors.incomeGreenGlow;
  const bgTint = isExpense ? Colors.expenseRedSoft : Colors.incomeGreenSoft;
  const statusLabel = isExpense
    ? entry.status ? 'Paid' : 'Pending'
    : entry.status ? 'Received' : 'Pending';
  const statusIsPending = !entry.status;

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 80).duration(400).springify()}
      onPress={() => onPress(entry)}
      style={({ pressed }: { pressed: boolean }) => [
        styles.card,
        { backgroundColor: bgTint },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.name}
          </Text>
          {entry.comment ? (
            <Text style={styles.comment} numberOfLines={1}>
              {entry.comment}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightContent}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isExpense ? '- ' : '+ '}
            {formatCurrency(entry.amount)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusIsPending
                  ? Colors.statusPendingBg
                  : Colors.statusPaidBg,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: statusIsPending
                    ? Colors.statusPendingText
                    : Colors.statusPaidText,
                },
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardSurface,
    borderRadius: Radii.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderFocus,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  name: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  comment: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.lg,
    letterSpacing: 0.5,
  },
  statusBadge: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  statusText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
  },
});
