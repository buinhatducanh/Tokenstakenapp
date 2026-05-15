// Transaction & Accounting types — shared between frontend and backend

export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER" | "ADJUSTMENT" | "JOURNAL";

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export type JournalEntry = {
  id: string;
  transactionId: string;
  accountId: string;
  debit: string;
  credit: string;
  description: string | null;
};

export type Account = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: string;
  isActive: boolean;
  isSystem: boolean;
  parentId: string | null;
};

export type Transaction = {
  id: string;
  organizationId: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  date: string;
  amount: string;
  currency: string;
  exchangeRate: string;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTransactionDTO = {
  type: TransactionType;
  description?: string;
  date?: string;
  amount: string;
  currency?: string;
  entries: Array<{
    accountId: string;
    debit: string;
    credit: string;
    description?: string;
  }>;
};

export type TransactionApprovalAction = "APPROVE" | "REJECT" | "REQUEST_INFO";
