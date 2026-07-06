/**
 * Add/Edit Entry Screen - Form for creating or editing expense/income entries.
 * Supports type toggle, date picker, validation, and delete (edit mode).
 */
import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Trash2, Check } from 'lucide-react-native';
import { Colors, FontFamily, FontSize, Radii, Spacing, Shadows } from '@/theme/theme';
import { useExpenseStore } from '@/store/store';
import { getTodayISO } from '@/utils/utils';
import { getEntryById } from '@/db/database';
import TypeToggle from '@/components/TypeToggle';
import type { EntryType, Entry } from '@/types/types';

/**
 * Self-contained input wrapper that manages its own focus state.
 * This prevents parent re-renders on focus/blur which causes
 * infinite focus cycling on Android.
 */
interface FocusableInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  hasError?: boolean;
  prefix?: React.ReactNode;
}

const FocusableInput = memo(function FocusableInput({
  containerStyle,
  hasError,
  prefix,
  style: inputStyle,
  onFocus,
  onBlur,
  ...textInputProps
}: FocusableInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  return (
    <View
      style={[
        focusStyles.container,
        containerStyle,
        isFocused && focusStyles.focused,
        hasError && focusStyles.error,
      ]}
    >
      {prefix}
      <TextInput
        style={[focusStyles.input, inputStyle]}
        selectionColor={Colors.fabGradientStart}
        cursorColor={Colors.fabGradientStart}
        placeholderTextColor={Colors.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...textInputProps}
      />
    </View>
  );
});

const focusStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.inputBackground,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  focused: {
    borderColor: Colors.fabGradientStart,
  },
  error: {
    borderColor: Colors.expenseRed,
  },
  input: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.lg,
  },
});

export default function AddEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(params.id);

  const { addEntry, updateEntry, deleteEntry, selectedDate } = useExpenseStore();

  // Form state
  const [type, setType] = useState<EntryType>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(selectedDate || getTodayISO());
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);



  // Validation errors
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  // Load existing entry in edit mode
  useEffect(() => {
    if (params.id) {
      loadEntry(params.id);
    }
  }, [params.id]);

  const loadEntry = async (id: string) => {
    const entry = await getEntryById(id);
    if (entry) {
      setType(entry.type);
      setName(entry.name);
      setAmount(entry.amount.toString());
      setDate(entry.date);
      setComment(entry.comment ?? '');
      setStatus(entry.status);
    }
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; amount?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Enter a valid positive amount';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const numAmount = parseFloat(amount);

      if (isEdit && params.id) {
        await updateEntry({
          id: params.id,
          type,
          name: name.trim(),
          amount: numAmount,
          date,
          comment: comment.trim() || undefined,
          status,
        });
      } else {
        await addEntry({
          type,
          name: name.trim(),
          amount: numAmount,
          date,
          comment: comment.trim() || undefined,
          status,
        });
      }

      router.back();
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!params.id) return;

    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteEntry(params.id!);
              router.back();
            } catch (error) {
              console.error('Failed to delete entry:', error);
              Alert.alert('Error', 'Failed to delete entry.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const statusLabel = type === 'expense' ? 'Paid' : 'Received';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <ArrowLeft size={22} color={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {isEdit ? 'Edit Entry' : 'New Entry'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type Toggle */}
          <Animated.View entering={FadeInDown.delay(50).duration(400)}>
            <TypeToggle value={type} onChange={setType} />
          </Animated.View>

          {/* Date Field */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.fieldGroup}
          >
            <Text style={styles.label}>Date</Text>
            <FocusableInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              keyboardType="default"
            />
          </Animated.View>

          {/* Name Field */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(400)}
            style={styles.fieldGroup}
          >
            <Text style={styles.label}>Name</Text>
            <FocusableInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder={
                type === 'expense' ? 'e.g. Groceries' : 'e.g. Salary'
              }
              maxLength={100}
              hasError={Boolean(errors.name)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </Animated.View>

          {/* Amount Field */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.fieldGroup}
          >
            <Text style={styles.label}>Amount</Text>
            <FocusableInput
              containerStyle={styles.amountContainer}
              prefix={<Text style={styles.currencySymbol}>₹</Text>}
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                setAmount(cleaned);
                if (errors.amount)
                  setErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              placeholder="0"
              keyboardType="decimal-pad"
              hasError={Boolean(errors.amount)}
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
            )}
          </Animated.View>

          {/* Comment Field */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(400)}
            style={styles.fieldGroup}
          >
            <Text style={styles.label}>Comment (optional)</Text>
            <FocusableInput
              containerStyle={styles.commentContainer}
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Add a note..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
          </Animated.View>

          {/* Status Checkbox */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.fieldGroup}
          >
            <Pressable
              onPress={() => setStatus(!status)}
              style={styles.checkboxRow}
            >
              <View
                style={[
                  styles.checkbox,
                  status && styles.checkboxChecked,
                  status && {
                    backgroundColor:
                      type === 'expense'
                        ? Colors.expenseRed
                        : Colors.incomeGreen,
                    borderColor:
                      type === 'expense'
                        ? Colors.expenseRed
                        : Colors.incomeGreen,
                  },
                ]}
              >
                {status && <Check size={14} color={Colors.textPrimary} strokeWidth={3} />}
              </View>
              <Text style={styles.checkboxLabel}>{statusLabel}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.lg }]}>
          {isEdit && (
            <Pressable
              onPress={handleDelete}
              disabled={isDeleting}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
              ]}
            >
              <Trash2 size={20} color={Colors.danger} />
            </Pressable>
          )}
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.saveButton,
              { flex: isEdit ? 1 : undefined, width: isEdit ? undefined : '100%' },
              pressed && styles.saveButtonPressed,
              isSaving && styles.saveButtonDisabled,
            ]}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : isEdit ? 'Update' : 'Save Entry'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  fieldGroup: {
    marginTop: Spacing.xl,
  },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize['2xl'],
    color: Colors.textTertiary,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontFamily: FontFamily.mono,
    fontSize: FontSize['2xl'],
    letterSpacing: 0.5,
  },
  commentContainer: {
    minHeight: 100,
  },
  commentInput: {
    minHeight: 80,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.expenseRed,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radii.sm,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkboxChecked: {
    borderWidth: 0,
  },
  checkboxLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  deleteButton: {
    width: 52,
    height: 52,
    borderRadius: Radii.lg,
    backgroundColor: Colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonPressed: {
    opacity: 0.7,
  },
  saveButton: {
    height: 52,
    borderRadius: Radii.lg,
    backgroundColor: Colors.fabGradientStart,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  saveButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
});
