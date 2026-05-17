/**
 * ============================================================================
 * EXPORT UTILITIES — Client-side CSV/PDF/JSON export
 * ============================================================================
 *
 * Task 6: Reports & Export
 *
 * Các hàm tiện ích để export báo cáo ra client-side.
 * Không dùng thư viện bên ngoài — chỉ dùng browser APIs (Blob, URL, print).
 *
 * Export formats:
 *   CSV  - Plain text comma-separated values → download
 *   PDF  - Trigger window.print() với print-optimized styles
 *   JSON - Pretty-printed JSON → download
 *
 * Nguyên tắc:
 *   - Tất cả hàm nhận typed report data (PnlReport | CashFlowReport | BalanceSheetReport)
 *   - CSV escape theo RFC 4180: wrap quotes, escape quotes, handle newlines
 *   - PDF dùng browser print dialog (window.print())
 *
 * ============================================================================
 */

import type {
  PnlReport,
  CashFlowReport,
  BalanceSheetReport,
  ReportFormat,
} from "../types/report.types";

// ─── CSV Export ───────────────────────────────────────────────────────────────

/**
 * Escape giá trị CSV theo RFC 4180.
 *
 * Quy tắc:
 *   1. Nếu giá trị chứa: dấu phẩy (,), dấu nháy ("), hoặc xuống dòng (\n)
 *      → wrap trong double quotes
 *   2. Double quotes bên trong → escape bằng double quotes kép (" → "")
 *   3. Ngược lại → trả về nguyên giá trị
 *
 * @param value - Giá trị cần escape
 *
 * @example
 *   csvEscape("Hello, World") → `"Hello, World"`
 *   csvEscape(`Say "Hi"`)     → `"Say ""Hi"""`
 *   csvEscape("Line1\nLine2") → `"Line1\nLine2"`
 */
