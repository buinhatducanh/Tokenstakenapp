/**
 * ============================================================================
 * CASH FLOW REPORT COMPONENT — Statement of Cash Flows Display
 * ============================================================================
 *
 * Task 6: Reports & Export
 *
 * Component hiển thị báo cáo lưu chuyển tiền tệ.
 *
 * Cấu trúc Cash Flow:
 *   Opening Balance (số dư đầu kỳ)
 *   ± Operating Activities   (INCOME → inflow, EXPENSE → outflow)
 *   ± Investing Activities   (hiện tại = empty)
 *   ± Financing Activities  (TRANSFER → inflow/outflow)
 *   = Net Change
 *   = Closing Balance
 *
 * Props:
 *   report      - CashFlowReport data
 *   isLoading   - React Query loading
 *   error       - React Query error
 *   onExport    - callback khi user click export
 *
 * ============================================================================
 */

import type { CashFlowReport, CashFlowLineItem, CashFlowCategory } from "../types/report.types";

/** Props interface. */
interface CashFlowReportProps {
  report: CashFlowReport | undefined;
  isLoading: boolean;
  error: Error | null;
  onExport: (format: "csv" | "pdf" | "json") => void;
}

/**
 * Format số tiền với màu sắc:
 *   inflow (dương) → xanh lá
 *   outflow (âm)  → đỏ
 *   zero          → xám
 */
function formatMoneyWithSign(
  amount: string,
  currency: string,
  isOutflow = false
): { text: string; className: string } {
  const num = parseFloat(amount);
  const text = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));

  if (num === 0) return { text, className: "text-gray-400" };
  if (isOutflow) return { text: `-${text}`, className: "text-red-600" };
  return { text: `+${text}`, className: "text-green-600" };
}

/**
 * Hiển thị một dòng trong bảng cash flow.
 * inflow và outflow: một trong hai khác 0.
 */
function CashFlowRow({
  item,
  currency,
}: {
  item: CashFlowLineItem;
  currency: string;
}) {
  const inflowFormatted = formatMoneyWithSign(item.inflow, currency, false);
  const outflowFormatted = formatMoneyWithSign(item.outflow, currency, true);

  const fmtDate = new Date(item.date).toLocaleDateString("vi-VN");

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-2 text-sm text-gray-500 font-mono">
        {item.reference}
      </td>
      <td className="px-4 py-2 text-sm text-gray-400 text-xs">{fmtDate}</td>
      <td className="px-4 py-2 text-sm text-gray-700">
        {item.description ?? "—"}
      </td>
      <td className="px-4 py-2 text-sm text-gray-500 font-mono">
        {item.accountCode}
      </td>
      <td className="px-4 py-2 text-sm text-right font-mono">
        <span className={inflowFormatted.className}>
          {parseFloat(item.inflow) > 0 ? inflowFormatted.text : "—"}
        </span>
      </td>
      <td className="px-4 py-2 text-sm text-right font-mono">
        <span className={outflowFormatted.className}>
          {parseFloat(item.outflow) > 0 ? outflowFormatted.text : "—"}
        </span>
      </td>
    </tr>
  );
}

/**
 * Hiển thị tổng của một category (operating/investing/financing).
 */
function CategorySummary({
  category,
  label,
  totalInflow,
  totalOutflow,
  netCashflow,
  currency,
  bgClass,
}: {
  category: CashFlowCategory;
  label: string;
  totalInflow: string;
  totalOutflow: string;
  netCashflow: string;
  currency: string;
  bgClass: string;
}) {
  const inflowNum = parseFloat(totalInflow);
  const outflowNum = parseFloat(totalOutflow);
  const netNum = parseFloat(netCashflow);

  return (
    <div className={`${bgClass} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-700">{label}</h4>
        <span
          className={`text-sm font-mono font-semibold ${
            netNum >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {netNum >= 0 ? "+" : ""}
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
          }).format(netNum)}
        </span>
      </div>

      <div className="flex gap-4 text-sm">
        <span>
          Inflow:{" "}
          <span className="text-green-600 font-mono">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency,
              minimumFractionDigits: 2,
            }).format(inflowNum)}
          </span>
        </span>
        <span>
          Outflow:{" "}
          <span className="text-red-600 font-mono">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency,
              minimumFractionDigits: 2,
            }).format(outflowNum)}
          </span>
        </span>
      </div>
    </div>
  );
}

