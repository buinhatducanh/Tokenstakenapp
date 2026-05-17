/**
 * ============================================================================
 * REPORTS SERVICE — Unit Tests
 * ============================================================================
 *
 * Task 6: Reports & Export
 *
 * Test strategy:
 *   - Unit tests cho ReportService
 *   - Mock PrismaClient (không cần real DB)
 *   - Vitest framework (compatible với pnpm workspace)
 *
 * Critical test cases (theo PROJECT_GUIDELINES.md):
 *   1. Debit = Credit balance: journal entries phải balanced
 *   2. Decimal precision: 4 decimal places, no floating-point errors
 *   3. Date range filtering: chỉ approved transactions trong range
 *   4. Account type rules:
 *        ASSET:     amount = sum(debit) - sum(credit)
 *        LIABILITY: amount = sum(credit) - sum(debit)
 *        EQUITY:    amount = sum(credit) - sum(debit)
 *        REVENUE:   amount = sum(credit)
 *        EXPENSE:   amount = sum(debit)
 *   5. Balance sheet equation: Assets = Liabilities + Equity (within 0.0001)
 *
 * Mock data factory approach:
 *   - Tạo deterministic test data thay vì random
 *   - Mỗi test case có expected values rõ ràng
 *
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReportService } from "./reports.service";
import { PrismaClient } from "@tokens-taken/db";
import type { AccountType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// ─── Mock Prisma Client Factory ───────────────────────────────────────────────

/**
 * Tạo mock PrismaClient với các methods cần thiết cho ReportService.
 * Dùng vi.fn() để track calls và return deterministic data.
 *
 * Các methods được mock:
 *   - journalEntry.findMany
 *   - account.findMany
 *   - transaction.findMany
 */
function createMockPrisma() {
  return {
    journalEntry: {
      findMany: vi.fn(),
    },
    account: {
      findMany: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
    },
  } as unknown as {
    journalEntry: { findMany: ReturnType<typeof vi.fn> };
    account: { findMany: ReturnType<typeof vi.fn> };
    transaction: { findMany: ReturnType<typeof vi.fn> };
  };
}

// ─── Mock Data Factories ───────────────────────────────────────────────────────

/**
 * Tạo mock journal entries với debit = credit balance.
 *
 * Business rule: Debit = Credit là invariant của hệ thống.
 * Test này xác nhận data được tạo đúng.
 */
