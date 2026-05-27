// ─────────────────────────────────────────────────────────────
// Task 3: Transaction Feature — Public API Surface
// ─────────────────────────────────────────────────────────────
// Other features / apps import ONLY from this file.
// e.g.  import { TransactionService } from "@tokens-taken/feature-transaction";
// ─────────────────────────────────────────────────────────────

// Backend services
export { TransactionService }   from "./transaction.service";
export { JournalService }       from "./journal.service";
export { AccountService }       from "./account.service";
export { TransactionController } from "./transaction.controller";

// Frontend hooks (React Query configs)
export {
  useTransactions,
  useTransaction,
  useCreateTransaction,
  useUpdateTransaction,
  useApproveTransaction,
  useCancelTransaction,
  useTransactionSummary,
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useLedgerBalances,
} from "./api/transaction.hooks";

// Internal config type
export type { TransactionModuleConfig } from "./transaction.types";