/**
 * CashFlowReport — Main component.
 *
 * Hiển thị cash flow với:
 *   - Balance cards (Opening, Net Change, Closing)
 *   - Operating, Investing, Financing activities tables
 *   - Export buttons
 */
export function CashFlowReport({
  report,
  isLoading,
  error,
  onExport,
}: CashFlowReportProps) {
  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">
          Đang tải báo cáo lưu chuyển tiền tệ...
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

  const { currency } = report;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Báo cáo Lưu chuyển tiền tệ
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {report.period.label} · {currency}
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

      {/* ── Balance Summary Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Opening Balance */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Số dư đầu kỳ</p>
          <p className="text-lg font-semibold text-gray-700 mt-1">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency,
              minimumFractionDigits: 2,
            }).format(parseFloat(report.openingBalance))}
          </p>
        </div>

        {/* Net Change */}
        <div
          className={`p-4 rounded-lg ${
            parseFloat(report.netChange) >= 0
              ? "bg-green-50"
              : "bg-red-50"
          }`}
        >
          <p className="text-xs text-gray-500 uppercase">Thay đổi ròng</p>
          <p
            className={`text-lg font-semibold mt-1 ${
              parseFloat(report.netChange) >= 0
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {parseFloat(report.netChange) >= 0 ? "+" : ""}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency,
              minimumFractionDigits: 2,
            }).format(parseFloat(report.netChange))}
          </p>
        </div>

        {/* Closing Balance */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Số dư cuối kỳ</p>
          <p className="text-lg font-semibold text-blue-700 mt-1">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency,
              minimumFractionDigits: 2,
            }).format(parseFloat(report.closingBalance))}
          </p>
          {/* Validation: closing = opening + net change */}
          <p className="text-xs text-gray-400 mt-1">
            {Math.abs(
              parseFloat(report.closingBalance) -
                (parseFloat(report.openingBalance) +
                  parseFloat(report.netChange))
            ) < 0.0001
              ? "✓ Đã xác thực"
              : "⚠ Sai số phát hiện"}
          </p>
        </div>
      </div>

      {/* ── Category Summaries ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <CategorySummary
          category="operating"
          label="Hoạt động kinh doanh"
          totalInflow={report.operatingActivities.totalInflow}
          totalOutflow={report.operatingActivities.totalOutflow}
          netCashflow={report.operatingActivities.netCashflow}
          currency={currency}
          bgClass="bg-green-50"
        />
        <CategorySummary
          category="investing"
          label="Hoạt động đầu tư"
          totalInflow={report.investingActivities.totalInflow}
          totalOutflow={report.investingActivities.totalOutflow}
          netCashflow={report.investingActivities.netCashflow}
          currency={currency}
          bgClass="bg-purple-50"
        />
        <CategorySummary
          category="financing"
          label="Hoạt động tài trợ"
          totalInflow={report.financingActivities.totalInflow}
          totalOutflow={report.financingActivities.totalOutflow}
          netCashflow={report.financingActivities.netCashflow}
          currency={currency}
          bgClass="bg-orange-50"
        />
      </div>

      {/* ── Detailed Tables ──────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Operating Activities Table */}
        {report.operatingActivities.items.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Chi tiết hoạt động kinh doanh
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-xs text-gray-500 uppercase">
                      Ref
                    </th>
                    <th className="px-4 py-2 text-xs text-gray-500 uppercase">
                      Ngày
                    </th>
                    <th className="px-4 py-2 text-xs text-gray-500 uppercase">
                      Mô tả
                    </th>
                    <th className="px-4 py-2 text-xs text-gray-500 uppercase">
                      TK
                    </th>
                    <th className="px-4 py-2 text-xs text-gray-500 uppercase text-right">
                      inflow
                    </th>
                    <th className="px-4 py-2 text-xs text-gray-500 uppercase text-right">
                      Outflow
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.operatingActivities.items.map((item) => (
                    <CashFlowRow key={item.transactionId} item={item} currency={currency} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            Không có hoạt động kinh doanh trong kỳ
          </div>
        )}
      </div>

      {/* ── Compare with Previous ─────────────────────────────────────────── */}
      {report.previousPeriod && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">
            So sánh với kỳ trước
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Closing Balance kỳ trước: </span>
              <span className="font-mono">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency,
                  minimumFractionDigits: 2,
                }).format(parseFloat(report.previousPeriod.closingBalance))}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Net Change kỳ trước: </span>
              <span className="font-mono">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency,
                  minimumFractionDigits: 2,
                }).format(parseFloat(report.previousPeriod.netChange))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
