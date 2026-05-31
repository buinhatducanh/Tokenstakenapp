import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  BalanceSheetReportData,
  CashFlowReportData,
  ExportPayload,
  PnlReportData,
  ReportConfig,
} from "../report.types";
import { exportToCsv } from "../export/csv";
import { exportToPdf } from "../export/pdf";

const fetchJson = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Report fetch failed: ${res.status}`);
  return res.json() as Promise<T>;
};

export const usePnlReport = (config: ReportConfig) =>
  useQuery({
    queryKey: ["reports", "pnl", config],
    queryFn: () =>
      fetchJson<PnlReportData>(
        `/api/reports/pnl?orgId=${config.orgId}&from=${config.range.from}&to=${config.range.to}&period=${config.period}&currency=${config.currency}`
      ),
  });

export const useCashFlowReport = (config: ReportConfig) =>
  useQuery({
    queryKey: ["reports", "cashflow", config],
    queryFn: () =>
      fetchJson<CashFlowReportData>(
        `/api/reports/cashflow?orgId=${config.orgId}&from=${config.range.from}&to=${config.range.to}&period=${config.period}&currency=${config.currency}`
      ),
  });

export const useBalanceSheetReport = (orgId: string, asOf: string, currency: string) =>
  useQuery({
    queryKey: ["reports", "balancesheet", orgId, asOf, currency],
    queryFn: () =>
      fetchJson<BalanceSheetReportData>(
        `/api/reports/balance-sheet?orgId=${orgId}&asOf=${asOf}&currency=${currency}`
      ),
  });

export const useExportReport = () =>
  useCallback(async (payload: ExportPayload) => {
    if (payload.format === "csv") {
      if (!payload.rows) throw new Error("CSV export requires rows");
      exportToCsv(payload.filename, payload.rows);
      return;
    }

    if (!payload.html) throw new Error("PDF export requires html content");
    await exportToPdf(payload.html, payload.filename);
  }, []);

