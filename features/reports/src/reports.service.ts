/**
 * ============================================================================
 * REPORTS SERVICE — Task 6: Financial Reports
 * ============================================================================
 *
 * Nghiệp vụ: Tính toán và trả về 3 loại báo cáo tài chính:
 *   1. P&L (Profit & Loss) — Báo cáo thu nhập
 *   2. Cash Flow — Báo cáo lưu chuyển tiền tệ
 *   3. Balance Sheet — Báo cáo cân đối kế toán
 *
 * Nguyên tắc double-entry bookkeeping:
 *   • ASSET:     debit (+) increases, credit (-) decreases
 *                balance = sum(debit) - sum(credit)
 *   • LIABILITY: credit (+) increases, debit (-) decreases
 *                balance = sum(credit) - sum(debit)
 *   • EQUITY:    credit (+) increases, debit (-) decreases
 *                balance = sum(credit) - sum(debit)
 *   • REVENUE:   credit increases (thu nhập ghi bên Có)
 *   • EXPENSE:   debit increases (chi phí ghi bên Nợ)
 *
 * Luôn dùng Decimal cho số tiền. Chỉ serialize sang string khi trả về JSON.
 * Chỉ lấy transactions có status = APPROVED.
 *
 * ============================================================================
 */

import { Injectable } from "@nestjs/common";

// PrismaClient: kết nối DB — tất cả features import từ @tokens-taken/db
import { PrismaClient } from "@tokens-taken/db";
// AccountType enum từ Prisma (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
import type { AccountType } from "@prisma/client";
// Decimal từ Prisma runtime — dùng để convert DB Decimal → string
import { Decimal } from "@prisma/client/runtime/library";

// Types cho báo cáo — chỉ import type (compile-time only, không bundle runtime)
import type {
  PnlReport,
  PnlLineItem,
  PnlSection,
  CashFlowReport,
  CashFlowLineItem,
  CashFlowCategory,
  BalanceSheetReport,
  BalanceSheetLineItem,
} from "./types/report.types";

@Injectable()
export class ReportService {
  /**
   * Constructor nhận PrismaClient — NestJS tự inject qua module.
   * Khởi tạo private readonly để đảm bảo immutability.
   */
  constructor(private readonly prisma: PrismaClient) {}

