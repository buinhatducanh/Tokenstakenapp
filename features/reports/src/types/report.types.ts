/**
 * ============================================================================
 * REPORT TYPES — Task 6: Reports Feature
 * ============================================================================
 *
 * Quy tắc double-entry bookkeeping:
 *   - ASSET:     debit (+) increases, credit (-) decreases
 *   - LIABILITY: credit (+) increases, debit (-) decreases
 *   - EQUITY:    credit (+) increases, debit (-) decreases
 *   - REVENUE:   credit (+) increases (income recorded on credit side)
 *   - EXPENSE:   debit (+) increases (costs recorded on debit side)
 *
 * Luôn dùng string cho tiền tệ trong JSON (Decimal serialization).
 * Backend giữ Decimal thực, chỉ serialize sang string khi trả về.
 *
 * ============================================================================
 */

// ─── Enum và Literal Types ────────────────────────────────────────────────────

/** Chu kỳ báo cáo mà người dùng có thể chọn. */
export type ReportPeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "custom";

/** Định dạng xuất báo cáo: JSON (API), CSV (download), PDF (print). */
export type ReportFormat = "json" | "csv" | "pdf";

/** Trạng thái xử lý của báo cáo định kỳ. */
export type ReportStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

/** Tần suất chạy báo cáo định kỳ. */
export type ScheduledReportFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly";

/** Loại báo cáo tài chính. */
export type ReportType = "PNL" | "CASH_FLOW" | "BALANCE_SHEET";

// ─── Common / Shared Types ───────────────────────────────────────────────────

/** Cấu hình chung cho mọi loại báo cáo. */
export type ReportConfig = {
  period: ReportPeriod;
  dateFrom: string;
  dateTo: string;
  currency: string;
  compareWithPrevious?: boolean;
};

// ─── P&L Report ─────────────────────────────────────────────────────────────

/**
 * Các section trong P&L theo thứ tự xuất hiện trong báo cáo.
 * Mỗi line item gắn với một section để phân biệt nguồn gốc.
 */
export type PnlSection =
  | "revenue"
  | "costOfSales"
  | "grossProfit"
  | "operatingExpenses"
  | "operatingProfit"
  | "otherIncome"
  | "otherExpenses"
  | "netProfit";

/** Một dòng trong P&L — đại diện cho một tài khoản doanh thu hoặc chi phí. */
export type PnlLineItem = {
  /** ID tài khoản từ bảng Account trong DB. */
  accountId: string;
  /** Mã tài khoản theo chart of accounts (VD: "4000" cho doanh thu). */
  accountCode: string;
  /** Tên tài khoản hiển thị. */
  accountName: string;
  /** Section P&L mà tài khoản này thuộc về. */
  section: PnlSection;
  /**
   * Số tiền dưới dạng string (Decimal serialization).
   * Quy tắc double-entry:
   *   - REVENUE: amount = tổng credit của journal entries
   *   - EXPENSE: amount = tổng debit của journal entries
   */
  amount: string;
  /** % của tổng doanh thu (tùy chọn, dùng cho display). */
  percentageOfRevenue?: string;
};

/** Khối summary cho các dòng tính tổng (gross profit, operating profit, net profit). */
export type PnlSummary = {
  /** Số tiền dưới dạng string Decimal(20,4). */
  amount: string;
  /** Biên lợi nhuận dạng "XX.XX%" (VD: "25.50%"). */
  margin: string;
};

/** So sánh với kỳ trước — tùy chọn, bật khi compareWithPrevious = true. */
export type PnlPreviousPeriod = {
  revenue: string;
  expenses: string;
  netProfit: string;
};

/**
 * Báo cáo P&L (Profit & Loss / Báo cáo thu nhập).
 * Tính: Revenue - Cost of Sales = Gross Profit
 *        Gross Profit - Operating Expenses = Operating Profit
 *        Operating Profit + Other Income - Other Expenses = Net Profit
 */
