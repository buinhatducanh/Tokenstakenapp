/**
 * ============================================================================
 * REPORT API CLIENT — HTTP calls + React Query hooks
 * ============================================================================
 *
 * Task 6: Reports & Export
 *
 * API layer cho báo cáo tài chính:
 *   - GET /reports/pnl          → P&L report
 *   - GET /reports/cash-flow    → Cash Flow report
 *   - GET /reports/balance-sheet → Balance Sheet
 *   - GET /reports/export/:type  → Download CSV/PDF/JSON
 *   - CRUD /reports/scheduled    → Scheduled reports
 *
 * React Query patterns:
 *   - Query keys: flat arrays với params objects (cache-aware)
 *   - useMutation: cho export và scheduled CRUD
 *   - Optimistic updates: không áp dụng (report là read-only)
 *   - Stale time: 30s (báo cáo không thay đổi thường xuyên)
 *
 * ============================================================================
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Import types — compile-time only
import type {
  PnlReport,
  CashFlowReport,
  BalanceSheetReport,
  ReportFormat,
  CreateScheduledReportDTO,
  UpdateScheduledReportDTO,
  ScheduledReport,
} from "../types/report.types";

// ─── API Base URL ────────────────────────────────────────────────────────────

/**
 * Backend API URL.
 * Trong Next.js: NEXT_PUBLIC_API_URL = "http://localhost:3001" (backend NestJS)
 * Trong dev: proxy qua next.config.js rewrites
 */
const API_BASE =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
    : "http://localhost:3001";

// ─── HTTP Helpers ─────────────────────────────────────────────────────────────

/**
 * GET request parser.
 * Parse response JSON, throw Error nếu HTTP status không OK.
 *
 * @param path    - API path (VD: "/reports/pnl")
 * @param params  - Query string params (tự động encode)
 *
 * @returns Parsed JSON response
 *
 * @throws Error với message từ backend hoặc statusText
 */
