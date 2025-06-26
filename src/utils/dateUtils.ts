/**
 * Date utility functions
 *
 * Contains reusable functions for date manipulation and formatting
 */

import { format, differenceInDays, isAfter, isBefore, isValid } from "date-fns";

/**
 * Format a date using a specific format string
 * @param date Date to format
 * @param formatString Format string (defaults to 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  formatString: string = "MMM dd, yyyy",
): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!isValid(dateObj)) {
    return "Invalid date";
  }

  return format(dateObj, formatString);
};

/**
 * Calculate the duration between two dates in days
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of days between the dates
 */
export const getDurationInDays = (
  startDate: Date | string,
  endDate: Date | string,
): number => {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) {
    return 0;
  }

  return differenceInDays(end, start) + 1; // Include both start and end days
};

/**
 * Check if a date is in the future
 * @param date Date to check
 * @returns Boolean indicating if the date is in the future
 */
export const isFutureDate = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!isValid(dateObj)) {
    return false;
  }

  return isAfter(dateObj, new Date());
};

/**
 * Check if a date is in the past
 * @param date Date to check
 * @returns Boolean indicating if the date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!isValid(dateObj)) {
    return false;
  }

  return isBefore(dateObj, new Date());
};
