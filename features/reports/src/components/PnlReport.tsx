/**
 * ============================================================================
 * P&L REPORT COMPONENT — Profit & Loss Statement Display
 * ============================================================================
 *
 * Task 6: Reports & Export
 *
 * Component hiển thị báo cáo P&L dạng bảng.
 *
 * Cấu trúc P&L:
 *   Revenue                    ← tổng credit REVENUE accounts
 *   − Cost of Sales            ← tổng debit EXPENSE accounts (costOfSales)
 *   = Gross Profit             ← revenue - costOfSales
 *   − Operating Expenses       ← tổng debit EXPENSE accounts (operatingExpenses)
 *   = Operating Profit         ← grossProfit - operatingExpenses
 *   + Other Income             ← hiện tại luôn rỗng
 *   − Other Expenses           ← hiện tại luôn rỗng
 *   = Net Profit               ← operatingProfit + otherIncome - otherExpenses
 *
 * Props:
 *   report      - PnlReport data từ usePnlReport hook
 *   isLoading   - React Query loading state
 *   error       - React Query error
 *   onExport    - callback khi user click export button
 *   compareMode - hiển thị thêm cột so sánh với kỳ trước
 *
 * ============================================================================
 */

import type { PnlReport, PnlLineItem } from "../types/report.types";

/** Props interface cho PnlReport component. */
interface PnlReportProps {
  /** Dữ liệu P&L từ API. */
  report: PnlReport | undefined;
  /** Loading state từ React Query. */
  isLoading: boolean;
  /** Error từ React Query. */
  error: Error | null;
  /** Callback export — gọi khi user click nút export. */
  onExport: (format: "csv" | "pdf" | "json") => void;
  /** Có hiển thị cột so sánh với kỳ trước không. */
  compareMode?: boolean;
}

/**
 * Format số tiền thành display string.
 * VD: "12345678.0000" → "12,345,678.00" (VND)
 */