  // ════════════════════════════════════════════════════════════════════════════
  // P&L REPORT
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Lấy báo cáo P&L cho một tổ chức trong khoảng thời gian.
   *
   * @param organizationId - ID của tổ chức (từ auth context)
   * @param dateFrom       - Ngày bắt đầu kỳ báo cáo
   * @param dateTo         - Ngày kết thúc kỳ báo cáo
   * @param currency       - Mã tiền tệ (mặc định: "VND")
   * @param compareWithPrevious - Có so sánh với kỳ trước không
   *
   * @returns PnlReport — thu nhập, chi phí, và lợi nhuận
   *
   * Nghiệp vụ P&L:
   *   Revenue = tổng credit của các REVENUE accounts
   *   Cost of Sales = tổng debit của EXPENSE accounts thuộc section costOfSales
   *   Gross Profit = Revenue - Cost of Sales
   *   Operating Expenses = tổng debit của EXPENSE accounts thuộc section operatingExpenses
   *   Operating Profit = Gross Profit - Operating Expenses
   *   Net Profit = Operating Profit (simplified — chưa có other income/expense)
   */
  async getPnlReport(
    organizationId: string,
    dateFrom: Date,
    dateTo: Date,
    currency: string = "VND",
    compareWithPrevious: boolean = false
  ): Promise<PnlReport> {
    /**
     * Bước 1: Lấy tất cả journal entries trong kỳ.
     *
     * Include:
     *   - account: để biết account type và thông tin tài khoản
     *   - transaction: để lọc theo date và status
     *
     * Filter:
     *   - account.organizationId = orgId để đảm bảo isolation
     *   - account.currency = currency để lọc theo loại tiền tệ
     *   - account.isActive = true để loại bỏ tài khoản đã bị vô hiệu hóa
     *   - transaction.date BETWEEN dateFrom AND dateTo
     *   - transaction.status = APPROVED
     */
    const journalEntries = await this.prisma.journalEntry.findMany({
      where: {
        account: {
          organizationId,
          currency,
          isActive: true,
        },
        transaction: {
          date: { gte: dateFrom, lte: dateTo },
          status: "APPROVED",
        },
      },
      include: {
        account: true,
        transaction: true,
      },
    });

    /**
     * Bước 2: Lấy tất cả accounts REVENUE và EXPENSE của tổ chức.
     * Cần để build P&L section — mỗi account tạo một PnlLineItem.
     */
    const accounts = await this.prisma.account.findMany({
      where: {
        organizationId,
        currency,
        isActive: true,
        type: { in: ["REVENUE", "EXPENSE"] },
      },
    });

    /**
     * Bước 3: Phân loại accounts theo type và section.
     * REVENUE → section "revenue" (luôn)
     * EXPENSE → phân loại thành "costOfSales" hoặc "operatingExpenses"
     *           (hiện tại gộp tất cả EXPENSE vào operatingExpenses)
     */
    const revenueAccounts = accounts.filter((a: { type: string }) => a.type === "REVENUE");
    const expenseAccounts = accounts.filter((a: { type: string }) => a.type === "EXPENSE");

    /**
     * Bước 4: Build P&L sections từ journal entries.
     *
     * Quy tắc double-entry cho P&L:
     *   REVENUE: credit increases → amount = sum(credit)
     *   EXPENSE: debit increases  → amount = sum(debit)
     */
    const revenue = this.buildPnlSection(journalEntries, revenueAccounts, "revenue");
    const costOfSales = this.buildPnlSection(
      journalEntries,
      expenseAccounts,
      "costOfSales"
    );
    const operatingExpenses = this.buildPnlSection(
      journalEntries,
      expenseAccounts,
      "operatingExpenses"
    );

    /**
     * Bước 5: Tính tổng và các chỉ số P&L.
     * Dùng parseFloat vì các giá trị amount đã là string Decimal serialization.
     */
    const totalRevenue = revenue.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );
    const totalCost = costOfSales.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );
    const totalOpEx = operatingExpenses.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );

    const grossProfit = totalRevenue - totalCost;
    const operatingProfit = grossProfit - totalOpEx;
    const netProfit = operatingProfit;

    // Tính biên lợi nhuận (margin = profit / revenue * 100)
    const grossMargin =
      totalRevenue !== 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const opMargin =
      totalRevenue !== 0 ? (operatingProfit / totalRevenue) * 100 : 0;
    const netMargin =
      totalRevenue !== 0 ? (netProfit / totalRevenue) * 100 : 0;

    /**
     * Bước 6: Tính previous period (nếu compareWithPrevious = true).
     * Previous period có độ dài bằng với current period.
     *
     * Ví dụ: current = Jan 1 → Jan 31 (31 ngày)
     *         previous = Dec 1 → Dec 31 (31 ngày)
     *
     * prevDateFrom = dateFrom - periodLength
     * prevDateTo   = dateFrom - 1 (cuối ngày trước khi bắt đầu)
     */
    let previousPeriod: PnlReport["previousPeriod"];

    if (compareWithPrevious) {
      const periodLength = dateTo.getTime() - dateFrom.getTime();
      const prevDateFrom = new Date(dateFrom.getTime() - periodLength);
      const prevDateTo = new Date(dateFrom.getTime() - 1);

      previousPeriod = await this.getPnlTotalsOnly(
        organizationId,
        prevDateFrom,
        prevDateTo,
        currency
      );
    }

    /**
     * Bước 7: Trả về P&L report.
     * Tất cả số tiền được serialize sang string với 4 decimal places.
     */
    return {
      period: {
        start: dateFrom.toISOString(),
        end: dateTo.toISOString(),
        label: this.formatPeriodLabel(dateFrom, dateTo),
      },
      currency,
      revenue,
      costOfSales,
      grossProfit: {
        amount: grossProfit.toFixed(4),
        margin: grossMargin.toFixed(2) + "%",
      },
      operatingExpenses,
      operatingProfit: {
        amount: operatingProfit.toFixed(4),
        margin: opMargin.toFixed(2) + "%",
      },
      otherIncome: [],
      otherExpenses: [],
      netProfit: {
        amount: netProfit.toFixed(4),
        margin: netMargin.toFixed(2) + "%",
      },
      totals: {
        totalRevenue: totalRevenue.toFixed(4),
        totalExpenses: (totalCost + totalOpEx).toFixed(4),
        netProfit: netProfit.toFixed(4),
      },
      ...(previousPeriod ? { previousPeriod } : {}),
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CASH FLOW REPORT
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Lấy báo cáo lưu chuyển tiền tệ cho một tổ chức.
   *
   * @param organizationId - ID của tổ chức
   * @param dateFrom       - Ngày bắt đầu
   * @param dateTo         - Ngày kết thúc
   * @param currency       - Mã tiền tệ
   * @param compareWithPrevious - Có so sánh với kỳ trước không
   *
   * @returns CashFlowReport — opening balance, các hoạt động, closing balance
   *
   * Nghiệp vụ Cash Flow:
   *   Opening Balance = tổng balance ASSET accounts TRƯỚC dateFrom
   *   Operating Inflow  = sum(credit) của INCOME transactions
   *   Operating Outflow = sum(debit) của EXPENSE transactions
   *   Financing = TRANSFER transactions (internal movements)
   *   Closing Balance = Opening Balance + Net Change
   *
   * Công thức:
   *   netChange = operating inflow + investing inflow + financing inflow
   *              - operating outflow - investing outflow - financing outflow
   *   closingBalance = openingBalance + netChange
   */
  async getCashFlowReport(
    organizationId: string,
    dateFrom: Date,
    dateTo: Date,
    currency: string = "VND",
    compareWithPrevious: boolean = false
  ): Promise<CashFlowReport> {
    /**
     * Bước 1: Lấy transactions trong kỳ báo cáo (APPROVED only).
     * Include journalEntries để tính inflow/outflow.
     */
    const transactions = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        currency,
        status: "APPROVED",
        date: { gte: dateFrom, lte: dateTo },
      },
      include: {
        journalEntries: {
          include: { account: true },
        },
      },
    });

    /**
     * Bước 2: Lấy ASSET accounts để tính balance.
     * Balance của ASSET account = sum(debit) - sum(credit)
     */
    const assetAccounts = await this.prisma.account.findMany({
      where: {
        organizationId,
        currency,
        isActive: true,
        type: "ASSET",
      },
    });

    /**
     * Bước 3: Tính opening balance.
     *
     * Opening balance = tổng balance của ASSET accounts
     *                   TÍNH TỪ ĐẦU ĐẾN TRƯỚC dateFrom
     *
     * Cách tính: với mỗi transaction trước dateFrom,
     *             cộng debit vào balance, trừ credit khỏi balance.
     *
     * ASSET: debit (+) increases → sum(debit) - sum(credit)
     */
    const openingTxns = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        currency,
        status: "APPROVED",
        date: { lt: dateFrom },
      },
      include: { journalEntries: { include: { account: true } } },
    });

    const openingBalance = this.calculateAssetBalance(
      openingTxns,
      assetAccounts
    );

    /**
     * Bước 4: Tính closing balance.
     * Closing = opening + change trong kỳ
     */
    const closingBalance =
      openingBalance + this.calculateAssetBalance(transactions, assetAccounts);

    /**
     * Bước 5: Phân loại transactions theo category.
     *
     * Cách phân loại:
     *   operating:  INCOME → inflow, EXPENSE → outflow
     *   investing:  (hiện tại luôn empty — chưa có investing transactions)
     *   financing:  TRANSFER → cả inflow và outflow đều có
     */
    const operatingActivities = this.categorizeTransactions(
      transactions,
      "operating"
    );
    const investingActivities = this.categorizeTransactions(
      transactions,
      "investing"
    );
    const financingActivities = this.categorizeTransactions(
      transactions,
      "financing"
    );

    /**
     * Bước 6: Tính net change = inflow - outflow cho từng category.
     */
    const operatingNet = this.sumNet(operatingActivities);
    const investingNet = this.sumNet(investingActivities);
    const financingNet = this.sumNet(financingActivities);
    const netChange = operatingNet + investingNet + financingNet;

    /**
     * Bước 7: Tính previous period (nếu được yêu cầu).
     */
    let previousPeriod: CashFlowReport["previousPeriod"];

    if (compareWithPrevious) {
      const periodLength = dateTo.getTime() - dateFrom.getTime();
      const prevDateFrom = new Date(dateFrom.getTime() - periodLength);
      const prevDateTo = new Date(dateFrom.getTime() - 1);

      const prevResult = await this.getCashFlowTotalsOnly(
        organizationId,
        prevDateFrom,
        prevDateTo,
        currency
      );

      previousPeriod = {
        closingBalance: prevResult.closingBalance,
        netChange: prevResult.netChange,
      };
    }

    /**
     * Bước 8: Trả về Cash Flow report.
     */
    return {
      period: {
        start: dateFrom.toISOString(),
        end: dateTo.toISOString(),
        label: this.formatPeriodLabel(dateFrom, dateTo),
      },
      currency,
      openingBalance: openingBalance.toFixed(4),
      operatingActivities: {
        items: operatingActivities,
        totalInflow: this.sumInflow(operatingActivities).toFixed(4),
        totalOutflow: this.sumOutflow(operatingActivities).toFixed(4),
        netCashflow: operatingNet.toFixed(4),
      },
      investingActivities: {
        items: investingActivities,
        totalInflow: this.sumInflow(investingActivities).toFixed(4),
        totalOutflow: this.sumOutflow(investingActivities).toFixed(4),
        netCashflow: investingNet.toFixed(4),
      },
      financingActivities: {
        items: financingActivities,
        totalInflow: this.sumInflow(financingActivities).toFixed(4),
        totalOutflow: this.sumOutflow(financingActivities).toFixed(4),
        netCashflow: financingNet.toFixed(4),
      },
      closingBalance: closingBalance.toFixed(4),
      netChange: netChange.toFixed(4),
      ...(previousPeriod ? { previousPeriod } : {}),
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BALANCE SHEET
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Lấy báo cáo cân đối kế toán tại một thời điểm.
   *
   * @param organizationId - ID của tổ chức
   * @param asOfDate       - Ngày đối soát (tất cả txns <= asOfDate được tính)
   * @param currency       - Mã tiền tệ
   * @param compareWithPrevious - Có so sánh với cùng kỳ năm trước không
   *
   * @returns BalanceSheetReport — Assets, Liabilities, Equity, validation
   *
   * Nguyên tắc cân bằng (Accounting Equation):
   *   TOTAL ASSETS = TOTAL LIABILITIES + TOTAL EQUITY
   *
   * Validation:
   *   Báo cáo hợp lệ khi |Assets - (Liabilities + Equity)| < 0.0001
   *   (sai số cho phép do Decimal precision)
   *
   * Cấu trúc hierarchy:
   *   Parent account (có children) → amount = sum of children
   *   Leaf account (không có children) → amount = calculated from journal entries
   */
  async getBalanceSheetReport(
    organizationId: string,
    asOfDate: Date,
    currency: string = "VND",
    compareWithPrevious: boolean = false
  ): Promise<BalanceSheetReport> {
    /**
     * Bước 1: Lấy tất cả accounts (ASSET, LIABILITY, EQUITY).
     * Include children để build hierarchical structure.
     */
    const accounts = await this.prisma.account.findMany({
      where: {
        organizationId,
        currency,
        isActive: true,
        type: { in: ["ASSET", "LIABILITY", "EQUITY"] },
      },
      include: {
        // Lấy children accounts (sub-accounts)
        children: {
          where: { isActive: true },
        },
      },
      orderBy: { code: "asc" },
    });

    /**
     * Bước 2: Lấy tất cả approved transactions đến asOfDate.
     * Chỉ APPROVED transactions được tính vào balance sheet.
     */
    const allTransactions = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        currency,
        status: "APPROVED",
        date: { lte: asOfDate },
      },
      include: {
        journalEntries: { include: { account: true } },
      },
    });

    /**
     * Bước 3: Phân loại accounts theo type.
     */
    const assetAccounts = accounts.filter((a: { type: string }) => a.type === "ASSET") as ReadonlyArray<{ id: string; code: string; name: string; type: "ASSET"; children: ReadonlyArray<{ id: string; code: string; name: string; type: "ASSET" }> }>;
    const liabilityAccounts = accounts.filter((a: { type: string }) => a.type === "LIABILITY") as ReadonlyArray<{ id: string; code: string; name: string; type: "LIABILITY"; children: ReadonlyArray<{ id: string; code: string; name: string; type: "LIABILITY" }> }>;
    const equityAccounts = accounts.filter((a: { type: string }) => a.type === "EQUITY") as ReadonlyArray<{ id: string; code: string; name: string; type: "EQUITY"; children: ReadonlyArray<{ id: string; code: string; name: string; type: "EQUITY" }> }>;

    /**
     * Bước 4: Build balance sheet items cho từng section.
     * Quy tắc double-entry:
     *   ASSET:     amount = sum(debit) - sum(credit)
     *   LIABILITY: amount = sum(credit) - sum(debit)
     *   EQUITY:    amount = sum(credit) - sum(debit)
     */
    const assetItems = this.buildBalanceSheetItems(
      assetAccounts,
      allTransactions,
      "ASSET"
    );
    const liabilityItems = this.buildBalanceSheetItems(
      liabilityAccounts,
      allTransactions,
      "LIABILITY"
    );
    const equityItems = this.buildBalanceSheetItems(
      equityAccounts,
      allTransactions,
      "EQUITY"
    );

    /**
     * Bước 5: Tính tổng từng section.
     */
    const totalAssets = assetItems.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );
    const totalLiabilities = liabilityItems.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );
    const totalEquity = equityItems.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );

    /**
     * Bước 6: Validate balance sheet equation.
     * Tài sản = Nợ phải trả + Vốn chủ sở hữu
     */
    const difference = Math.abs(totalAssets - (totalLiabilities + totalEquity));
    const isBalanced = difference < 0.0001;

    /**
     * Bước 7: Tính previous period (cùng kỳ năm trước).
     */
    let previousPeriod: BalanceSheetReport["previousPeriod"];

    if (compareWithPrevious) {
      // Lùi 1 năm để so sánh cùng kỳ
      const prevDate = new Date(asOfDate);
      prevDate.setFullYear(prevDate.getFullYear() - 1);

      previousPeriod = await this.getBalanceSheetTotalsOnly(
        organizationId,
        prevDate,
        currency
      );
    }

    /**
     * Bước 8: Trả về Balance Sheet report.
     */
    return {
      asOfDate: asOfDate.toISOString(),
      currency,
      assets: { items: assetItems, total: totalAssets.toFixed(4) },
      liabilities: { items: liabilityItems, total: totalLiabilities.toFixed(4) },
      equity: { items: equityItems, total: totalEquity.toFixed(4) },
      totals: {
        totalAssets: totalAssets.toFixed(4),
        totalLiabilities: totalLiabilities.toFixed(4),
        totalEquity: totalEquity.toFixed(4),
      },
      validation: {
        isBalanced,
        difference: difference.toFixed(4),
      },
      ...(previousPeriod ? { previousPeriod } : {}),
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS — P&L
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Build P&L section từ journal entries.
   *
   * @param journalEntries - Tất cả entries trong kỳ (đã filter theo date/status)
   * @param accounts       - Accounts thuộc section này
   * @param section        - Section name (revenue, costOfSales, operatingExpenses)
   *
   * @returns Array<PnlLineItem> — mỗi account tạo một line item
   *
   * Quy tắc:
   *   REVENUE account: amount = sum(credit entries)
   *   EXPENSE account: amount = sum(debit entries)
   */
  private buildPnlSection(
    journalEntries: ReadonlyArray<{
      debit: Decimal;
      credit: Decimal;
      account: { id: string; code: string; name: string; type: AccountType };
    }>,
    accounts: ReadonlyArray<{
      id: string;
      code: string;
      name: string;
      type: AccountType;
    }>,
    section: PnlSection
  ): PnlLineItem[] {
    return accounts.map((account: {
      id: string;
      code: string;
      name: string;
      type: AccountType;
    }) => {
      // Lọc entries thuộc account này
      const entries = journalEntries.filter(
        (e: { account: { id: string } }) => e.account.id === account.id
      );

      // Tính tổng debit và credit
      const totalCredit = entries.reduce(
        (sum: number, e: { credit: Decimal }) =>
          sum + parseFloat(e.credit.toString()),
        0
      );
      const totalDebit = entries.reduce(
        (sum: number, e: { debit: Decimal }) =>
          sum + parseFloat(e.debit.toString()),
        0
      );

      // Quy tắc double-entry: REVENUE → credit, EXPENSE → debit
      const amount =
        account.type === "REVENUE"
          ? totalCredit.toFixed(4)
          : totalDebit.toFixed(4);

      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        section,
        amount,
      };
    });
  }

  /**
   * Tính tổng P&L cho kỳ trước (chỉ trả về totals, không có line items).
   * Dùng cho so sánh với kỳ trước (compareWithPrevious).
   */
  private async getPnlTotalsOnly(
    orgId: string,
    dateFrom: Date,
    dateTo: Date,
    currency: string
  ): Promise<{ revenue: string; expenses: string; netProfit: string }> {
    const entries = await this.prisma.journalEntry.findMany({
      where: {
        account: { organizationId: orgId, currency, isActive: true },
        transaction: { date: { gte: dateFrom, lte: dateTo }, status: "APPROVED" },
      },
      include: { account: true },
    });

    const revenue = entries
      .filter((e) => e.account.type === "REVENUE")
      .reduce(
        (sum: number, e) => sum + parseFloat(e.credit.toString()),
        0
      );

    const expenses = entries
      .filter((e) => e.account.type === "EXPENSE")
      .reduce(
        (sum: number, e) => sum + parseFloat(e.debit.toString()),
        0
      );

    return {
      revenue: revenue.toFixed(4),
      expenses: expenses.toFixed(4),
      netProfit: (revenue - expenses).toFixed(4),
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS — CASH FLOW
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Tính balance của ASSET accounts từ danh sách transactions.
   *
   * ASSET: debit (+) increases, credit (-) decreases
   * balance = sum(debit) - sum(credit) cho mỗi ASSET account
   *
   * @param transactions - Danh sách transactions (đã include journalEntries)
   * @param accounts     - ASSET accounts cần tính balance
   */
  private calculateAssetBalance(
    transactions: ReadonlyArray<{
      journalEntries: ReadonlyArray<{
        account: { id: string };
        debit: Decimal;
        credit: Decimal;
      }>;
    }>,
    accounts: ReadonlyArray<{ id: string }>
  ): number {
    const accountIds = new Set(accounts.map((a) => a.id));

    return transactions.reduce((balance, txn) => {
      return (
        balance +
        txn.journalEntries
          .filter((e) => accountIds.has(e.account.id))
          .reduce((sum, e) => {
            const debit = parseFloat(e.debit.toString());
            const credit = parseFloat(e.credit.toString());
            // ASSET: debit (+) increases, credit (-) decreases
            return sum + debit - credit;
          }, 0)
      );
    }, 0);
  }

  /**
   * Phân loại transactions theo Cash Flow category.
   *
   * @param transactions - Transactions trong kỳ
   * @param category     - operating | investing | financing
   *
   * @returns Array<CashFlowLineItem> — danh sách dòng tiền
   *
   * Quy tắc phân loại:
   *   operating:
   *     INCOME → inflow (credit > 0 → inflow = credit)
   *     EXPENSE → outflow (debit > 0 → outflow = debit)
   *   investing: always empty (chưa implement)
   *   financing:
   *     TRANSFER → cả inflow và outflow (moves between accounts)
   */
  private categorizeTransactions(
    transactions: ReadonlyArray<{
      id: string;
      reference: string;
      date: Date;
      description: string | null;
      type: string;
      journalEntries: ReadonlyArray<{
        account: { code: string; name: string };
        debit: Decimal;
        credit: Decimal;
      }>;
    }>,
    category: CashFlowCategory
  ): CashFlowLineItem[] {
    return transactions
      .filter((t) => {
        if (category === "operating") return t.type !== "TRANSFER";
        if (category === "investing") return false;
        if (category === "financing") return t.type === "TRANSFER";
        return false;
      })
      .flatMap((t) =>
        t.journalEntries
          .filter((e) => {
            const debit = parseFloat(e.debit.toString());
            const credit = parseFloat(e.credit.toString());

            if (category === "operating") {
              // INCOME → credit is inflow; EXPENSE → debit is outflow
              return t.type === "INCOME" ? credit > 0 : debit > 0;
            }

            // financing: any non-zero entry
            return credit > 0 || debit > 0;
          })
          .map((e) => ({
            transactionId: t.id,
            reference: t.reference,
            date: t.date.toISOString(),
            description: t.description,
            category,
            accountCode: e.account.code,
            accountName: e.account.name,
            inflow:
              category === "operating" && t.type === "INCOME"
                ? parseFloat(e.credit.toString()).toFixed(4)
                : "0",
            outflow:
              category === "operating" && t.type === "EXPENSE"
                ? parseFloat(e.debit.toString()).toFixed(4)
                : "0",
          }))
      );
  }

  /**
   * Tính tổng Cash Flow cho kỳ trước.
   */
  private async getCashFlowTotalsOnly(
    orgId: string,
    dateFrom: Date,
    dateTo: Date,
    currency: string
  ): Promise<{ closingBalance: string; netChange: string }> {
    const txns = await this.prisma.transaction.findMany({
      where: {
        organizationId: orgId,
        currency,
        status: "APPROVED",
        date: { gte: dateFrom, lte: dateTo },
      },
      include: { journalEntries: { include: { account: true } } },
    });

    const accounts = await this.prisma.account.findMany({
      where: { organizationId: orgId, currency, isActive: true, type: "ASSET" },
    });

    const balance = this.calculateAssetBalance(txns, accounts);

    return {
      closingBalance: balance.toFixed(4),
      netChange: balance.toFixed(4),
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS — BALANCE SHEET
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Build balance sheet items cho một section (ASSET/LIABILITY/EQUITY).
   *
   * @param accounts     - Accounts thuộc section
   * @param transactions - Tất cả transactions đến asOfDate
   * @param type         - ASSET | LIABILITY | EQUITY
   *
   * @returns Array<BalanceSheetLineItem> — có hierarchy nếu có children
   *
   * Nguyên tắc double-entry:
   *   ASSET:     amount = sum(debit) - sum(credit)
   *   LIABILITY: amount = sum(credit) - sum(debit)
   *   EQUITY:    amount = sum(credit) - sum(debit)
   *
   * Hierarchy:
   *   Parent account (có children): amount = sum of children amounts
   *   Leaf account (không children): amount = calculated from journal entries
   */
  private buildBalanceSheetItems(
    accounts: ReadonlyArray<{
      id: string;
      code: string;
      name: string;
      type: "ASSET" | "LIABILITY" | "EQUITY";
      children: ReadonlyArray<{
        id: string;
        code: string;
        name: string;
        type: "ASSET" | "LIABILITY" | "EQUITY";
      }>;
    }>,
    transactions: ReadonlyArray<{
      journalEntries: ReadonlyArray<{
        account: { id: string; code: string; name: string };
        debit: Decimal;
        credit: Decimal;
      }>;
    }>,
    type: "ASSET" | "LIABILITY" | "EQUITY"
  ): BalanceSheetLineItem[] {
    return accounts.map((account) => {
      // Lọc journal entries thuộc account này
      const entries = transactions.flatMap((t) =>
        t.journalEntries.filter((e) => e.account.id === account.id)
      );

      // Tính tổng debit và credit
      const totalDebit = entries.reduce(
        (sum: number, e: { debit: Decimal }) =>
          sum + parseFloat(e.debit.toString()),
        0
      );
      const totalCredit = entries.reduce(
        (sum: number, e: { credit: Decimal }) =>
          sum + parseFloat(e.credit.toString()),
        0
      );

      // Tính amount theo double-entry rule
      const amount =
        type === "ASSET"
          ? (totalDebit - totalCredit).toFixed(4)
          : (totalCredit - totalDebit).toFixed(4);

      /**
       * Xây dựng children nếu account có sub-accounts.
       * isTotal = true khi account không có children
       * (parent account luôn là total = sum of children).
       */
      const children: BalanceSheetLineItem[] = account.children.map(
        (child) => {
          const childEntries = transactions.flatMap((t) =>
            t.journalEntries.filter((e) => e.account.id === child.id)
          );
          const childDebit = childEntries.reduce(
            (sum: number, e: { debit: Decimal }) =>
              sum + parseFloat(e.debit.toString()),
            0
          );
          const childCredit = childEntries.reduce(
            (sum: number, e: { credit: Decimal }) =>
              sum + parseFloat(e.credit.toString()),
            0
          );

          return {
            accountId: child.id,
            accountCode: child.code,
            accountName: child.name,
            type: child.type,
            amount:
              type === "ASSET"
                ? (childDebit - childCredit).toFixed(4)
                : (childCredit - childDebit).toFixed(4),
            isTotal: false,
          } satisfies BalanceSheetLineItem;
        }
      );

      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        type,
        amount,
        isTotal: account.children.length === 0,
        ...(children.length > 0 ? { children } : {}),
      } satisfies BalanceSheetLineItem;
    });
  }

  /**
   * Tính tổng Balance Sheet cho kỳ trước.
   * Chỉ trả về totals (không có line items).
   */
  private async getBalanceSheetTotalsOnly(
    orgId: string,
    asOfDate: Date,
    currency: string
  ): Promise<{
    totalAssets: string;
    totalLiabilities: string;
    totalEquity: string;
  }> {
    const txns = await this.prisma.transaction.findMany({
      where: {
        organizationId: orgId,
        currency,
        status: "APPROVED",
        date: { lte: asOfDate },
      },
      include: { journalEntries: { include: { account: true } } },
    });

    const accounts = await this.prisma.account.findMany({
      where: { organizationId: orgId, currency, isActive: true },
    });

    const assetAccounts = accounts.filter((a: { type: string }) => a.type === "ASSET");
    const liabilityAccounts = accounts.filter((a: { type: string }) => a.type === "LIABILITY");
    const equityAccounts = accounts.filter((a: { type: string }) => a.type === "EQUITY");

    /**
     * Hàm tính tổng balance của một nhóm accounts.
     * ASSET: debit - credit; LIABILITY/EQUITY: credit - debit
     */
    const calcTotal = (
      acctList: ReadonlyArray<{ id: string; type: AccountType }>
    ): number =>
      acctList.reduce((sum: number, acct: { id: string; type: AccountType }) => {
        const entries = txns.flatMap((t) =>
          t.journalEntries.filter(
            (e: { account: { id: string } }) => e.account.id === acct.id
          )
        );
        const debit = entries.reduce(
          (s: number, e: { debit: Decimal }) => s + parseFloat(e.debit.toString()),
          0
        );
        const credit = entries.reduce(
          (s: number, e: { credit: Decimal }) =>
            s + parseFloat(e.credit.toString()),
          0
        );
        // ASSET: debit - credit; LIABILITY/EQUITY: credit - debit
        return sum + (acct.type === "ASSET" ? debit - credit : credit - debit);
      }, 0);

    return {
      totalAssets: calcTotal(assetAccounts).toFixed(4),
      totalLiabilities: Math.abs(calcTotal(liabilityAccounts)).toFixed(4),
      totalEquity: Math.abs(calcTotal(equityAccounts)).toFixed(4),
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS — SHARED
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Tính net cash flow = inflow - outflow.
   */
  private sumNet(items: CashFlowLineItem[]): number {
    const inflow = items.reduce(
      (sum, item) => sum + parseFloat(item.inflow),
      0
    );
    const outflow = items.reduce(
      (sum, item) => sum + parseFloat(item.outflow),
      0
    );
    return inflow - outflow;
  }

  /** Tính tổng inflow. */
  private sumInflow(items: CashFlowLineItem[]): number {
    return items.reduce((sum, item) => sum + parseFloat(item.inflow), 0);
  }

  /** Tính tổng outflow. */
  private sumOutflow(items: CashFlowLineItem[]): number {
    return items.reduce((sum, item) => sum + parseFloat(item.outflow), 0);
  }

  /**
   * Format khoảng thời gian thành nhãn locale (VD: "01/01/2026 - 31/01/2026").
   * Dùng Intl.DateTimeFormat với locale "vi-VN" cho thị trường Việt Nam.
   */
  private formatPeriodLabel(dateFrom: Date, dateTo: Date): string {
    const fmt = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${fmt.format(dateFrom)} - ${fmt.format(dateTo)}`;
  }
}
