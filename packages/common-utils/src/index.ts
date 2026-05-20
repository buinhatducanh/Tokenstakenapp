// Common utilities — shared across all packages and features
// No domain-specific logic here. Pure utilities only.

export { formatMoney, parseMoney, moneyEquals, moneyAdd, moneySubtract, isBalanced } from "./currency/currency.utils.ts";
export { generateReference, generateId, slugify } from "./string/string.utils.ts";
export { paginate, paginatedResponse } from "./pagination/pagination.utils.ts";
export { createAppError, createNotFoundError, createValidationError } from "./error/error.utils.ts";
export { cn } from "./ui/ui.utils.ts";
