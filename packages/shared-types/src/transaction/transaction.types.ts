// Transaction & Accounting types — shared between frontend and backend
// Owned by Task 3. Do NOT modify from other tasks.

// ─── Enums (mirror Prisma enums for type-safety across layers) ───────────────

export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type TransactionType   = "INCOME"  | "EXPENSE" | "TRANSFER" | "ADJUSTMENT" | "JOURNAL";
export type AccountType       = "ASSET"   | "LIABILITY" | "EQUITY"  | "REVENUE"    | "EXPENSE";
export type ApprovalAction    = "APPROVE" | "REJECT"   | "REQUEST_INFO";

// ─── Core domain types ────────────────────────────────────────────────────────

export type Account = {
  id:             string;
  organizationId: string;
  code:           string;
  name:           string;
  type:           AccountType;
  currency:       string;
  balance:        string;   // Decimal serialised as string
  isActive:       boolean;
  isSystem:       boolean;
  parentId:       string | null;
  createdAt:      string;
  updatedAt:      string;
};

export type JournalEntry = {
  id:            string;
  transactionId: string;
  accountId:     string;
  account?:      Pick<Account, "id" | "code" | "name" | "type">;
  debit:         string;   // Decimal serialised as string
  credit:        string;
  description:   string | null;
  createdAt:     string;
};

export type TransactionApproval = {
  id:            string;
  transactionId: string;
  userId:        string;
  action:        ApprovalAction;
  comment:       string | null;
  decidedAt:     string;
};

export type Transaction = {
  id:             string;
  organizationId: string;
  reference:      string;
  type:           TransactionType;
  status:         TransactionStatus;
  description:    string | null;
  date:           string;
  amount:         string;   // Decimal serialised as string
  currency:       string;
  exchangeRate:   string;
  metadata:       Record<string, unknown>;
  approvedAt:     string | null;
  approvedById:   string | null;
  createdAt:      string;
  updatedAt:      string;
  journalEntries?: JournalEntry[];
  approvals?:      TransactionApproval[];
};

// ─── DTOs (Data Transfer Objects) ────────────────────────────────────────────

export type CreateTransactionDTO = {
  type:         TransactionType;
  description?: string;
  date?:        string;        // ISO datetime string; defaults to now
  amount:       string;        // Positive decimal string, e.g. "1500000.0000"
  currency?:    string;        // Defaults to org currency (VND)
  exchangeRate?: string;       // Defaults to "1"
  metadata?:    Record<string, unknown>;
  invoiceId?:   string;        // Optionally link to an invoice
  entries: Array<{
    accountId:    string;
    debit:        string;
    credit:       string;
    description?: string;
  }>;
};

export type UpdateTransactionDTO = Partial<
  Pick<CreateTransactionDTO, "description" | "metadata">
>;

export type ApproveTransactionDTO = {
  action:   "APPROVE" | "REJECT" | "REQUEST_INFO";
  comment?: string;
};

// ─── Account DTOs ─────────────────────────────────────────────────────────────

export type CreateAccountDTO = {
  code:      string;
  name:      string;
  type:      AccountType;
  currency?: string;
  parentId?: string;
  isSystem?: boolean;
};

export type UpdateAccountDTO = Partial<
  Pick<CreateAccountDTO, "name" | "parentId"> & { isActive: boolean }
>;

// ─── Query / filter types ─────────────────────────────────────────────────────

export type TransactionQuery = {
  page?:      number;
  pageSize?:  number;
  status?:    TransactionStatus;
  type?:      TransactionType;
  dateFrom?:  string;
  dateTo?:    string;
  search?:    string;        // matches reference or description
  sortBy?:    "date" | "amount" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type AccountQuery = {
  type?:     AccountType;
  isActive?: boolean;
  search?:   string;
};

// ─── Summary / aggregate types (for Dashboard/Reports) ───────────────────────

export type TransactionSummary = {
  totalIncome:    string;
  totalExpense:   string;
  netCashFlow:    string;
  pendingCount:   number;
  approvedCount:  number;
  currency:       string;
};

export type LedgerBalance = {
  accountId:   string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debitTotal:  string;
  creditTotal: string;
  balance:     string;
};
