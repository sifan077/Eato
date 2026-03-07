// Get the start of the day (00:00:00) in Beijing Time
export function getStartOfDay(date: Date = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Format as YYYY-MM-DD in Beijing time
  const beijingDateStr = d.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // Parse as UTC midnight of that day
  const result = new Date(`${beijingDateStr}T00:00:00.000Z`);
  return result;
}

// Get the end of the day (23:59:59.999) in Beijing Time
export function getEndOfDay(date: Date = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Format as YYYY-MM-DD in Beijing time
  const beijingDateStr = d.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // Parse as UTC end of that day
  const result = new Date(`${beijingDateStr}T23:59:59.999Z`);
  return result;
}

// Format date to ISO string (Beijing Time)
export function formatDateToISO(date: Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return (
    d
      .toLocaleString('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(', ', 'T') + '.000Z'
  );
}

// Get current hour in Beijing Time (0-23)
export function getCurrentHour(): number {
  return parseInt(
    new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Shanghai',
      hour12: false,
      hour: 'numeric',
    }),
    10
  );
}

// Auto-detect meal type based on current Beijing time
import { MEAL_TIME_RANGES } from '@/lib/constants';

export function detectMealType(hour?: number): string {
  const h = hour ?? getCurrentHour();

  if (h >= MEAL_TIME_RANGES.breakfast.start && h <= MEAL_TIME_RANGES.breakfast.end) {
    return 'breakfast';
  }
  if (h >= MEAL_TIME_RANGES.lunch.start && h <= MEAL_TIME_RANGES.lunch.end) {
    return 'lunch';
  }
  if (h >= MEAL_TIME_RANGES.dinner.start && h <= MEAL_TIME_RANGES.dinner.end) {
    return 'dinner';
  }
  return 'lunch'; // Default to lunch for any other time
}

// Format date for display in Beijing Time (e.g., "2026年1月3日")
export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  });
}

// Format time for display in Beijing Time (e.g., "12:30")
export function formatTimeDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  });
}

// Format date and time for display in Beijing Time (e.g., "2026年1月3日 12:30")
export function formatDateTimeDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  });
  const timeStr = d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  });
  return `${dateStr} ${timeStr}`;
}

// Check if two dates are the same day in Beijing Time
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const date1Str = d1.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  const date2Str = d2.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  return date1Str === date2Str;
}

// Get days between two dates in Beijing Time
export function getDaysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const date1Str = d1.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  const date2Str = d2.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  const diffTime = Math.abs(new Date(date2Str).getTime() - new Date(date1Str).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
