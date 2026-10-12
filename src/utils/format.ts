import { AppSettings } from '../types';

/**
 * Parses user input string into a number.
 * Supports both comma and period as decimal separator.
 */
export function parseNumber(val: string): number | null {
  if (!val || val.trim() === '') return null;
  // Replace comma with dot for standard JS parsing
  const clean = val.replace(/\s/g, '').replace(',', '.');
  const num = Number(clean);
  return isNaN(num) ? null : num;
}

/**
 * Formats a number based on precision and decimal separator settings.
 */
export function formatNumber(
  num: number | null | undefined,
  settings: AppSettings,
  precisionOverride?: number
): string {
  if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
    return '—';
  }

  const precision = precisionOverride !== undefined ? precisionOverride : settings.decimalPrecision;
  
  // Format with fixed precision or smart trimming of trailing zeroes
  let parts: string[];
  if (precision === 0) {
    parts = [Math.round(num).toString()];
  } else {
    // Avoid scientific notation quirks for standard ranges
    const fixed = num.toFixed(precision);
    parts = fixed.split('.');
  }

  // Add thousands separator (space or dot depending on decimal separator)
  const integerPart = parts[0];
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, settings.decimalSeparator === ',' ? '.' : ',');

  if (parts.length > 1 && precision > 0) {
    return `${formattedInteger}${settings.decimalSeparator}${parts[1]}`;
  }

  return formattedInteger;
}

/**
 * Formats a number with currency symbol
 */
export function formatCurrency(
  num: number | null | undefined,
  settings: AppSettings,
  precisionOverride?: number
): string {
  const formatted = formatNumber(num, settings, precisionOverride);
  if (formatted === '—') return '—';
  return `${settings.currency.symbol} ${formatted}`;
}

/**
 * Formats a percentage value (with % suffix)
 */
export function formatPercent(
  num: number | null | undefined,
  settings: AppSettings,
  precisionOverride?: number
): string {
  const formatted = formatNumber(num, settings, precisionOverride);
  if (formatted === '—') return '—';
  return `${formatted}%`;
}