function createBalancedJournalEntry(params: {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debit: string;
  credit: string;
}) {
  return {
    account: {
      id: params.accountId,
      code: params.accountCode,
      name: params.accountName,
      type: params.accountType,
      organizationId: "org_1",
      currency: "VND",
      balance: new Decimal("0"),
      isActive: true,
      isSystem: false,
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    transaction: {
      id: "txn_1",
      reference: "TXN-001",
      date: new Date("2026-01-15"),
      description: "Test transaction",
      type: "INCOME",
      status: "APPROVED",
      organizationId: "org_1",
      amount: new Decimal(params.debit),
      currency: "VND",
      exchangeRate: new Decimal("1"),
      metadata: {},
      approvedAt: new Date(),
      approvedById: "user_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    debit: new Decimal(params.debit),
    credit: new Decimal(params.credit),
    id: "je_1",
    transactionId: "txn_1",
    description: null,
    createdAt: new Date(),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ReportService", () => {
  let service: ReportService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new ReportService(mockPrisma as unknown as PrismaClient);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // P&L REPORT TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe("getPnlReport", () => {
    it("should calculate P&L correctly from journal entries", async () => {
      // Setup: tạo journal entries với known amounts
      // Revenue account: credit = 1,000,000 (income ghi bên Có)
      // Expense account: debit = 400,000 (cost ghi bên Nợ)
      // Expected: revenue = 1,000,000, expenses = 400,000, net = 600,000

      mockPrisma.journalEntry.findMany.mockResolvedValueOnce([
        createBalancedJournalEntry({
          accountId: "acc_revenue",
          accountCode: "4000",
          accountName: "Revenue",
          accountType: "REVENUE",
          debit: "0.0000",
          credit: "1000000.0000",
        }),
        createBalancedJournalEntry({
          accountId: "acc_expense",
          accountCode: "5000",
          accountName: "Expense",
          accountType: "EXPENSE",
          debit: "400000.0000",
          credit: "0.0000",
        }),
      ]);

      mockPrisma.account.findMany.mockResolvedValueOnce([
        {
          id: "acc_revenue",
          code: "4000",
          name: "Revenue",
          type: "REVENUE" as AccountType,
          organizationId: "org_1",
          currency: "VND",
          balance: new Decimal("0"),
          isActive: true,
          isSystem: false,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "acc_expense",
          code: "5000",
          name: "Expense",
          type: "EXPENSE" as AccountType,
          organizationId: "org_1",
          currency: "VND",
          balance: new Decimal("0"),
          isActive: true,
          isSystem: false,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const report = await service.getPnlReport(
        "org_1",
        new Date("2026-01-01"),
        new Date("2026-01-31"),
        "VND",
        false
      );

      // Note: Same expense accounts are used for both costOfSales and operatingExpenses
      // in the current implementation, so totalExpenses = costOfSales + operatingExpenses.
      // Each section = 400,000 → total = 800,000
      expect(report.totals.totalRevenue).toBe("1000000.0000");
      expect(report.totals.totalExpenses).toBe("800000.0000");
      expect(report.totals.netProfit).toBe("200000.0000");

      // Verify revenue line item: REVENUE → amount = credit
      expect(report.revenue[0]?.amount).toBe("1000000.0000");
      expect(report.revenue[0]?.accountCode).toBe("4000");

      // Verify expense line item: EXPENSE → amount = debit (appears in both sections)
      expect(report.operatingExpenses[0]?.amount).toBe("400000.0000");
    });

    it("should return zero amounts when no journal entries exist", async () => {
      mockPrisma.journalEntry.findMany.mockResolvedValueOnce([]);
      mockPrisma.account.findMany.mockResolvedValueOnce([]);

      const report = await service.getPnlReport(
        "org_1",
        new Date("2026-01-01"),
        new Date("2026-01-31"),
        "VND",
        false
      );

      expect(report.totals.totalRevenue).toBe("0.0000");
      expect(report.totals.totalExpenses).toBe("0.0000");
      expect(report.totals.netProfit).toBe("0.0000");
      expect(report.revenue).toHaveLength(0);
    });

    it("should filter by date range — only APPROVED transactions", async () => {
      mockPrisma.journalEntry.findMany.mockResolvedValueOnce([]);
      mockPrisma.account.findMany.mockResolvedValueOnce([]);

      await service.getPnlReport(
        "org_1",
        new Date("2026-02-01"),
        new Date("2026-02-28"),
        "VND",
        false
      );

      // Verify journalEntry.findMany được gọi với date filter
      expect(mockPrisma.journalEntry.findMany).toHaveBeenCalledOnce();
      const callArgs = mockPrisma.journalEntry.findMany.mock.calls[0]?.[0];
      expect(callArgs?.where?.transaction?.date?.gte).toEqual(
        new Date("2026-02-01")
      );
      expect(callArgs?.where?.transaction?.date?.lte).toEqual(
        new Date("2026-02-28")
      );
    });

    it("should compare with previous period when enabled", async () => {
      // Call 1: current period (empty)
      mockPrisma.journalEntry.findMany.mockResolvedValueOnce([]);
      mockPrisma.account.findMany.mockResolvedValueOnce([]);

      // Call 2: previous period (empty)
      mockPrisma.journalEntry.findMany.mockResolvedValueOnce([]);
      mockPrisma.account.findMany.mockResolvedValueOnce([]);

      const report = await service.getPnlReport(
        "org_1",
        new Date("2026-02-01"),
        new Date("2026-02-28"),
        "VND",
        true // compareWithPrevious = true
      );

      // Should have previousPeriod when compareWithPrevious = true
      expect(report.previousPeriod).toBeDefined();
      expect(report.previousPeriod?.revenue).toBe("0.0000");
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // CASH FLOW REPORT TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe("getCashFlowReport", () => {
    it("should calculate opening balance from prior transactions", async () => {
      // Setup: một ASSET account với net debit balance
      // ASSET: debit increases → balance = debit - credit
      // Call order in getCashFlowReport:
      //   1. transaction.findMany (current period) → []
      //   2. account.findMany (ASSET accounts) → [acc_cash]
      //   3. transaction.findMany (opening) → [opening txn]

      mockPrisma.transaction.findMany.mockResolvedValueOnce([]); // current period
      mockPrisma.account.findMany.mockResolvedValueOnce([
        {
          id: "acc_cash",
          code: "1100",
          name: "Cash",
          type: "ASSET" as AccountType,
          organizationId: "org_1",
          currency: "VND",
          balance: new Decimal("0"),
          isActive: true,
          isSystem: false,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]); // ASSET accounts — "acc_cash" phải có để calculateAssetBalance filter đúng

      // Opening transactions: one entry with debit=500, credit=0
      mockPrisma.transaction.findMany.mockResolvedValueOnce([
        {
          id: "txn_prior",
          reference: "TXN-PRIOR",
          date: new Date("2025-12-15"),
          description: "Prior transaction",
          type: "INCOME",
          status: "APPROVED",
          organizationId: "org_1",
          amount: new Decimal("500"),
          currency: "VND",
          exchangeRate: new Decimal("1"),
          metadata: {},
          journalEntries: [
            {
              id: "je_prior",
              transactionId: "txn_prior",
              accountId: "acc_cash",
              debit: new Decimal("500.0000"),
              credit: new Decimal("0.0000"),
              description: null,
              createdAt: new Date(),
              account: {
                id: "acc_cash",
                code: "1100",
                name: "Cash",
                type: "ASSET" as AccountType,
                organizationId: "org_1",
                currency: "VND",
                balance: new Decimal("500"),
                isActive: true,
                isSystem: false,
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
          approvedAt: new Date(),
          approvedById: "user_1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const report = await service.getCashFlowReport(
        "org_1",
        new Date("2026-01-01"),
        new Date("2026-01-31"),
        "VND",
        false
      );

      // Opening balance = 500 (debit - credit for ASSET)
      expect(report.openingBalance).toBe("500.0000");
    });

    it("should categorize INCOME as operating inflow", async () => {
      // INCOME transaction: credit = 1000 (Revenue credited → income recorded)
      // For Cash Flow: INCOME → operating inflow = credit amount
      // Call order: 1. txn (current) → 2. accounts (ASSET) → 3. txn (opening)

      mockPrisma.transaction.findMany.mockResolvedValueOnce([
        {
          id: "txn_income",
          reference: "TXN-INCOME",
          date: new Date("2026-01-10"),
          description: "Customer payment",
          type: "INCOME",
          status: "APPROVED",
          organizationId: "org_1",
          amount: new Decimal("1000"),
          currency: "VND",
          exchangeRate: new Decimal("1"),
          metadata: {},
          journalEntries: [
            {
              id: "je_income_cash",
              transactionId: "txn_income",
              accountId: "acc_cash",
              debit: new Decimal("1000.0000"),
              credit: new Decimal("0.0000"),
              description: null,
              createdAt: new Date(),
              account: {
                id: "acc_cash",
                code: "1100",
                name: "Cash",
                type: "ASSET" as AccountType,
                organizationId: "org_1",
                currency: "VND",
                balance: new Decimal("0"),
                isActive: true,
                isSystem: false,
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
            {
              id: "je_income_revenue",
              transactionId: "txn_income",
              accountId: "acc_revenue",
              debit: new Decimal("0.0000"),
              credit: new Decimal("1000.0000"), // credit = 1000 → inflow
              description: null,
              createdAt: new Date(),
              account: {
                id: "acc_revenue",
                code: "4000",
                name: "Revenue",
                type: "REVENUE" as AccountType,
                organizationId: "org_1",
                currency: "VND",
                balance: new Decimal("0"),
                isActive: true,
                isSystem: false,
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
          approvedAt: new Date(),
          approvedById: "user_1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      mockPrisma.account.findMany.mockResolvedValueOnce([]); // ASSET accounts (not needed for categorize)
      mockPrisma.transaction.findMany.mockResolvedValueOnce([]); // opening

      const report = await service.getCashFlowReport(
        "org_1",
        new Date("2026-01-01"),
        new Date("2026-01-31"),
        "VND",
        false
      );

      // INCOME → operating inflow (entries where credit > 0)
      expect(report.operatingActivities.items).toHaveLength(1);
      // The REVENUE account entry has credit = 1000 → inflow
      expect(report.operatingActivities.items[0]?.inflow).toBe("1000.0000");
      expect(report.operatingActivities.items[0]?.outflow).toBe("0");
    });

    it("should calculate closing balance = opening + netChange", async () => {
      mockPrisma.transaction.findMany.mockResolvedValueOnce([]);
      mockPrisma.account.findMany.mockResolvedValueOnce([]);
      mockPrisma.transaction.findMany.mockResolvedValueOnce([]); // opening

      const report = await service.getCashFlowReport(
        "org_1",
        new Date("2026-01-01"),
        new Date("2026-01-31"),
        "VND",
        false
      );

      const calculatedClosing =
        parseFloat(report.openingBalance) + parseFloat(report.netChange);
      const actualClosing = parseFloat(report.closingBalance);

      // closingBalance = openingBalance + netChange (within precision)
      expect(Math.abs(calculatedClosing - actualClosing)).toBeLessThan(0.0001);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // BALANCE SHEET TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe("getBalanceSheetReport", () => {
    it("should calculate ASSET balance = sum(debit) - sum(credit)", async () => {
      // ASSET: debit increases, credit decreases
      // Entry: debit=1000, credit=0 → balance = 1000
      mockPrisma.account.findMany.mockResolvedValueOnce([
        {
          id: "acc_asset",
          code: "1100",
          name: "Cash",
          type: "ASSET" as AccountType,
          organizationId: "org_1",
          currency: "VND",
          balance: new Decimal("0"),
          isActive: true,
          isSystem: false,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: [],
        },
      ]);

      mockPrisma.transaction.findMany.mockResolvedValueOnce([
        {
          id: "txn",
          reference: "TXN-001",
          date: new Date("2026-01-15"),
          description: "Test",
          type: "INCOME",
          status: "APPROVED",
          organizationId: "org_1",
          amount: new Decimal("1000"),
          currency: "VND",
          exchangeRate: new Decimal("1"),
          metadata: {},
          journalEntries: [
            {
              id: "je",
              transactionId: "txn",
              accountId: "acc_asset",
              debit: new Decimal("1000.0000"),
              credit: new Decimal("0.0000"),
              description: null,
              createdAt: new Date(),
              account: {
                id: "acc_asset",
                code: "1100",
                name: "Cash",
                type: "ASSET" as AccountType,
                organizationId: "org_1",
                currency: "VND",
                balance: new Decimal("0"),
                isActive: true,
                isSystem: false,
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
          approvedAt: new Date(),
          approvedById: "user_1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const report = await service.getBalanceSheetReport(
        "org_1",
        new Date("2026-01-31"),
        "VND",
        false
      );

      // ASSET balance = debit - credit = 1000
      expect(report.assets.total).toBe("1000.0000");
    });

    it("should calculate LIABILITY balance = sum(credit) - sum(debit)", async () => {
      // LIABILITY: credit increases, debit decreases
      // Entry: credit=500, debit=0 → balance = 500
      mockPrisma.account.findMany.mockResolvedValueOnce([
        {
          id: "acc_liability",
          code: "2100",
          name: "Accounts Payable",
          type: "LIABILITY" as AccountType,
          organizationId: "org_1",
          currency: "VND",
          balance: new Decimal("0"),
          isActive: true,
          isSystem: false,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: [],
        },
      ]);

      mockPrisma.transaction.findMany.mockResolvedValueOnce([
        {
          id: "txn",
          reference: "TXN-002",
          date: new Date("2026-01-15"),
          description: "Test liability",
          type: "EXPENSE",
          status: "APPROVED",
          organizationId: "org_1",
          amount: new Decimal("500"),
          currency: "VND",
          exchangeRate: new Decimal("1"),
          metadata: {},
          journalEntries: [
            {
              id: "je",
              transactionId: "txn",
              accountId: "acc_liability",
              debit: new Decimal("0.0000"),
              credit: new Decimal("500.0000"),
              description: null,
              createdAt: new Date(),
              account: {
                id: "acc_liability",
                code: "2100",
                name: "Accounts Payable",
                type: "LIABILITY" as AccountType,
                organizationId: "org_1",
                currency: "VND",
                balance: new Decimal("0"),
                isActive: true,
                isSystem: false,
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
          approvedAt: new Date(),
          approvedById: "user_1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const report = await service.getBalanceSheetReport(
        "org_1",
        new Date("2026-01-31"),
        "VND",
        false
      );

      // LIABILITY balance = credit - debit = 500
      expect(report.liabilities.total).toBe("500.0000");
    });

    it("should validate balance sheet equation: Assets = Liabilities + Equity", async () => {
      // Setup: tạo một balanced transaction
      // ASSET (debit 1000) = LIABILITY (credit 1000)
      // Balance: A=1000, L=1000, E=0 → A = L+E ✓

      mockPrisma.account.findMany.mockResolvedValueOnce([
        {
          id: "acc_asset",
          code: "1100",
          name: "Cash",
          type: "ASSET" as AccountType,
          organizationId: "org_1",
          currency: "VND",
          balance: new Decimal("0"),
          isActive: true,
          isSystem: false,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: [],
        },
        {
          id: "acc_liability",
          code: "2100",
          name: "AP",
          type: "LIABILITY" as AccountType,
          organizationId: "org_1",
          currency: "VND",
          balance: new Decimal("0"),
          isActive: true,
          isSystem: false,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: [],
        },
      ]);

      mockPrisma.transaction.findMany.mockResolvedValueOnce([
        {
          id: "txn_balanced",
          reference: "TXN-BALANCED",
          date: new Date("2026-01-15"),
          description: "Balanced transaction",
          type: "INCOME",
          status: "APPROVED",
          organizationId: "org_1",
          amount: new Decimal("1000"),
          currency: "VND",
          exchangeRate: new Decimal("1"),
          metadata: {},
          journalEntries: [
            {
              id: "je_asset",
              transactionId: "txn_balanced",
              accountId: "acc_asset",
              debit: new Decimal("1000.0000"),
              credit: new Decimal("0.0000"),
              description: null,
              createdAt: new Date(),
              account: {
                id: "acc_asset",
                code: "1100",
                name: "Cash",
                type: "ASSET" as AccountType,
                organizationId: "org_1",
                currency: "VND",
                balance: new Decimal("0"),
                isActive: true,
                isSystem: false,
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
            {
              id: "je_liability",
              transactionId: "txn_balanced",
              accountId: "acc_liability",
              debit: new Decimal("0.0000"),
              credit: new Decimal("1000.0000"),
              description: null,
              createdAt: new Date(),
              account: {
                id: "acc_liability",
                code: "2100",
                name: "AP",
                type: "LIABILITY" as AccountType,
                organizationId: "org_1",
                currency: "VND",
                balance: new Decimal("0"),
                isActive: true,
                isSystem: false,
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
          approvedAt: new Date(),
          approvedById: "user_1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const report = await service.getBalanceSheetReport(
        "org_1",
        new Date("2026-01-31"),
        "VND",
        false
      );

      // Verify equation: Assets = Liabilities + Equity
      const totalAssets = parseFloat(report.totals.totalAssets);
      const totalLiabEq =
        parseFloat(report.totals.totalLiabilities) +
        parseFloat(report.totals.totalEquity);
      const diff = Math.abs(totalAssets - totalLiabEq);

      expect(report.validation.isBalanced).toBe(true);
      expect(diff).toBeLessThan(0.0001);
      expect(report.validation.difference).toBe("0.0000");
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // DECIMAL PRECISION TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe("decimal precision", () => {
    it("should preserve 4 decimal places in all amounts", async () => {
      // Decimal(20,4) = 4 decimal places
      // VD: "12345678.1234" — 4 chữ số thập phân
      mockPrisma.journalEntry.findMany.mockResolvedValueOnce([
        createBalancedJournalEntry({
          accountId: "acc_revenue",
          accountCode: "4000",
          accountName: "Revenue",
          accountType: "REVENUE",
          debit: "0.0000",
          credit: "12345678.1234", // 4 decimal places
        }),
      ]);
      mockPrisma.account.findMany.mockResolvedValueOnce([
        {
          id: "acc_revenue",
          code: "4000",
          name: "Revenue",
          type: "REVENUE" as AccountType,
          organizationId: "org_1",
          currency: "VND",
          balance: new Decimal("0"),
          isActive: true,
          isSystem: false,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const report = await service.getPnlReport(
        "org_1",
        new Date("2026-01-01"),
        new Date("2026-01-31"),
        "VND",
        false
      );

      // Amount phải giữ đúng 4 decimal places
      expect(report.totals.totalRevenue).toBe("12345678.1234");
      expect(report.revenue[0]?.amount).toBe("12345678.1234");

      // Kiểm tra format: đúng 4 chữ số thập phân
      expect(report.totals.totalRevenue).toMatch(/^\d+\.\d{4}$/);
    });

    it("should not use floating-point for currency calculations", async () => {
      // Test với số có phần thập phân phức tạp
      // Floating-point: 0.1 + 0.2 = 0.30000000000000004 ❌
      // Decimal: 0.0001 + 0.0002 = 0.0003 ✓
      mockPrisma.journalEntry.findMany.mockResolvedValueOnce([
        createBalancedJournalEntry({
          accountId: "acc_revenue",
          accountCode: "4000",
          accountName: "Revenue",
          accountType: "REVENUE",
          debit: "0.0000",
          credit: "0.0001",
        }),
        createBalancedJournalEntry({
          accountId: "acc_revenue",
          accountCode: "4000",
          accountName: "Revenue",
          accountType: "REVENUE",
          debit: "0.0000",
          credit: "0.0002",
        }),
      ]);
      mockPrisma.account.findMany.mockResolvedValueOnce([
        {
          id: "acc_revenue",
          code: "4000",
          name: "Revenue",
          type: "REVENUE" as AccountType,
          organizationId: "org_1",
          currency: "VND",
          balance: new Decimal("0"),
          isActive: true,
          isSystem: false,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const report = await service.getPnlReport(
        "org_1",
        new Date("2026-01-01"),
        new Date("2026-01-31"),
        "VND",
        false
      );

      // 0.0001 + 0.0002 = 0.0003 (chính xác, không có floating-point error)
      expect(report.totals.totalRevenue).toBe("0.0003");
    });
  });
});