async function apiGet<T>(
  path: string,
  params?: Record<string, string | boolean | undefined>
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);

  if (params) {
    // Bỏ qua undefined values
    (Object.entries(params) as [string, string | boolean | undefined][]).forEach(
      ([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    );
  }

  const res = await fetch(url.toString(), {
    /**
     * credentials: "include" — gửi cookie để NestJS xác thực JWT.
     * Backend sẽ extract organizationId từ JWT token.
     */
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(
      (body as { message?: string }).message ?? res.statusText
    );
  }

  return res.json() as Promise<T>;
}

/**
 * POST/PATCH/DELETE request.
 *
 * @param path    - API path
 * @param body    - Request body (sẽ JSON.stringify)
 * @param method  - HTTP method (default: POST)
 */
async function apiMutate<T>(
  path: string,
  body: unknown,
  method = "POST"
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const bodyJson = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(
      (bodyJson as { message?: string }).message ?? res.statusText
    );
  }

  return res.json() as Promise<T>;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

/**
 * React Query keys — flat array structure để queryClient có thể
 * invalidate/remove chính xác.
 *
 * Pattern: [...reportKeys.all, "pnl", params] → tự động grouped
 *
 * Query key serialization:
 *   React Query deep-freeze params objects → string keys
 *   Dùng [...spread] để tạo unique key per params
 */
export const reportKeys = {
  /** Root key — dùng để invalidate tất cả report queries */
  all: ["reports"] as const,

  /** P&L query key factory */
  pnl: (params: ReportQueryParams) =>
    [...reportKeys.all, "pnl", params] as const,

  /** Cash Flow query key factory */
  cashFlow: (params: ReportQueryParams) =>
    [...reportKeys.all, "cashFlow", params] as const,

  /** Balance Sheet query key factory */
  balanceSheet: (params: BalanceSheetQueryParams) =>
    [...reportKeys.all, "balanceSheet", params] as const,

  /** Scheduled reports query key */
  scheduled: (params?: Record<string, string>) =>
    [...reportKeys.all, "scheduled", params] as const,
};

// ─── Query Params Types ────────────────────────────────────────────────────────

/** Shared query params cho P&L và Cash Flow. */
export type ReportQueryParams = {
  dateFrom?: string;
  dateTo?: string;
  currency?: string;
  period?: string;
  compareWithPrevious?: boolean;
  accountId?: string;
};

/** Query params riêng cho Balance Sheet. */
export type BalanceSheetQueryParams = {
  asOfDate?: string;
  currency?: string;
  compareWithPrevious?: boolean;
};

// ─── React Query Hooks ─────────────────────────────────────────────────────────

/**
 * Hook: Lấy P&L report.
 *
 * @param params - Query params (dateFrom, dateTo, currency, compareWithPrevious)
 *
 * Features:
 *   - Stale time: 30s (báo cáo không thay đổi thường xuyên)
 *   - Refetch on window focus: đảm bảo data luôn fresh
 *   - select: unwrap { data, success } wrapper → chỉ return PnlReport
 *
 * @example
 *   const { data, isLoading, error } = usePnlReport({
 *     dateFrom: "2026-01-01",
 *     dateTo: "2026-01-31",
 *     currency: "VND",
 *   });
 */
export function usePnlReport(params: ReportQueryParams = {}) {
  return useQuery({
    // Unique query key bao gồm cả params
    queryKey: reportKeys.pnl(params),
    // Query function — trả về PnlReport
    queryFn: () =>
      apiGet<{ data: PnlReport; success: true }>("/reports/pnl", {
        ...params,
        // React Query params có thể là boolean → convert sang string
        compareWithPrevious: params.compareWithPrevious === true ? "true" : "false",
      }),
    // Unwrap wrapper — chỉ return PnlReport data
    select: (res) => res.data,
    // Stale time 30s — không refetch nếu data còn < 30s
    staleTime: 30_000,
  });
}

/**
 * Hook: Lấy Cash Flow report.
 *
 * @param params - Query params (dateFrom, dateTo, currency, compareWithPrevious)
 */
export function useCashFlowReport(params: ReportQueryParams = {}) {
  return useQuery({
    queryKey: reportKeys.cashFlow(params),
    queryFn: () =>
      apiGet<{ data: CashFlowReport; success: true }>("/reports/cash-flow", {
        ...params,
        compareWithPrevious: params.compareWithPrevious === true ? "true" : "false",
      }),
    select: (res) => res.data,
    staleTime: 30_000,
  });
}

/**
 * Hook: Lấy Balance Sheet report.
 *
 * @param params - Query params (asOfDate, currency, compareWithPrevious)
 *
 * Balance Sheet không dùng dateFrom/dateTo — chỉ dùng asOfDate.
 */
export function useBalanceSheetReport(params: BalanceSheetQueryParams = {}) {
  return useQuery({
    queryKey: reportKeys.balanceSheet(params),
    queryFn: () =>
      apiGet<{ data: BalanceSheetReport; success: true }>(
        "/reports/balance-sheet",
        {
          ...params,
          compareWithPrevious:
            params.compareWithPrevious === true ? "true" : "false",
        }
      ),
    select: (res) => res.data,
    staleTime: 30_000,
  });
}

// ─── Export Mutation ──────────────────────────────────────────────────────────

/**
 * Hook: Export báo cáo ra CSV/PDF/JSON.
 *
 * Dùng useMutation vì:
 *   - Triggered by user action (click export button)
 *   - Side effect: download file
 *   - No optimistic update needed
 *
 * Cách hoạt động:
 *   1. Fetch report data từ API
 *   2. Convert sang format (CSV/PDF/JSON)
 *   3. Trigger browser download bằng Blob URL
 *
 * PDF: Backend trả HTML → frontend dùng window.print()
 * CSV/JSON: Frontend tự convert → download Blob
 */
export function useExportReport() {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * Mutation function.
     * Fetches report data và trigger download.
     */
    mutationFn: async ({
      type,
      params,
      format,
    }: {
      /** Loại báo cáo: pnl | cash-flow | balance-sheet */
      type: "pnl" | "cash-flow" | "balance-sheet";
      /** Query params cho report */
      params?: ReportQueryParams | BalanceSheetQueryParams;
      /** Định dạng: csv | pdf | json */
      format?: ReportFormat;
    }) => {
      /**
       * Bước 1: Build search params cho export endpoint.
       * Export endpoint dùng GET → params qua query string.
       */
      const searchParams = new URLSearchParams();

      if ("dateFrom" in (params ?? {})) {
        const p = params as ReportQueryParams;
        if (p.dateFrom) searchParams.set("dateFrom", p.dateFrom);
        if (p.dateTo) searchParams.set("dateTo", p.dateTo);
      } else if ("asOfDate" in (params ?? {})) {
        const p = params as BalanceSheetQueryParams;
        if (p.asOfDate) searchParams.set("asOfDate", p.asOfDate);
      }

      if ("currency" in (params ?? {})) {
        const p = params as ReportQueryParams;
        if (p.currency) searchParams.set("currency", p.currency);
      }

      if (format) searchParams.set("format", format);

      /**
       * Bước 2: Fetch từ export endpoint.
       */
      const url = `${API_BASE}/reports/export/${type}?${searchParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) {
        throw new Error(`Export failed: ${res.statusText}`);
      }

      /**
       * Bước 3: Parse content disposition để lấy filename.
       * Backend set: Content-Disposition: attachment; filename="pnl-report.csv"
       */
      const contentDisposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      const filename = filenameMatch?.[1] ?? `${type}-report.${format ?? "csv"}`;

      /**
       * Bước 4: Tạo Blob và trigger download.
       */
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Tạo hidden <a> element → click → download
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup: revoke Blob URL sau khi download trigger xong
      URL.revokeObjectURL(blobUrl);

      return { filename, format };
    },

    /**
     * onSuccess: invalidate scheduled reports queries nếu cần.
     * Không cần invalidate report queries vì export không thay đổi data.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.scheduled() });
    },
  });
}

// ─── Scheduled Reports CRUD ───────────────────────────────────────────────────

/**
 * Hook: Lấy danh sách scheduled reports.
 */
export function useScheduledReports(params?: Record<string, string>) {
  return useQuery({
    queryKey: reportKeys.scheduled(params),
    queryFn: () =>
      apiGet<{ data: ScheduledReport[]; success: true }>(
        "/reports/scheduled",
        params
      ),
    select: (res) => res.data,
    staleTime: 60_000, // 1 phút — scheduled reports ít thay đổi
  });
}

/**
 * Hook: Tạo scheduled report mới.
 *
 * Optimistic update:
 *   onMutate: cancel pending queries → snapshot previous data
 *   onError:  rollback to snapshot + show error toast
 *   onSettled: invalidate để refetch
 */
export function useCreateScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateScheduledReportDTO) =>
      apiMutate<{ data: ScheduledReport; success: true }>(
        "/reports/scheduled",
        dto
      ),

    onMutate: async (_newDto: CreateScheduledReportDTO) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: reportKeys.scheduled() });
      // Snapshot current data
      const previous = queryClient.getQueryData(reportKeys.scheduled());
      return { previous };
    },

    onError: (
      _err: Error,
      _dto: CreateScheduledReportDTO,
      context
    ) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(reportKeys.scheduled(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.scheduled() });
    },
  });
}

/**
 * Hook: Cập nhật scheduled report.
 */
export function useUpdateScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateScheduledReportDTO;
    }) =>
      apiMutate<{ data: { id: string }; success: true }>(
        `/reports/scheduled/${id}`,
        dto,
        "PATCH"
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.scheduled() });
    },
  });
}

/**
 * Hook: Xóa scheduled report.
 */
export function useDeleteScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiMutate<{ success: true }>(`/reports/scheduled/${id}`, {}, "DELETE"),

    onMutate: async (id: string) => {
      // Optimistic: cancel pending → snapshot
      await queryClient.cancelQueries({ queryKey: reportKeys.scheduled() });
      const previous = queryClient.getQueryData(reportKeys.scheduled());

      // Optimistic delete: remove from cache immediately
      queryClient.setQueryData(
        reportKeys.scheduled(),
        (old: ScheduledReport[] | undefined) =>
          old?.filter((r) => r.id !== id) ?? []
      );

      return { previous };
    },

    onError: (_err: Error, _id: string, context) => {
      if (context?.previous) {
        queryClient.setQueryData(reportKeys.scheduled(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.scheduled() });
    },
  });
}
