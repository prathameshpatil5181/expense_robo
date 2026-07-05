/**
 * Utility functions for formatting, date handling, and ID generation.
 */

/**
 * Format a number as Indian Rupees with lakh/crore grouping.
 * e.g. 125000 → "₹1,25,000"
 */
export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Use Indian numbering system
  const formatted = absAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Format a date string (YYYY-MM-DD) into a user-friendly format.
 * Returns "Today" if the date is today, otherwise returns a formatted date.
 */
export function formatDate(dateString: string): string {
  const today = getTodayISO();
  
  if (dateString === today) {
    return 'Today';
  }
  
  const date = new Date(dateString + 'T00:00:00');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateString === getISODate(yesterday)) {
    return 'Yesterday';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: dateString.slice(0, 4) !== today.slice(0, 4) ? 'numeric' : undefined,
  };
  
  return date.toLocaleDateString('en-IN', options);
}

/**
 * Format a date string into a long format for headers.
 * e.g. "Saturday, 5 July 2025"
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Returns today's date as YYYY-MM-DD.
 */
export function getTodayISO(): string {
  return getISODate(new Date());
}

/**
 * Returns date as YYYY-MM-DD string.
 */
export function getISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a UUID-like string.
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get current ISO timestamp string.
 */
export function getNowISO(): string {
  return new Date().toISOString();
}
