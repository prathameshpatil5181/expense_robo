/**
 * Zustand store for expense tracker state management.
 * Manages entries, selected date, loading state, and all CRUD actions.
 */
import { create } from 'zustand';
import type { Entry, EntryType } from '@/types/types';
import * as db from '@/db/database';
import { generateId, getNowISO, getTodayISO } from '@/utils/utils';

interface ExpenseStore {
  entries: Entry[];
  selectedDate: string;
  isShowingAll: boolean;
  isLoading: boolean;

  // Actions
  loadEntries: (date?: string) => Promise<void>;
  loadAllEntries: () => Promise<void>;
  clearDateFilter: () => void;
  addEntry: (data: {
    type: EntryType;
    name: string;
    amount: number;
    date: string;
    comment?: string;
    status: boolean;
  }) => Promise<void>;
  updateEntry: (data: {
    id: string;
    type: EntryType;
    name: string;
    amount: number;
    date: string;
    comment?: string;
    status: boolean;
  }) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  setShowingAll: (showAll: boolean) => void;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  entries: [],
  selectedDate: getTodayISO(),
  isShowingAll: false,
  isLoading: false,

  loadEntries: async (date?: string) => {
    const targetDate = date ?? get().selectedDate;
    set({ isLoading: true, isShowingAll: false });
    try {
      const entries = await db.getEntriesByDate(targetDate);
      set({ entries, isLoading: false });
    } catch (error) {
      console.error('Failed to load entries:', error);
      set({ isLoading: false });
    }
  },

  loadAllEntries: async () => {
    set({ isLoading: true, isShowingAll: true });
    try {
      const entries = await db.getAllEntries();
      set({ entries, isLoading: false });
    } catch (error) {
      console.error('Failed to load all entries:', error);
      set({ isLoading: false });
    }
  },

  clearDateFilter: () => {
    set({ isShowingAll: true });
    get().loadAllEntries();
  },

  addEntry: async (data) => {
    const now = getNowISO();
    const entry: Entry = {
      id: generateId(),
      type: data.type,
      name: data.name,
      amount: data.amount,
      date: data.date,
      comment: data.comment,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.addEntry(entry);
      // Reload entries based on current view mode
      if (get().isShowingAll) {
        await get().loadAllEntries();
      } else if (entry.date === get().selectedDate) {
        await get().loadEntries();
      }
    } catch (error) {
      console.error('Failed to add entry:', error);
      throw error;
    }
  },

  updateEntry: async (data) => {
    const now = getNowISO();
    const existingEntry = get().entries.find((e) => e.id === data.id);
    if (!existingEntry) {
      // Fetch from DB if not in current list
      const dbEntry = await db.getEntryById(data.id);
      if (!dbEntry) throw new Error('Entry not found');
    }

    const entry: Entry = {
      id: data.id,
      type: data.type,
      name: data.name,
      amount: data.amount,
      date: data.date,
      comment: data.comment,
      status: data.status,
      createdAt: existingEntry?.createdAt ?? getNowISO(),
      updatedAt: now,
    };

    try {
      await db.updateEntry(entry);
      if (get().isShowingAll) {
        await get().loadAllEntries();
      } else {
        await get().loadEntries();
      }
    } catch (error) {
      console.error('Failed to update entry:', error);
      throw error;
    }
  },

  deleteEntry: async (id: string) => {
    try {
      await db.deleteEntry(id);
      if (get().isShowingAll) {
        await get().loadAllEntries();
      } else {
        await get().loadEntries();
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
      throw error;
    }
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date, isShowingAll: false });
  },

  setShowingAll: (showAll: boolean) => {
    set({ isShowingAll: showAll });
  },
}));
