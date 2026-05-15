// Currency utilities — safe money math without floating-point errors

import { Money } from "@tokens-taken/shared-types/currency/currency.types";

/**
 * Format money for display (e.g., ₫12,500,000)
 */
export function formatMoney(amount: string | number, currency: string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(num);
}

/**
 * Parse money string to number (for display only, NOT for calculation)
 */
export function parseMoney(amount: string): number {
  return parseFloat(amount.replace(/,/g, ""));
}

/**
 * Compare two money values (same currency assumed)
 */
export function moneyEquals(a: string, b: string): boolean {
  return parseFloat(a) === parseFloat(b);
}

/**
 * Add two money values (result as string)
 */
export function moneyAdd(a: string, b: string): string {
  return (parseFloat(a) + parseFloat(b)).toFixed(4);
}

/**
 * Subtract two money values (result as string)
 */
export function moneySubtract(a: string, b: string): string {
  return (parseFloat(a) - parseFloat(b)).toFixed(4);
}

/**
 * Check if journal entries are balanced (total debit === total credit)
 */
export function isBalanced(entries: Array<{ debit: string; credit: string }>): boolean {
  const totalDebit = entries.reduce((sum, e) => sum + parseFloat(e.debit), 0);
  const totalCredit = entries.reduce((sum, e) => sum + parseFloat(e.credit), 0);
  return Math.abs(totalDebit - totalCredit) < 0.0001;
}
