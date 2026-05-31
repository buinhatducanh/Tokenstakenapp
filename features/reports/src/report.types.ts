export type ReportPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export type DateRange = {
  from: string; // ISO date (YYYY-MM-DD)
  to: string;   // ISO date (YYYY-MM-DD)
};

export type MoneyAmount = {
  amount: string; // Decimal serialized as string
  currency: string;
};

export type ReportConfig = {
  orgId: string;
  period: ReportPeriod;
  range: DateRange;
  currency: string;
};

export type PnlLine = {
  label: string;
  accountCode?: string;
  accountName?: string;
  total: MoneyAmount;
};

export type PnlReportData = {
  period: ReportPeriod;
  range: DateRange;
  currency: string;
  revenue: PnlLine[];
  expenses: PnlLine[];
  totals: {
    totalRevenue: MoneyAmount;
    totalExpenses: MoneyAmount;
    netProfit: MoneyAmount;
  };
};

export type CashFlowSection = "inflow" | "outflow";

export type CashFlowLine = {
  section: CashFlowSection;
  label: string;
  total: MoneyAmount;
};

export type CashFlowReportData = {
  period: ReportPeriod;
  range: DateRange;
  currency: string;
  lines: CashFlowLine[];
  totals: {
    totalInflow: MoneyAmount;
    totalOutflow: MoneyAmount;
    netCashFlow: MoneyAmount;
  };
};

export type BalanceSheetLine = {
  label: string;
  accountCode?: string;
  accountName?: string;
  total: MoneyAmount;
};

export type BalanceSheetReportData = {
  asOf: string; // ISO date
  currency: string;
  assets: BalanceSheetLine[];
  liabilities: BalanceSheetLine[];
  equity: BalanceSheetLine[];
  totals: {
    totalAssets: MoneyAmount;
    totalLiabilities: MoneyAmount;
    totalEquity: MoneyAmount;
  };
};

export type ExportFormat = "csv" | "pdf";

export type ExportPayload = {
  format: ExportFormat;
  filename: string;
  rows?: Array<Record<string, string | number>>;
  html?: string;
};

