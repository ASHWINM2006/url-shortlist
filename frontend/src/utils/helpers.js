import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'Never';
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return 'Never';
  return format(new Date(date), 'MMM d, yyyy HH:mm');
};

export const formatRelativeTime = (date) => {
  if (!date) return 'Never';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const truncateUrl = (url, maxLength = 50) => {
  if (!url) return '';
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
};

export const isValidUrl = (url) => {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data?.errors) {
    return error.response.data.errors.map(e => e.msg).join(', ');
  }
  if (error.message) return error.message;
  return 'An unexpected error occurred';
};

export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toString() || '0';
};

export const COLORS = [
  '#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899'
];
