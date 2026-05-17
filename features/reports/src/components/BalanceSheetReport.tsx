/**
 * ============================================================================
 * BALANCE SHEET COMPONENT — Statement of Financial Position Display
 * ============================================================================
 *
 * Task 6: Reports & Export
 *
 * Component hiển thị báo cáo cân đối kế toán.
 *
 * Nguyên tắc cân bằng:
 *   TOTAL ASSETS = TOTAL LIABILITIES + TOTAL EQUITY
 *
 * Cấu trúc:
 *   ASSETS (Tài sản): debit (+) increases
 *     - Current Assets (1000-1999)
 *     - Non-current Assets
 *   LIABILITIES (Nợ phải trả): credit (+) increases
 *     - Current Liabilities (2000-2999)
 *     - Non-current Liabilities
 *   EQUITY (Vốn chủ sở hữu): credit (+) increases
 *     - Share capital, retained earnings (3000-3999)
 *
 * Validation: isBalanced = true khi |A - (L+E)| < 0.0001
 *
 * Props:
 *   report      - BalanceSheetReport data
 *   isLoading   - React Query loading
 *   error       - React Query error
 *   onExport    - callback export
 *
 * ============================================================================
 */

import type { BalanceSheetReport, BalanceSheetLineItem } from "../types/report.types";

/** Props interface. */
interface BalanceSheetReportProps {
  report: BalanceSheetReport | undefined;
  isLoading: boolean;
  error: Error | null;
  onExport: (format: "csv" | "pdf" | "json") => void;
}

