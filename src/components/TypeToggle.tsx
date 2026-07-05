/**
 * TypeToggle - Pill-style segmented control for Expense/Income selection.
 * Features an animated sliding indicator using Reanimated.
 */
import React from 'react';
import { StyleSheet, Text, Pressable, View, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, FontFamily, FontSize, Radii, Spacing } from '@/theme/theme';
import type { EntryType } from '@/types/types';

interface TypeToggleProps {
  value: EntryType;
  onChange: (type: EntryType) => void;
}

export default function TypeToggle({ value, onChange }: TypeToggleProps) {
  const containerWidth = useSharedValue(0);
  const translateX = useSharedValue(0);

  const onContainerLayout = (event: LayoutChangeEvent) => {
    containerWidth.value = event.nativeEvent.layout.width;
    if (value === 'income') {
      translateX.value = event.nativeEvent.layout.width / 2;
    }
  };

  const handlePress = (type: EntryType) => {
    onChange(type);
    translateX.value = withTiming(
      type === 'expense' ? 0 : containerWidth.value / 2,
      { duration: 250, easing: Easing.bezier(0.4, 0, 0.2, 1) }
    );
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: containerWidth.value / 2,
  }));

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <Animated.View
        style={[
          styles.indicator,
          indicatorStyle,
          {
            backgroundColor:
              value === 'expense'
                ? Colors.expenseRedGlow
                : Colors.incomeGreenGlow,
          },
        ]}
      />

      <Pressable
        style={styles.option}
        onPress={() => handlePress('expense')}
      >
        <Text
          style={[
            styles.optionText,
            value === 'expense' && styles.optionTextActive,
            value === 'expense' && { color: Colors.expenseRed },
          ]}
        >
          Expense
        </Text>
      </Pressable>

      <Pressable
        style={styles.option}
        onPress={() => handlePress('income')}
      >
        <Text
          style={[
            styles.optionText,
            value === 'income' && styles.optionTextActive,
            value === 'income' && { color: Colors.incomeGreen },
          ]}
        >
          Income
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardSurface,
    borderRadius: Radii.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: Radii.md,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  optionText: {
    fontFamily: FontFamily.headingMedium,
    fontSize: FontSize.md,
    color: Colors.textTertiary,
  },
  optionTextActive: {
    fontFamily: FontFamily.headingSemiBold,
  },
});