export type PnlReport = {
  /** Khoảng thời gian báo cáo. */
  period: {
    start: string;
    end: string;
    /** Nhãn định dạng locale (VD: "01/01/2026 - 31/01/2026"). */
    label: string;
  };
  /** Mã tiền tệ (VD: "VND", "USD"). */
  currency: string;
  /** Danh sách tài khoản doanh thu (REVENUE type). */
  revenue: PnlLineItem[];
  /** Danh sách tài khoản giá vốn (EXPENSE type, thuộc section costOfSales). */
  costOfSales: PnlLineItem[];
  /** Gross Profit = Revenue - Cost of Sales. */
  grossProfit: PnlSummary;
  /** Danh sách tài khoản chi phí hoạt động (EXPENSE type). */
  operatingExpenses: PnlLineItem[];
  /** Operating Profit = Gross Profit - Operating Expenses. */
  operatingProfit: PnlSummary;
  /** Các khoản thu nhập khác (tùy chọn, hiện tại luôn rỗng). */
  otherIncome: PnlLineItem[];
  /** Các khoản chi phí khác (tùy chọn, hiện tại luôn rỗng). */
  otherExpenses: PnlLineItem[];
  /** Net Profit = Operating Profit + Other Income - Other Expenses. */
  netProfit: PnlSummary;
  /** Tổng hợp số liệu chính. */
  totals: {
    totalRevenue: string;
    totalExpenses: string;
    netProfit: string;
  };
  /** So sánh với kỳ trước (undefined nếu compareWithPrevious = false). */
  previousPeriod?: PnlPreviousPeriod | undefined;
};

// ─── Cash Flow Report ────────────────────────────────────────────────────────

/** Ba loại hoạt động trong báo cáo lưu chuyển tiền tệ. */
export type CashFlowCategory =
  | "operating"   // Hoạt động kinh doanh (INCOME/EXPENSE transactions)
  | "investing"  // Hoạt động đầu tư (hiện tại = empty)
  | "financing"; // Hoạt động tài trợ (TRANSFER transactions)

/**
 * Một dòng trong báo cáo lưu chuyển tiền tệ.
 * inflow và outflow là mutually exclusive: một dòng chỉ có inflow HOẶC outflow.
 */
export type CashFlowLineItem = {
  transactionId: string;
  reference: string;
  date: string;
  description: string | null;
  category: CashFlowCategory;
  accountCode: string;
  accountName: string;
  /** Số tiền vào (cho INCOME transactions). */
  inflow: string;
  /** Số tiền ra (cho EXPENSE transactions). */
  outflow: string;
};

/** So sánh kỳ trước cho báo cáo Cash Flow. */
export type CashFlowPreviousPeriod = {
  closingBalance: string;
  netChange: string;
};

/**
 * Báo cáo lưu chuyển tiền tệ (Cash Flow Statement).
 *
 * Công thức: Closing Balance = Opening Balance + Net Change
 *   Opening Balance = tổng balance của ASSET accounts trước dateFrom
 *   Net Change = tổng inflow - tổng outflow trong kỳ
 *
 * Cách phân loại:
 *   INCOME → operating inflow
 *   EXPENSE → operating outflow
 *   TRANSFER → financing
 */
export type CashFlowReport = {
  period: {
    start: string;
    end: string;
    label: string;
  };
  currency: string;
  /** Số dư đầu kỳ — tổng balance ASSET accounts trước dateFrom. */
  openingBalance: string;
  /** Hoạt động kinh doanh: INCOME và EXPENSE transactions. */
  operatingActivities: {
    items: CashFlowLineItem[];
    totalInflow: string;
    totalOutflow: string;
    netCashflow: string;
  };
  /** Hoạt động đầu tư (hiện tại chưa implement). */
  investingActivities: {
    items: CashFlowLineItem[];
    totalInflow: string;
    totalOutflow: string;
    netCashflow: string;
  };
  /** Hoạt động tài trợ: TRANSFER transactions. */
  financingActivities: {
    items: CashFlowLineItem[];
    totalInflow: string;
    totalOutflow: string;
    netCashflow: string;
  };
  /** Số dư cuối kỳ = openingBalance + netChange. */
  closingBalance: string;
  /** Tổng thay đổi = inflow tổng - outflow tổng. */
  netChange: string;
  /** So sánh với kỳ trước. */
  previousPeriod?: CashFlowPreviousPeriod | undefined;
};

