/**
 * ============================================================================
 * EXPORT UTILITIES — Unit Tests
 * ============================================================================
 *
 * Task 6: Reports & Export
 *
 * Test coverage:
 *   1. exportToCsv: P&L → valid CSV string với proper escaping
 *   2. downloadReport: trigger CSV/PDF/JSON download (mocked)
 *   3. CSV escaping: quotes, commas, newlines được escape đúng cách
 *
 * Approach:
 *   - Unit tests cho pure functions (exportToCsv)
 *   - Mocked browser APIs (window.open, URL.createObjectURL, etc.)
 *   - Vitest framework
 *
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadReport, exportToCsv } from "./export.utils";
import type { PnlReport, CashFlowReport, BalanceSheetReport } from "../types/report.types";

// ─── Browser API Mocks ────────────────────────────────────────────────────────

/**
 * Mock window.open và URL.createObjectURL.
 * Vitest không có DOM environment mặc định → cần mock tất cả browser APIs.
 *
 * Mock strategy:
 *   window.open → trả về mockWindow
 *   URL.createObjectURL → trả về "blob:mock-url"
 *   document.createElement → tracking created elements
 */
const createdElements: { href: string; download: string }[] = [];

const mockWindow = {
  open: vi.fn(
    () =>
      ({
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
        focus: vi.fn(),
        print: vi.fn(),
      }) as unknown as Window
  ),
};

const mockURL = {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
};

// Stub global browser APIs
vi.stubGlobal("window", mockWindow);
vi.stubGlobal("URL", mockURL);

beforeEach(() => {
  // Reset mocks trước mỗi test
  createdElements.length = 0;
  vi.clearAllMocks();

  // Stub document.createElement để track anchor creation
  vi.stubGlobal(
    "document", {
      createElement: vi.fn((tagName: string) => {
        if (tagName === "a") {
          const el = {
            href: "",
            download: "",
            style: { display: "none" },
            appendChild: vi.fn(),
            removeChild: vi.fn(),
            click: vi.fn(() => {
              createdElements.push({
                href: (el as { href: string }).href,
                download: (el as { download: string }).download,
              });
            }),
          };
          return el;
        }
        return {};
      }),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    } as unknown as Document
  );
});

// ─── Test Data Factory ────────────────────────────────────────────────────────

