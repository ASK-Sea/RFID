// src/functions.ts - Global utility functions for all pages

import axios from "axios";

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Format date and time for display
 */
export const formatTime = (datetime: string | null): string => {
  if (!datetime) return "N/A";
  const date = new Date(datetime);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

/**
 * Format date for display
 */
export const formatDate = (datetime: string | null): string => {
  if (!datetime) return "N/A";
  const date = new Date(datetime);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format datetime for display
 */
export const formatDateTime = (datetime: string | null): string => {
  if (!datetime) return "N/A";
  return `${formatDate(datetime)} ${formatTime(datetime)}`;
};

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

/**
 * Save data to localStorage
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to localStorage [${key}]:`, error);
  }
};

/**
 * Load data from localStorage
 */
export const loadFromLocalStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.error(`Failed to load from localStorage [${key}]:`, error);
    return defaultValue || null;
  }
};

/**
 * Remove data from localStorage
 */
export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove from localStorage [${key}]:`, error);
  }
};

/**
 * Save data to sessionStorage
 */
export const saveToSessionStorage = <T>(key: string, data: T): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to sessionStorage [${key}]:`, error);
  }
};

/**
 * Load data from sessionStorage
 */
export const loadFromSessionStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.error(`Failed to load from sessionStorage [${key}]:`, error);
    return defaultValue || null;
  }
};

// ============================================================================
// ARRAY & PAGINATION FUNCTIONS
// ============================================================================

/**
 * Get paginated data from an array
 */
export const getPaginatedData = <T>(data: T[], page: number, perPage: number): T[] => {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  return data.slice(startIndex, endIndex);
};

/**
 * Calculate total pages for pagination
 */
export const getTotalPages = (dataLength: number, perPage: number): number => {
  return Math.ceil(dataLength / perPage);
};

/**
 * Filter array by search term
 */
export const filterBySearchTerm = <T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] => {
  if (!searchTerm) return data;
  const term = searchTerm.toLowerCase();
  return data.filter((item) =>
    fields.some((field) =>
      String(item[field]).toLowerCase().includes(term)
    )
  );
};

/**
 * Sort array by property
 */
export const sortByProperty = <T extends Record<string, any>>(
  data: T[],
  property: keyof T,
  order: "asc" | "desc" = "asc"
): T[] => {
  return [...data].sort((a, b) => {
    const valueA = a[property];
    const valueB = b[property];

    if (valueA < valueB) return order === "asc" ? -1 : 1;
    if (valueA > valueB) return order === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Group array by property
 */
export const groupByProperty = <T extends Record<string, any>>(
  data: T[],
  property: keyof T
): Record<string, T[]> => {
  return data.reduce((acc, item) => {
    const key = String(item[property]);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

// ============================================================================
// NUMBER & CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Round to specified decimal places
 */
export const roundTo = (num: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

/**
 * Clamp number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

// ============================================================================
// STRING FUNCTIONS
// ============================================================================

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert string to title case
 */
export const toTitleCase = (str: string): string => {
  return str
    .split(/\s+/)
    .map((word) => capitalize(word.toLowerCase()))
    .join(" ");
};

/**
 * Truncate string to specified length
 */
export const truncate = (str: string, length: number, suffix: string = "..."): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
};

/**
 * Remove special characters from string
 */
export const sanitizeString = (str: string): string => {
  return str.replace(/[^a-zA-Z0-9_-]/g, "");
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if string is empty or whitespace
 */
export const isEmpty = (str: string): boolean => {
  return !str || str.trim().length === 0;
};

/**
 * Check if object is empty
 */
export const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ============================================================================
// TIME & DATE FUNCTIONS
// ============================================================================

/**
 * Get current timestamp
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Format duration in milliseconds to readable string (e.g., "2h 30m 15s")
 */
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.length > 0 ? parts.join(" ") : "0s";
};

// ============================================================================
// API ERROR HANDLING FUNCTIONS
// ============================================================================

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

/**
 * Handle API error and log it
 */
export const handleApiError = (error: any, context: string = ""): string => {
  const message = getErrorMessage(error);
  console.error(`${context ? `[${context}] ` : ""}API Error:`, error);
  return message;
};

// ============================================================================
// DELAY & PROMISE FUNCTIONS
// ============================================================================

/**
 * Delay execution for specified milliseconds
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
      await delay(delayMs);
    }
  }
  throw new Error("Max retries exceeded");
};

/**
 * Create a debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};

/**
 * Create a throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================================================
// COPY & CLIPBOARD FUNCTIONS
// ============================================================================

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

/**
 * Copy object to clipboard as JSON
 */
export const copyObjectToClipboard = async (obj: any): Promise<boolean> => {
  return copyToClipboard(JSON.stringify(obj, null, 2));
};

// ============================================================================
// UNIQUE & RANDOM FUNCTIONS
// ============================================================================

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

/**
 * Get unique values from array
 */
export const getUniqueValues = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

/**
 * Get random item from array
 */
export const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Shuffle array
 */
export const shuffleArray = <T>(arr: T[]): T[] => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// ============================================================================
// COMPARISON FUNCTIONS
// ============================================================================

/**
 * Deep compare two objects
 */
export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => deepEqual(obj1[key], obj2[key]));
};

/**
 * Compare arrays by content
 */
export const arraysEqual = <T>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => deepEqual(item, arr2[index]));
};
