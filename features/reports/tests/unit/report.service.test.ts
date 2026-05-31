import { describe, expect, it } from "vitest";
import { ReportService } from "../../src/report.service";
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

describe("ReportService", () => {
  it("computes net profit", async () => {
    const svc = new ReportService({
      getAccounts: async () => accounts,
      getJournalEntries: async () => entries,
    });

    const report = await svc.getPnlReport(
      "org-1",
      "monthly",
      { from: "2026-01-01", to: "2026-01-31" },
      "VND"
    );

    expect(report.totals.totalRevenue.amount).toBe("1500000.0000");
    expect(report.totals.totalExpenses.amount).toBe("500000.0000");
    expect(report.totals.netProfit.amount).toBe("1000000.0000");
  });
});

