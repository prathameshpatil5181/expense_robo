export type EntryType = "expense" | "income";

export interface Entry {
  id: string;
  type: EntryType;
  name: string;
  amount: number;
  date: string; // ISO date string (YYYY-MM-DD)
  comment?: string;
  status: boolean; // paid (expense) / received (income)
  createdAt: string;
  updatedAt: string;
}

export interface EntryFormData {
  type: EntryType;
  name: string;
  amount: string; // string for form input handling
  date: string;
  comment: string;
  status: boolean;
}
