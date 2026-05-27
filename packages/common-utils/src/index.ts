// Common utilities — shared across all packages and features
// No domain-specific logic here. Pure utilities only.

export { formatMoney, parseMoney, moneyEquals, moneyAdd, moneySubtract, isBalanced } from "./currency/currency.utils";
export { generateReference, generateId, slugify } from "./string/string.utils";
export { paginate, paginatedResponse } from "./pagination/pagination.utils";
export { createAppError, createNotFoundError, createValidationError } from "./error/error.utils";
export { cn } from "./ui/ui.utils";
