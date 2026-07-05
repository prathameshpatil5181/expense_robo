/**
 * SQLite data-access layer for expense/income entries.
 * Uses expo-sqlite async API with WAL mode.
 */
import * as SQLite from 'expo-sqlite';
import type { Entry } from '@/types/types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('expense-tracker.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      comment TEXT,
      status INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
    CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
  `);

  return db;
}

export async function addEntry(entry: Entry): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO entries (id, type, name, amount, date, comment, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.type,
      entry.name,
      entry.amount,
      entry.date,
      entry.comment ?? null,
      entry.status ? 1 : 0,
      entry.createdAt,
      entry.updatedAt,
    ]
  );
}

export async function updateEntry(entry: Entry): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE entries
     SET type = ?, name = ?, amount = ?, date = ?, comment = ?, status = ?, updatedAt = ?
     WHERE id = ?`,
    [
      entry.type,
      entry.name,
      entry.amount,
      entry.date,
      entry.comment ?? null,
      entry.status ? 1 : 0,
      entry.updatedAt,
      entry.id,
    ]
  );
}

export async function deleteEntry(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM entries WHERE id = ?', [id]);
}

export async function getEntriesByDate(date: string): Promise<Entry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    type: string;
    name: string;
    amount: number;
    date: string;
    comment: string | null;
    status: number;
    createdAt: string;
    updatedAt: string;
  }>('SELECT * FROM entries WHERE date = ? ORDER BY createdAt DESC', [date]);

  return rows.map(mapRowToEntry);
}

export async function getEntriesInRange(
  startDate: string,
  endDate: string
): Promise<Entry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    type: string;
    name: string;
    amount: number;
    date: string;
    comment: string | null;
    status: number;
    createdAt: string;
    updatedAt: string;
  }>(
    'SELECT * FROM entries WHERE date BETWEEN ? AND ? ORDER BY date DESC, createdAt DESC',
    [startDate, endDate]
  );

  return rows.map(mapRowToEntry);
}

export async function getAllEntries(): Promise<Entry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    type: string;
    name: string;
    amount: number;
    date: string;
    comment: string | null;
    status: number;
    createdAt: string;
    updatedAt: string;
  }>('SELECT * FROM entries ORDER BY date DESC, createdAt DESC');

  return rows.map(mapRowToEntry);
}

export async function getEntryById(id: string): Promise<Entry | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    id: string;
    type: string;
    name: string;
    amount: number;
    date: string;
    comment: string | null;
    status: number;
    createdAt: string;
    updatedAt: string;
  }>('SELECT * FROM entries WHERE id = ?', [id]);

  if (!row) return null;
  return mapRowToEntry(row);
}

function mapRowToEntry(row: {
  id: string;
  type: string;
  name: string;
  amount: number;
  date: string;
  comment: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
}): Entry {
  return {
    id: row.id,
    type: row.type as 'expense' | 'income',
    name: row.name,
    amount: row.amount,
    date: row.date,
    comment: row.comment ?? undefined,
    status: row.status === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
