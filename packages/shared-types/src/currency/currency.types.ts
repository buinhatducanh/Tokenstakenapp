// Currency types — single source of truth for all financial amounts

// Use string for API/JSON transport (JSON doesn't support Decimal)
export type Money = {
  amount: string; // e.g. "12500000.0000"
  currency: string; // ISO 4217: "VND", "USD", "EUR"
};

// Use Decimal type in backend/business logic (Prisma handles this)
export type MoneyValue = {
  amount: number; // Prisma Decimal — use carefully
  currency: string;
};

export const SUPPORTED_CURRENCIES = ["VND", "USD", "EUR", "GBP", "JPY"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
