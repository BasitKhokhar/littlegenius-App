/**
 * Utility helpers — formatting, validation, storage, etc.
 */

// ─── String Helpers ───────────────────────────────────────────────────────────

export const capitalize = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const truncate = (str = '', maxLength = 100) =>
  str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;

// ─── Validation Helpers ───────────────────────────────────────────────────────

export const isValidEmail = (email = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidPassword = (password = '') =>
  password.length >= 8;

export const isValidPhone = (phone = '') =>
  /^\+?[1-9]\d{9,14}$/.test(phone.replace(/\s/g, ''));

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// ─── Number Helpers ───────────────────────────────────────────────────────────

export const formatNumber = (num = 0) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};