// ─── Balance Sheet ────────────────────────────────────────────────────────────

/** Một dòng trong Balance Sheet. Có thể là parent (có children) hoặc leaf. */
export type BalanceSheetLineItem = {
  accountId: string;
  accountCode: string;
  accountName: string;
  /** ASSET, LIABILITY, hoặc EQUITY. */
  type: "ASSET" | "LIABILITY" | "EQUITY";
  /**
   * Số dư tài khoản.
   * Quy tắc double-entry:
   *   ASSET:     amount = sum(debit) - sum(credit)
   *   LIABILITY: amount = sum(credit) - sum(debit)
   *   EQUITY:    amount = sum(credit) - sum(debit)
   */
  amount: string;
  /** true nếu đây là dòng total (không có children). */
  isTotal: boolean;
  /** Child accounts — nếu có children thì amount này là total của children. */
  children?: BalanceSheetLineItem[];
};

/** So sánh kỳ trước cho Balance Sheet. */
export type BalanceSheetPreviousPeriod = {
  totalAssets: string;
  totalLiabilities: string;
  totalEquity: string;
};

/**
 * Báo cáo cân đối kế toán (Balance Sheet).
 *
 * Nguyên tắc cân bằng: Total Assets = Total Liabilities + Total Equity
 * Độ chính xác: cho phép sai số < 0.0001 (do Decimal precision).
 *
 * Cấu trúc:
 *   ASSETS (Tài sản): 1000-1999
 *   LIABILITIES (Nợ phải trả): 2000-2999
 *   EQUITY (Vốn chủ sở hữu): 3000-3999
 */
export type BalanceSheetReport = {
  /** Ngày đối soát — tất cả transactions <= asOfDate được tính. */
  asOfDate: string;
  currency: string;
  assets: {
    items: BalanceSheetLineItem[];
    total: string;
  };
  liabilities: {
    items: BalanceSheetLineItem[];
    total: string;
  };
  equity: {
    items: BalanceSheetLineItem[];
    total: string;
  };
  totals: {
    totalAssets: string;
    totalLiabilities: string;
    totalEquity: string;
  };
  validation: {
    /** true nếu |Assets - (Liabilities + Equity)| < 0.0001. */
    isBalanced: boolean;
    /** Hiệu số tuyệt đối giữa Assets và Liabilities + Equity. */
    difference: string;
  };
  /** So sánh với cùng kỳ năm trước. */
  previousPeriod?: BalanceSheetPreviousPeriod | undefined;
};

// ─── Scheduled Reports ───────────────────────────────────────────────────────

/** Báo cáo định kỳ — được tạo bởi người dùng và chạy tự động. */
export type ScheduledReport = {
  id: string;
  organizationId: string;
  name: string;
  /** Loại báo cáo: PNL, CASH_FLOW, hoặc BALANCE_SHEET. */
  type: ReportType;
  frequency: ScheduledReportFrequency;
  /** Danh sách email nhận báo cáo. */
  recipients: string[];
  format: ReportFormat;
  /** Thời điểm chạy tiếp theo (ISO string). */
  nextRunAt: string;
  /** Thời điểm chạy gần nhất (null nếu chưa chạy). */
  lastRunAt: string | null;
  isActive: boolean;
  createdAt: string;
  createdById: string;
};

/** DTO để tạo scheduled report mới. */
export type CreateScheduledReportDTO = {
  name: string;
  type: ReportType;
  frequency: ScheduledReportFrequency;
  recipients: string[];
  format: ReportFormat;
};

/** DTO để cập nhật scheduled report — tất cả fields đều optional. */
export type UpdateScheduledReportDTO = Partial<
  CreateScheduledReportDTO & { isActive: boolean }
>;