function formatMoney(amount: string, currency: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format percentage string.
 * VD: "25.50%" → "25.50%"
 */
function formatMargin(margin: string): string {
  return margin;
}

/**
 * Tính % của một line item so với tổng revenue.
 */
function calcPercentage(amount: string, totalRevenue: string): string {
  const num = parseFloat(amount);
  const total = parseFloat(totalRevenue);
  if (total === 0) return "0.00%";
  return ((num / total) * 100).toFixed(2) + "%";
}

/** Một dòng trong P&L table. */
function PnlRow({
  item,
  currency,
  totalRevenue,
  isHighlighted = false,
}: {
  item: PnlLineItem;
  currency: string;
  totalRevenue: string;
  isHighlighted?: boolean;
}) {
  const percentage = calcPercentage(item.amount, totalRevenue);

  return (
    <tr
      className={
        isHighlighted
          ? "bg-blue-50 font-semibold border-t-2 border-blue-200"
          : "border-b border-gray-100 hover:bg-gray-50"
      }
    >
      {/* Account Code */}
      <td className="px-4 py-2 text-sm text-gray-500 font-mono">
        {item.accountCode}
      </td>
      {/* Account Name */}
      <td className="px-4 py-2 text-sm text-gray-900">
        {item.accountName}
      </td>
      {/* Amount */}
      <td
        className={`px-4 py-2 text-sm text-right font-mono ${
          isHighlighted ? "text-blue-700" : "text-gray-900"
        }`}
      >
        {formatMoney(item.amount, currency)}
      </td>
      {/* % of Revenue */}
      <td className="px-4 py-2 text-sm text-right text-gray-500">
        {percentage}
      </td>
    </tr>
  );
}

/**
 * Dòng summary (Gross Profit, Operating Profit, Net Profit).
 * Khác với PnlRow: không có accountCode, có margin %.
 */
function SummaryRow({
  label,
  amount,
  margin,
  currency,
  bgClass,
}: {
  label: string;
  amount: string;
  margin: string;
  currency: string;
  bgClass: string;
}) {
  return (
    <tr className={`${bgClass} border-t-2 border-gray-300`}>
      <td className="px-4 py-3 text-sm font-semibold text-gray-700" colSpan={2}>
        {label}
      </td>
      <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-gray-900">
        {formatMoney(amount, currency)}
      </td>
      <td className="px-4 py-3 text-sm text-right text-gray-600">
        {margin}
      </td>
    </tr>
  );
}

/**
 * PnlReport — Main component.
 *
 * Hiển thị P&L statement với:
 *   - Revenue section
 *   - Cost of Sales → Gross Profit
 *   - Operating Expenses → Operating Profit
 *   - Net Profit
 *   - Export buttons (CSV, PDF, JSON)
 *   - Compare mode (so sánh với kỳ trước)
 */
export function PnlReport({
  report,
  isLoading,
  error,
  onExport,
  compareMode = false,
}: PnlReportProps) {
  // ── Loading State ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">Đang tải báo cáo P&L...</div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">
          Lỗi tải báo cáo: {error.message}
        </div>
      </div>
    );
  }

  // ── Empty State ───────────────────────────────────────────────────────────
  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Không có dữ liệu P&L</div>
      </div>
    );
  }

  const { currency, totals } = report;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Báo cáo P&L</h2>
          <p className="text-sm text-gray-500 mt-1">
            {report.period.label} · {currency}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onExport("csv")}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Xuất CSV
          </button>
          <button
            onClick={() => onExport("pdf")}
            className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            In PDF
          </button>
          <button
            onClick={() => onExport("json")}
            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            JSON
          </button>
        </div>
      </div>

      {/* ── P&L Table ───────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã TK
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên tài khoản
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                Số tiền
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                % Doanh thu
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* ── Revenue Section ──────────────────────────────────────── */}
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-4 py-2 font-semibold text-gray-700">
                I. Doanh thu
              </td>
            </tr>
            {report.revenue.map((item) => (
              <PnlRow
                key={item.accountId}
                item={item}
                currency={currency}
                totalRevenue={totals.totalRevenue}
              />
            ))}

            {/* ── Cost of Sales → Gross Profit ────────────────────────── */}
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-4 py-2 font-semibold text-gray-700">
                II. Giá vốn hàng bán
              </td>
            </tr>
            {report.costOfSales.map((item) => (
              <PnlRow
                key={item.accountId}
                item={item}
                currency={currency}
                totalRevenue={totals.totalRevenue}
              />
            ))}

            {/* Gross Profit */}
            <SummaryRow
              label="Lợi nhuận gộp (Gross Profit)"
              amount={report.grossProfit.amount}
              margin={report.grossProfit.margin}
              currency={currency}
              bgClass="bg-blue-50"
            />

            {/* ── Operating Expenses ──────────────────────────────────── */}
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-4 py-2 font-semibold text-gray-700">
                III. Chi phí hoạt động
              </td>
            </tr>
            {report.operatingExpenses.map((item) => (
              <PnlRow
                key={item.accountId}
                item={item}
                currency={currency}
                totalRevenue={totals.totalRevenue}
              />
            ))}

            {/* Operating Profit */}
            <SummaryRow
              label="Lợi nhuận hoạt động (Operating Profit)"
              amount={report.operatingProfit.amount}
              margin={report.operatingProfit.margin}
              currency={currency}
              bgClass="bg-blue-50"
            />

            {/* ── Net Profit ──────────────────────────────────────────── */}
            <SummaryRow
              label="Lợi nhuận ròng (Net Profit)"
              amount={report.netProfit.amount}
              margin={report.netProfit.margin}
              currency={currency}
              bgClass="bg-green-50"
            />

            {/* ── Compare with Previous Period ─────────────────────────── */}
            {compareMode && report.previousPeriod && (
              <>
                <tr className="bg-gray-100 font-semibold">
                  <td colSpan={4} className="px-4 py-2 text-gray-600">
                    So sánh với kỳ trước
                  </td>
                </tr>
                <tr className="border-b">
                  <td colSpan={2} className="px-4 py-2 text-sm text-gray-600">
                    Tổng doanh thu kỳ trước
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-gray-600 font-mono">
                    {formatMoney(report.previousPeriod.revenue, currency)}
                  </td>
                  <td></td>
                </tr>
                <tr className="border-b">
                  <td colSpan={2} className="px-4 py-2 text-sm text-gray-600">
                    Tổng chi phí kỳ trước
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-gray-600 font-mono">
                    {formatMoney(report.previousPeriod.expenses, currency)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-sm text-gray-600">
                    Lợi nhuận ròng kỳ trước
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-gray-600 font-mono">
                    {formatMoney(report.previousPeriod.netProfit, currency)}
                  </td>
                  <td></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Tổng doanh thu</p>
          <p className="text-lg font-semibold text-blue-700 mt-1">
            {formatMoney(totals.totalRevenue, currency)}
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Tổng chi phí</p>
          <p className="text-lg font-semibold text-red-700 mt-1">
            {formatMoney(totals.totalExpenses, currency)}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Lợi nhuận ròng</p>
          <p className="text-lg font-semibold text-green-700 mt-1">
            {formatMoney(totals.netProfit, currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