/** Format số tiền. */
function formatMoney(amount: string, currency: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Một dòng balance sheet item. */
function BalanceSheetRow({
  item,
  currency,
  isChild = false,
}: {
  item: BalanceSheetLineItem;
  currency: string;
  isChild?: boolean;
}) {
  return (
    <>
      <tr
        className={`${
          item.isTotal
            ? "bg-gray-50 font-semibold"
            : isChild
            ? "bg-white text-gray-500"
            : "hover:bg-gray-50"
        } border-b border-gray-100`}
      >
        {/* Account Code */}
        <td
          className={`px-4 py-2 text-sm font-mono ${
            isChild ? "pl-8 text-gray-400" : "text-gray-500"
          }`}
        >
          {isChild ? `  ${item.accountCode}` : item.accountCode}
        </td>
        {/* Account Name */}
        <td className={`px-4 py-2 text-sm ${isChild ? "text-gray-400" : "text-gray-900"}`}>
          {item.accountName}
        </td>
        {/* Amount */}
        <td
          className={`px-4 py-2 text-sm text-right font-mono ${
            item.isTotal ? "text-gray-900" : "text-gray-700"
          }`}
        >
          {formatMoney(item.amount, currency)}
        </td>
      </tr>
      {/* Children (sub-accounts) */}
      {item.children?.map((child) => (
        <BalanceSheetRow
          key={child.accountId}
          item={child}
          currency={currency}
          isChild={true}
        />
      ))}
    </>
  );
}

/**
 * BalanceSheetReport — Main component.
 *
 * Layout 2 cột:
 *   Left: ASSETS (Tài sản)
 *   Right: LIABILITIES + EQUITY (Nợ + Vốn)
 *
 * Footer: Validation banner + totals comparison
 */
export function BalanceSheetReport({
  report,
  isLoading,
  error,
  onExport,
}: BalanceSheetReportProps) {
  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">
          Đang tải báo cáo cân đối kế toán...
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Lỗi: {error.message}</div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Không có dữ liệu</div>
      </div>
    );
  }

  const { currency, validation, totals } = report;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Báo cáo Cân đối kế toán
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Đối soát ngày:{" "}
            {new Date(report.asOfDate).toLocaleDateString("vi-VN")} ·{" "}
            {currency}
          </p>
        </div>

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
        </div>
      </div>

      {/* ── Validation Banner ───────────────────────────────────────────── */}
      <div
        className={`rounded-lg p-4 flex items-center gap-3 ${
          validation.isBalanced
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        {validation.isBalanced ? (
          <span className="text-green-600 text-lg">✓</span>
        ) : (
          <span className="text-red-600 text-lg">⚠</span>
        )}
        <div>
          <p
            className={`text-sm font-semibold ${
              validation.isBalanced ? "text-green-700" : "text-red-700"
            }`}
          >
            {validation.isBalanced
              ? "Báo cáo cân bằng — Tài sản = Nợ phải trả + Vốn chủ sở hữu"
              : "Báo cáo KHÔNG cân bằng"}
          </p>
          {!validation.isBalanced && (
            <p className="text-xs text-red-600 mt-1">
              Hiệu số: {formatMoney(validation.difference, currency)}
            </p>
          )}
        </div>
      </div>

      {/* ── Two-Column Layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: ASSETS */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
            <h3 className="text-sm font-semibold text-blue-700 uppercase">
              I. Tài sản (ASSETS)
            </h3>
          </div>
          <table className="w-full">
            <tbody>
              {report.assets.items.map((item) => (
                <BalanceSheetRow
                  key={item.accountId}
                  item={item}
                  currency={currency}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 border-t-2 border-blue-300 font-semibold">
                <td className="px-4 py-3 text-sm" colSpan={2}>
                  Tổng Tài sản
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-blue-700">
                  {formatMoney(report.assets.total, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Right: LIABILITIES + EQUITY */}
        <div className="space-y-4">
          {/* LIABILITIES */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b border-red-200">
              <h3 className="text-sm font-semibold text-red-700 uppercase">
                II. Nợ phải trả (LIABILITIES)
              </h3>
            </div>
            <table className="w-full">
              <tbody>
                {report.liabilities.items.map((item) => (
                  <BalanceSheetRow
                    key={item.accountId}
                    item={item}
                    currency={currency}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-red-50 border-t-2 border-red-300 font-semibold">
                  <td className="px-4 py-3 text-sm" colSpan={2}>
                    Tổng Nợ phải trả
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-red-700">
                    {formatMoney(report.liabilities.total, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* EQUITY */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-green-50 px-4 py-3 border-b border-green-200">
              <h3 className="text-sm font-semibold text-green-700 uppercase">
                III. Vốn chủ sở hữu (EQUITY)
              </h3>
            </div>
            <table className="w-full">
              <tbody>
                {report.equity.items.map((item) => (
                  <BalanceSheetRow
                    key={item.accountId}
                    item={item}
                    currency={currency}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-50 border-t-2 border-green-300 font-semibold">
                  <td className="px-4 py-3 text-sm" colSpan={2}>
                    Tổng Vốn chủ sở hữu
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-green-700">
                    {formatMoney(report.equity.total, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ── Totals Comparison ─────────────────────────────────────────────── */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">
          Kiểm tra phương trình kế toán
        </h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Tổng Tài sản</p>
            <p className="text-lg font-mono font-semibold text-blue-700">
              {formatMoney(totals.totalAssets, currency)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Nợ phải trả + Vốn CSH</p>
            <p className="text-lg font-mono font-semibold text-gray-700">
              {formatMoney(
                (
                  parseFloat(totals.totalLiabilities) +
                  parseFloat(totals.totalEquity)
                ).toFixed(4),
                currency
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Hiệu số</p>
            <p
              className={`text-lg font-mono font-semibold ${
                validation.isBalanced ? "text-green-600" : "text-red-600"
              }`}
            >
              {validation.difference}
            </p>
          </div>
        </div>
      </div>

      {/* ── Previous Period ────────────────────────────────────────────────── */}
      {report.previousPeriod && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">
            So sánh với cùng kỳ năm trước
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              Tài sản kỳ trước:{" "}
              <span className="font-mono">
                {formatMoney(report.previousPeriod.totalAssets, currency)}
              </span>
            </div>
            <div>
              Nợ kỳ trước:{" "}
              <span className="font-mono">
                {formatMoney(report.previousPeriod.totalLiabilities, currency)}
              </span>
            </div>
            <div>
              Vốn kỳ trước:{" "}
              <span className="font-mono">
                {formatMoney(report.previousPeriod.totalEquity, currency)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