function csvEscape(value: string | number | boolean | null | undefined): string {
  const str = value == null ? "" : String(value);

  // Check: có cần wrap không?
  const needsQuotes =
    str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r");

  if (!needsQuotes) {
    return str;
  }

  // Escape: wrap + double quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Convert P&L report thành CSV string.
 *
 * @param report - PnlReport data
 *
 * Format:
 *   P&L Report
 *   Period,<label>
 *   Currency,<currency>
 *   [blank]
 *   Account Code,Account Name,Section,Amount
 *   4000,Sales Revenue,revenue,10000000.0000
 *   ...
 *   Gross Profit,,,8000000.0000 (80.00%)
 *   ...
 */
export function exportToCsv(report: PnlReport): string {
  const lines: string[] = [];

  // Header
  lines.push("P&L Report");
  lines.push(`Period,${csvEscape(report.period.label)}`);
  lines.push(`Currency,${csvEscape(report.currency)}`);
  lines.push(""); // blank line

  // Column headers
  lines.push(
    ["Account Code", "Account Name", "Section", "Amount", "% of Revenue"].join(
      ","
    )
  );

  // Revenue rows
  for (const item of report.revenue) {
    lines.push(
      [
        csvEscape(item.accountCode),
        csvEscape(item.accountName),
        csvEscape(item.section),
        csvEscape(item.amount),
        csvEscape(item.percentageOfRevenue ?? ""),
      ].join(",")
    );
  }

  // Cost of Sales
  lines.push(""); // blank
  for (const item of report.costOfSales) {
    lines.push(
      [
        csvEscape(item.accountCode),
        csvEscape(item.accountName),
        csvEscape(item.section),
        csvEscape(item.amount),
        csvEscape(""),
      ].join(",")
    );
  }

  // Gross Profit
  lines.push(
    [
      csvEscape(""),
      csvEscape("Gross Profit"),
      csvEscape(""),
      csvEscape(report.grossProfit.amount),
      csvEscape(report.grossProfit.margin),
    ].join(",")
  );

  // Operating Expenses
  lines.push(""); // blank
  for (const item of report.operatingExpenses) {
    lines.push(
      [
        csvEscape(item.accountCode),
        csvEscape(item.accountName),
        csvEscape(item.section),
        csvEscape(item.amount),
        csvEscape(item.percentageOfRevenue ?? ""),
      ].join(",")
    );
  }

  // Operating Profit
  lines.push(
    [
      csvEscape(""),
      csvEscape("Operating Profit"),
      csvEscape(""),
      csvEscape(report.operatingProfit.amount),
      csvEscape(report.operatingProfit.margin),
    ].join(",")
  );

  // Net Profit
  lines.push(
    [
      csvEscape(""),
      csvEscape("Net Profit"),
      csvEscape(""),
      csvEscape(report.netProfit.amount),
      csvEscape(report.netProfit.margin),
    ].join(",")
  );

  return lines.join("\n");
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

/**
 * Trigger browser print dialog cho PDF export.
 *
 * Cách hoạt động:
 *   1. Mở cửa sổ mới (window.open)
 *   2. Viết HTML với print-optimized CSS vào document
 *   3. Gọi window.print() trên cửa sổ mới
 *   4. User chọn "Save as PDF" trong print dialog
 *
 * @param report    - Report data (sẽ JSON stringify vào HTML)
 * @param reportType - "pnl" | "cash-flow" | "balance-sheet"
 *
 * @note Đây là soft-PDF: không tạo PDF thực sự trên server.
 *       User cần chọn "Save as PDF" trong browser print dialog.
 */
export function exportToPdf(
  report: PnlReport | CashFlowReport | BalanceSheetReport,
  reportType: "pnl" | "cash-flow" | "balance-sheet"
): void {
  const title =
    reportType === "pnl"
      ? "Báo cáo P&L"
      : reportType === "cash-flow"
      ? "Báo cáo Lưu chuyển tiền tệ"
      : "Báo cáo Cân đối kế toán";

  const jsonData = JSON.stringify(report, null, 2);

  /**
   * HTML template cho cửa sổ print.
   * - @media print: ẩn header/footer browser, fit to page
   * - font: serif cho numbers để dễ đọc
   * - pre: format JSON cho debug
   */
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @media print {
      @page { margin: 1cm; size: A4 portrait; }
      body { font-family: "Times New Roman", serif; font-size: 11pt; }
    }
    body { font-family: "Times New Roman", serif; padding: 20px; }
    h1 { font-size: 18pt; margin-bottom: 4px; }
    .subtitle { color: #666; margin-bottom: 20px; }
    pre { white-space: pre-wrap; word-break: break-word; }
    .watermark { position: fixed; bottom: 10px; right: 10px; color: #ccc; font-size: 9pt; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="subtitle">Generated: ${new Date().toLocaleString("vi-VN")}</p>
  <pre>${jsonData}</pre>
  <p class="watermark">Tokens_taken — ${reportType}</p>
  <script>
    // Auto-print sau khi DOM loaded
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  // Mở cửa sổ mới và viết HTML
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) {
    alert(
      "Popup bị chặn. Vui lòng cho phép popup cho trang này và thử lại."
    );
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
}

// ─── Download Helper ───────────────────────────────────────────────────────────

/**
 * Trigger browser download cho một Blob.
 *
 * @param content   - Nội dung file (string hoặc Blob)
 * @param filename  - Tên file (VD: "pnl-jan-2026.csv")
 * @param mimeType  - MIME type (VD: "text/csv", "application/json")
 */
function downloadBlob(
  content: string | Blob,
  filename: string,
  mimeType: string
): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  // Cleanup sau khi click trigger xong
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ─── Main Export Function ─────────────────────────────────────────────────────

/**
 * Main export function — gọi từ component.
 *
 * @param report    - Report data (P&L, Cash Flow, hoặc Balance Sheet)
 * @param reportType - "pnl" | "cash-flow" | "balance-sheet"
 * @param format    - "csv" | "pdf" | "json"
 *
 * @example
 *   downloadReport(pnlData, "pnl", "csv"); // → tải pnl-report.csv
 *   downloadReport(cfData, "cash-flow", "pdf"); // → mở print dialog
 *   downloadReport(bsData, "balance-sheet", "json"); // → tải JSON file
 */
export function downloadReport(
  report: PnlReport | CashFlowReport | BalanceSheetReport,
  reportType: "pnl" | "cash-flow" | "balance-sheet",
  format: ReportFormat
): void {
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${reportType}-report-${timestamp}`;

  switch (format) {
    case "csv": {
      const csv =
        reportType === "pnl"
          ? exportToCsv(report as PnlReport)
          : JSON.stringify(report, null, 2); // fallback: JSON for non-P&L
      downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8");
      break;
    }

    case "pdf": {
      exportToPdf(report, reportType);
      break;
    }

    case "json": {
      const json = JSON.stringify(report, null, 2);
      downloadBlob(json, `${filename}.json`, "application/json");
      break;
    }
  }
}
