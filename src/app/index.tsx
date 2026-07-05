/**
 * Home Screen - Main view showing balance card with tabbed expense/income list.
 * Features calendar filter with "All" option, FAB, and tap-to-edit entries.
 */
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { CalendarDays, X } from 'lucide-react-native';
import { Colors, FontFamily, FontSize, Radii, Spacing } from '@/theme/theme';
import { useExpenseStore } from '@/store/store';
import { formatDate, formatDateLong } from '@/utils/utils';
import BalanceCard from '@/components/BalanceCard';
import EntryCard from '@/components/EntryCard';
import EmptyState from '@/components/EmptyState';
import FAB from '@/components/FAB';
import CalendarModal from '@/components/CalendarModal';
import type { Entry, EntryType } from '@/types/types';

type TabType = 'expense' | 'income';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('expense');

  const {
    entries,
    selectedDate,
    isShowingAll,
    isLoading,
    loadEntries,
    loadAllEntries,
    clearDateFilter,
    setSelectedDate,
  } = useExpenseStore();

  const filteredEntries = entries.filter((e) => e.type === activeTab);
  const expenses = entries.filter((e) => e.type === 'expense');
  const incomes = entries.filter((e) => e.type === 'income');

  // Tab indicator animation
  const tabContainerWidth = useSharedValue(0);
  const tabTranslateX = useSharedValue(0);

  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabTranslateX.value }],
    width: tabContainerWidth.value / 2,
  }));

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    tabTranslateX.value = withTiming(
      tab === 'expense' ? 0 : tabContainerWidth.value / 2,
      { duration: 250, easing: Easing.bezier(0.4, 0, 0.2, 1) }
    );
  };

  // Load entries when screen focuses
  useFocusEffect(
    useCallback(() => {
      if (isShowingAll) {
        loadAllEntries();
      } else {
        loadEntries();
      }
    }, [selectedDate, isShowingAll])
  );

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    loadEntries(date);
  };

  const handleClearFilter = () => {
    clearDateFilter();
  };

  const handleEntryPress = (entry: Entry) => {
    router.push({ pathname: '/add-entry', params: { id: entry.id } });
  };

  const handleAddPress = () => {
    router.push('/add-entry');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (isShowingAll) {
      await loadAllEntries();
    } else {
      await loadEntries();
    }
    setRefreshing(false);
  };

  const dateLabel = isShowingAll ? 'All Transactions' : formatDate(selectedDate);
  const dateLong = isShowingAll ? 'Showing all dates' : formatDateLong(selectedDate);

  const emptyMessage =
    activeTab === 'expense' ? 'No expenses yet' : 'No income yet';
  const emptySubMessage = isShowingAll
    ? 'Tap + to add your first entry'
    : 'Tap + to add or view all dates';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.dateLong}>{dateLong}</Text>
        </View>
        <View style={styles.headerButtons}>
          {/* Show "clear filter" when filtering by date */}
          {!isShowingAll && (
            <Pressable
              onPress={handleClearFilter}
              style={({ pressed }: { pressed: boolean }) => [
                styles.headerIconButton,
                styles.clearFilterButton,
                pressed && styles.headerIconButtonPressed,
              ]}
            >
              <X size={18} color={Colors.textSecondary} />
              <Text style={styles.clearFilterText}>All</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setCalendarVisible(true)}
            style={({ pressed }: { pressed: boolean }) => [
              styles.headerIconButton,
              pressed && styles.headerIconButtonPressed,
            ]}
          >
            <CalendarDays size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {isLoading && entries.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.fabGradientStart} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.fabGradientStart}
              colors={[Colors.fabGradientStart]}
            />
          }
        >
          {/* Balance Card */}
          <BalanceCard entries={entries} />

          {/* Expense / Income Tabs */}
          <View
            style={styles.tabContainer}
            onLayout={(e) => {
              tabContainerWidth.value = e.nativeEvent.layout.width;
            }}
          >
            <Animated.View
              style={[
                styles.tabIndicator,
                tabIndicatorStyle,
                {
                  backgroundColor:
                    activeTab === 'expense'
                      ? Colors.expenseRedGlow
                      : Colors.incomeGreenGlow,
                },
              ]}
            />
            <Pressable
              style={styles.tabOption}
              onPress={() => handleTabPress('expense')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'expense' && styles.tabTextActive,
                  activeTab === 'expense' && { color: Colors.expenseRed },
                ]}
              >
                Expenses
              </Text>
              {expenses.length > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    {
                      backgroundColor:
                        activeTab === 'expense'
                          ? Colors.expenseRed + '30'
                          : Colors.white08,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      {
                        color:
                          activeTab === 'expense'
                            ? Colors.expenseRed
                            : Colors.textTertiary,
                      },
                    ]}
                  >
                    {expenses.length}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable
              style={styles.tabOption}
              onPress={() => handleTabPress('income')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'income' && styles.tabTextActive,
                  activeTab === 'income' && { color: Colors.incomeGreen },
                ]}
              >
                Income
              </Text>
              {incomes.length > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    {
                      backgroundColor:
                        activeTab === 'income'
                          ? Colors.incomeGreen + '30'
                          : Colors.white08,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      {
                        color:
                          activeTab === 'income'
                            ? Colors.incomeGreen
                            : Colors.textTertiary,
                      },
                    ]}
                  >
                    {incomes.length}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Filtered Entry List */}
          <View style={styles.entryList}>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry, index) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  index={index}
                  onPress={handleEntryPress}
                />
              ))
            ) : (
              <EmptyState
                message={emptyMessage}
                subMessage={emptySubMessage}
              />
            )}
          </View>
        </ScrollView>
      )}

      {/* FAB */}
      <FAB onPress={handleAddPress} />

      {/* Calendar Modal */}
      <CalendarModal
        visible={calendarVisible}
        selectedDate={selectedDate}
        onDayPress={handleDateSelect}
        onClose={() => setCalendarVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  dateLabel: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  dateLong: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFilterButton: {
    flexDirection: 'row',
    width: 'auto',
    paddingHorizontal: Spacing.md,
    gap: 4,
    borderRadius: Radii.full,
  },
  clearFilterText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  headerIconButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardSurface,
    borderRadius: Radii.lg,
    padding: 4,
    borderWidth: 0.5,
    borderColor: Colors.border,
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: Radii.md,
  },
  tabOption: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    gap: Spacing.sm,
  },
  tabText: {
    fontFamily: FontFamily.headingMedium,
    fontSize: FontSize.md,
    color: Colors.textTertiary,
  },
  tabTextActive: {
    fontFamily: FontFamily.headingSemiBold,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.full,
    minWidth: 22,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
  },
  entryList: {
    marginTop: Spacing.xs,
  },
});
