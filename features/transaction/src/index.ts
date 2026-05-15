// Task 3: Transaction Feature — Double-Entry Ledger, Approvals, Reconciliation
// Public API surface.

export { TransactionService } from "./transaction.service";
export { JournalService } from "./journal.service";
export { TransactionController } from "./transaction.controller";
export { useTransactions, useTransaction, useCreateTransaction, useApproveTransaction } from "./api/transaction.hooks";
export type { TransactionModuleConfig } from "./transaction.types";
