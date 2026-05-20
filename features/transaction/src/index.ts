// Task 3: Transaction Feature — Double-Entry Ledger, Approvals, Reconciliation
// Public API surface.
// Bỏ export Backend ở đây để tránh Vite (Frontend) cố gắng biên dịch code của NestJS/Prisma!
// export { TransactionService } from "./backend/transaction.service";
// export { TransactionController } from "./backend/transaction.controller";

export { CreateTransactionForm } from "./frontend/components/CreateTransactionForm";
export { useCreateTransaction, useTransactions, useAccounts } from "./frontend/api/transaction.hooks";

// TODO: Sẽ tạo các file này ở các bước tiếp theo
// export { JournalService } from "./journal.service";
// export { useTransactions, useTransaction, useApproveTransaction } from "./api/transaction.hooks";
// export type { TransactionModuleConfig } from "./transaction.types";
