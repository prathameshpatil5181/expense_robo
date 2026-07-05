/**
 * Add/Edit Entry Screen - Form for creating or editing expense/income entries.
 * Supports type toggle, date picker, validation, and delete (edit mode).
 */
import React, { useState, useEffect } from 'react';
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

  // Focus state for input styling
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
            <View style={[
              styles.inputContainer,
              focusedField === 'date' && styles.inputFocused,
            ]}>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
                keyboardType="default"
                selectionColor={Colors.fabGradientStart}
                cursorColor={Colors.fabGradientStart}
                onFocus={() => setFocusedField('date')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </Animated.View>

          {/* Name Field */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(400)}
            style={styles.fieldGroup}
          >
            <Text style={styles.label}>Name</Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'name' && styles.inputFocused,
                errors.name ? styles.inputError : null,
              ]}
            >
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder={
                  type === 'expense' ? 'e.g. Groceries' : 'e.g. Salary'
                }
                placeholderTextColor={Colors.textMuted}
                maxLength={100}
                selectionColor={Colors.fabGradientStart}
                cursorColor={Colors.fabGradientStart}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </Animated.View>

          {/* Amount Field */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.fieldGroup}
          >
            <Text style={styles.label}>Amount</Text>
            <View
              style={[
                styles.inputContainer,
                styles.amountContainer,
                focusedField === 'amount' && styles.inputFocused,
                errors.amount ? styles.inputError : null,
              ]}
            >
              <Text style={[styles.currencySymbol, focusedField === 'amount' && { color: Colors.fabGradientStart }]}>₹</Text>
              <TextInput
                style={[styles.input, styles.amountInput]}
                value={amount}
                onChangeText={(text) => {
                  // Only allow numbers and decimal point
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  setAmount(cleaned);
                  if (errors.amount)
                    setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                selectionColor={Colors.fabGradientStart}
                cursorColor={Colors.fabGradientStart}
                onFocus={() => setFocusedField('amount')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
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
            <View style={[
              styles.inputContainer,
              styles.commentContainer,
              focusedField === 'comment' && styles.inputFocused,
            ]}>
              <TextInput
                style={[styles.input, styles.commentInput]}
                value={comment}
                onChangeText={setComment}
                placeholder="Add a note..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
                selectionColor={Colors.fabGradientStart}
                cursorColor={Colors.fabGradientStart}
                onFocus={() => setFocusedField('comment')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
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
  inputContainer: {
    backgroundColor: Colors.inputBackground,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  inputFocused: {
    borderColor: Colors.fabGradientStart,
    borderWidth: 1.5,
    shadowColor: Colors.fabGradientStart,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  inputError: {
    borderColor: Colors.expenseRed,
  },
  input: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.lg,
    outlineStyle: 'none' as any,
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
