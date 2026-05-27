// Internal types for the transaction feature module
// These types are NOT exported via shared-types — they are internal to this feature.

export type TransactionModuleConfig = {
  /** Default currency for the organization */
  defaultCurrency: string;
  /** Maximum number of journal entries per transaction */
  maxEntriesPerTransaction: number;
  /** Whether approval is required for transactions above a threshold */
  requireApprovalAbove: number;
  /** Timeout for database transactions (ms) */
  transactionTimeout: number;
};

export const DEFAULT_CONFIG: TransactionModuleConfig = {
  defaultCurrency: "VND",
  maxEntriesPerTransaction: 50,
  requireApprovalAbove: 0, // All transactions require approval by default
  transactionTimeout: 10_000,
};
