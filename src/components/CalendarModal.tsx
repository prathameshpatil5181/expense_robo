/**
 * CalendarModal - Modal wrapper around react-native-calendars Calendar.
 * Dark-themed, slides up from bottom with backdrop fade.
 */
import React from 'react';
import {
  StyleSheet,
  Modal,
  Pressable,
  View,
  Text,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Calendar, type DateData } from 'react-native-calendars';
import { X } from 'lucide-react-native';
import { Colors, FontFamily, FontSize, Radii, Spacing } from '@/theme/theme';

interface CalendarModalProps {
  visible: boolean;
  selectedDate: string;
  onDayPress: (date: string) => void;
  onClose: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CalendarModal({
  visible,
  selectedDate,
  onDayPress,
  onClose,
}: CalendarModalProps) {
  const handleDayPress = (day: DateData) => {
    onDayPress(day.dateString);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <AnimatedPressable
          entering={FadeIn.duration(200)}
          style={styles.backdrop}
          onPress={onClose}
        />
        <Animated.View
          entering={SlideInDown.duration(400).springify().damping(18)}
          style={styles.content}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Select Date</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: Colors.fabGradientStart,
                selectedTextColor: Colors.textPrimary,
              },
            }}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: Colors.textTertiary,
              selectedDayBackgroundColor: Colors.fabGradientStart,
              selectedDayTextColor: Colors.textPrimary,
              todayTextColor: Colors.fabGradientStart,
              dayTextColor: Colors.textPrimary,
              textDisabledColor: Colors.textMuted,
              monthTextColor: Colors.textPrimary,
              arrowColor: Colors.textSecondary,
              textDayFontFamily: FontFamily.body,
              textMonthFontFamily: FontFamily.headingSemiBold,
              textDayHeaderFontFamily: FontFamily.bodyMedium,
              textDayFontSize: FontSize.md,
              textMonthFontSize: FontSize.lg,
              textDayHeaderFontSize: FontSize.sm,
            }}
            style={styles.calendar}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
  },
  content: {
    backgroundColor: Colors.cardSurface,
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    paddingBottom: Spacing['4xl'],
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendar: {
    marginHorizontal: Spacing.md,
  },
});
