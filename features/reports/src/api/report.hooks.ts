/**
 * ============================================================================
 * REPORT HOOKS — Public API surface cho React components
 * ============================================================================
 *
 * Task 6: Reports & Export
 *
 * Re-export tất cả hooks từ report.api.ts.
 * Components chỉ import từ đây, không import trực tiếp từ report.api.ts.
 *
 * Usage:
 *   import { usePnlReport, useExportReport } from "@features/reports";
 *   const { data } = usePnlReport({ dateFrom, dateTo });
 *
 * ============================================================================
 */

// Query hooks — lấy data
export {
  usePnlReport,
  useCashFlowReport,
  useBalanceSheetReport,
  useScheduledReports,
} from "./report.api";

// Mutation hooks — thay đổi data
export {
  useExportReport,
  useCreateScheduledReport,
  useUpdateScheduledReport,
  useDeleteScheduledReport,
} from "./report.api";

// Re-export types cho convenience
export type {
  ReportQueryParams,
  BalanceSheetQueryParams,
} from "./report.api";
