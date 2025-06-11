
import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

// Get user's local timezone
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Format date in user's timezone
export const formatDateInTimezone = (
  date: Date | string,
  formatStr: string = 'PPpp',
  timezone?: string
): string => {
  const userTimezone = timezone || getUserTimezone();
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  try {
    return formatInTimeZone(dateObj, userTimezone, formatStr);
  } catch (error) {
    console.warn('Error formatting date in timezone:', error);
    return format(dateObj, formatStr);
  }
};

// Convert local time to UTC for storage
export const convertToUTC = (date: Date, timezone?: string): Date => {
  const userTimezone = timezone || getUserTimezone();
  try {
    return fromZonedTime(date, userTimezone);
  } catch (error) {
    console.warn('Error converting to UTC:', error);
    return date;
  }
};

// Convert UTC time to user's timezone
export const convertFromUTC = (date: Date | string, timezone?: string): Date => {
  const userTimezone = timezone || getUserTimezone();
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  try {
    return toZonedTime(dateObj, userTimezone);
  } catch (error) {
    console.warn('Error converting from UTC:', error);
    return dateObj;
  }
};

// Format date for datetime-local input
export const formatForDateTimeLocal = (date: Date | string, timezone?: string): string => {
  const userTimezone = timezone || getUserTimezone();
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  try {
    return formatInTimeZone(dateObj, userTimezone, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.warn('Error formatting for datetime-local:', error);
    return format(dateObj, "yyyy-MM-dd'T'HH:mm");
  }
};