/** Tạo mock P&L report — dùng chung cho nhiều tests. */
function createMockPnlReport(): PnlReport {
  return {
    period: {
      start: "2026-01-01T00:00:00.000Z",
      end: "2026-01-31T23:59:59.999Z",
      label: "01/01/2026 - 31/01/2026",
    },
    currency: "VND",
    revenue: [
      {
        accountId: "acc_revenue_1",
        accountCode: "4000",
        accountName: "Doanh thu bán hàng",
        section: "revenue",
        amount: "10000000.0000",
        percentageOfRevenue: "100.00%",
      },
      {
        accountId: "acc_revenue_2",
        accountCode: "4100",
        accountName: "Doanh thu dịch vụ",
        section: "revenue",
        amount: "5000000.0000",
        percentageOfRevenue: "50.00%",
      },
    ],
    costOfSales: [
      {
        accountId: "acc_cos_1",
        accountCode: "5000",
        accountName: "Giá vốn hàng bán",
        section: "costOfSales",
        amount: "7000000.0000",
      },
    ],
    grossProfit: {
      amount: "8000000.0000",
      margin: "53.33%",
    },
    operatingExpenses: [
      {
        accountId: "acc_opex_1",
        accountCode: "5100",
        accountName: "Chi phí bán hàng",
        section: "operatingExpenses",
        amount: "1000000.0000",
        percentageOfRevenue: "10.00%",
      },
    ],
    operatingProfit: {
      amount: "7000000.0000",
      margin: "46.67%",
    },
    otherIncome: [],
    otherExpenses: [],
    netProfit: {
      amount: "7000000.0000",
      margin: "46.67%",
    },
    totals: {
      totalRevenue: "15000000.0000",
      totalExpenses: "8000000.0000",
      netProfit: "7000000.0000",
    },
    previousPeriod: {
      revenue: "12000000.0000",
      expenses: "7000000.0000",
      netProfit: "5000000.0000",
    },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("exportToCsv", () => {
  it("should generate valid CSV string with headers", () => {
    const report = createMockPnlReport();
    const csv = exportToCsv(report);

    // Header row
    expect(csv).toContain("P&L Report");
    // Period row
    expect(csv).toContain("Period");
    expect(csv).toContain("01/01/2026 - 31/01/2026");
    // Currency row
    expect(csv).toContain("Currency");
    expect(csv).toContain("VND");
  });

  it("should include all revenue line items with correct values", () => {
    const report = createMockPnlReport();
    const csv = exportToCsv(report);

    // Revenue accounts
    expect(csv).toContain("4000");
    expect(csv).toContain("Doanh thu bán hàng");
    expect(csv).toContain("10000000.0000");

    expect(csv).toContain("4100");
    expect(csv).toContain("Doanh thu dịch vụ");
    expect(csv).toContain("5000000.0000");
  });

  it("should include gross profit row", () => {
    const report = createMockPnlReport();
    const csv = exportToCsv(report);

    expect(csv).toContain("Gross Profit");
    expect(csv).toContain("8000000.0000");
    expect(csv).toContain("53.33%");
  });

  it("should include operating profit row", () => {
    const report = createMockPnlReport();
    const csv = exportToCsv(report);

    expect(csv).toContain("Operating Profit");
    expect(csv).toContain("7000000.0000");
    expect(csv).toContain("46.67%");
  });

  it("should include net profit row", () => {
    const report = createMockPnlReport();
    const csv = exportToCsv(report);

    expect(csv).toContain("Net Profit");
    expect(csv).toContain("7000000.0000");
    expect(csv).toContain("46.67%");
  });

  it("should include column headers row", () => {
    const report = createMockPnlReport();
    const csv = exportToCsv(report);

    expect(csv).toContain("Account Code");
    expect(csv).toContain("Account Name");
    expect(csv).toContain("Section");
    expect(csv).toContain("Amount");
    expect(csv).toContain("% of Revenue");
  });
});

describe("CSV value escaping (RFC 4180)", () => {
  it("should wrap values containing commas in quotes", () => {
    // Create a report with account name containing comma
    const report = createMockPnlReport();
    report.revenue[0]!.accountName = "Sales, Revenue"; // comma in name

    const csv = exportToCsv(report);
    // Comma value should be wrapped in quotes
    expect(csv).toContain('"Sales, Revenue"');
  });

  it("should escape double quotes by doubling them", () => {
    const report = createMockPnlReport();
    report.revenue[0]!.accountName = 'Say "Hi" to "Boss"';

    const csv = exportToCsv(report);
    // Double quotes become doubled inside quotes: "Say ""Hi"" to ""Boss"""
    expect(csv).toContain('"Say ""Hi"" to ""Boss"""');
  });

  it("should handle empty revenue gracefully", () => {
    const report = createMockPnlReport();
    report.revenue = [];

    const csv = exportToCsv(report);
    // Should still have headers and sections
    expect(csv).toContain("P&L Report");
    expect(csv).toContain("Gross Profit");
  });
});

describe("downloadReport", () => {
  it("should trigger CSV download with correct filename", () => {
    const report = createMockPnlReport();
    downloadReport(report, "pnl", "csv");

    // Verify anchor was created with correct download attribute
    expect(createdElements.length).toBeGreaterThan(0);
    const anchor = createdElements[0]!;
    expect(anchor.download).toMatch(/^pnl-report-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it("should trigger JSON download with correct filename", () => {
    const report = createMockPnlReport();
    downloadReport(report, "pnl", "json");

    expect(createdElements.length).toBeGreaterThan(0);
    const anchor = createdElements[0]!;
    expect(anchor.download).toMatch(/^pnl-report-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it("should call window.open for PDF export (soft PDF)", () => {
    const report = createMockPnlReport();
    downloadReport(report, "pnl", "pdf");

    // window.open được gọi cho PDF (mở cửa sổ print)
    expect(mockWindow.open).toHaveBeenCalledWith(
      "",
      "_blank",
      "width=800,height=600"
    );
  });

  it("should use Blob URL for CSV download", () => {
    const report = createMockPnlReport();
    downloadReport(report, "pnl", "csv");

    expect(mockURL.createObjectURL).toHaveBeenCalled();
    expect(mockURL.revokeObjectURL).not.toHaveBeenCalled(); // cleanup async
  });
});

describe("downloadReport with CashFlowReport", () => {
  it("should generate JSON for cash-flow report (CSV fallback)", () => {
    const mockCfReport = {
      period: {
        start: "2026-01-01",
        end: "2026-01-31",
        label: "01/01/2026 - 31/01/2026",
      },
      currency: "VND",
      openingBalance: "1000000.0000",
      operatingActivities: {
        items: [],
        totalInflow: "5000000.0000",
        totalOutflow: "2000000.0000",
        netCashflow: "3000000.0000",
      },
      investingActivities: {
        items: [],
        totalInflow: "0.0000",
        totalOutflow: "0.0000",
        netCashflow: "0.0000",
      },
      financingActivities: {
        items: [],
        totalInflow: "0.0000",
        totalOutflow: "0.0000",
        netCashflow: "0.0000",
      },
      closingBalance: "4000000.0000",
      netChange: "3000000.0000",
    } satisfies CashFlowReport;

    downloadReport(mockCfReport, "cash-flow", "csv");

    expect(createdElements.length).toBeGreaterThan(0);
    expect(createdElements[0]!.download).toContain("cash-flow");
  });
});
