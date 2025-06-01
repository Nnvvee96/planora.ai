/**
 * Format utility functions
 * 
 * Contains reusable functions for formatting various data types
 */

import { Currency } from '@/types/typesApi';

/**
 * Format a monetary value as a currency string
 * @param amount Amount to format
 * @param currency Currency code (defaults to 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: Currency = 'USD'): string => {
  if (isNaN(amount)) return '';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Format a number with thousands separators
 * @param value Number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number): string => {
  if (isNaN(value)) return '';
  
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Truncate a string to a certain length and add ellipsis if needed
 * @param str String to truncate
 * @param length Maximum length
 * @returns Truncated string
 */
export const truncateString = (str: string, length: number = 100): string => {
  if (!str) return '';
  
  if (str.length <= length) {
    return str;
  }
  
  return `${str.slice(0, length)}...`;
};
