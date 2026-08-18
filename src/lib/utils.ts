import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = 'USD') {
  if (value === undefined || value === null) return "N/A";
  
  let prefix = '$';
  if (currency === 'INR') prefix = '₹';
  else if (currency === 'EUR') prefix = '€';
  else if (currency === 'GBP') prefix = '£';
  else if (currency === 'JPY') prefix = '¥';
  
  if (value >= 1e12) return `${prefix}${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${prefix}${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${prefix}${(value / 1e6).toFixed(2)}M`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export function formatNumber(value: number) {
  if (value === undefined || value === null) return "N/A";
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
