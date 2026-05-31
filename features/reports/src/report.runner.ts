import { ReportService } from "./report.service";
import type { Account, JournalEntry } from "@packages/shared-types";

const accounts: Account[] = [
  {
    id: "acc-rev",
    organizationId: "org-1",
    code: "4000",
    name: "Revenue",
    type: "REVENUE",
    currency: "VND",
    balance: "0",
    isActive: true,
    isSystem: true,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc-exp",
    organizationId: "org-1",
    code: "5000",
    name: "Expense",
    type: "EXPENSE",
    currency: "VND",
    balance: "0",
    isActive: true,
    isSystem: true,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const entries: JournalEntry[] = [
  {
    id: "je-1",
    transactionId: "txn-1",
    accountId: "acc-rev",
    debit: "0",
    credit: "1500000.0000",
    description: "Sale",
    createdAt: new Date().toISOString(),
  },
  {
    id: "je-2",
    transactionId: "txn-2",
    accountId: "acc-exp",
    debit: "500000.0000",
    credit: "0",
    description: "Expense",
    createdAt: new Date().toISOString(),
  },
];

const service = new ReportService({
  getAccounts: async () => accounts,
  getJournalEntries: async () => entries,
});

const report = await service.getPnlReport(
  "org-1",
  "monthly",
  { from: "2026-01-01", to: "2026-01-31" },
  "VND"
);

console.log(JSON.stringify(report, null, 2));

