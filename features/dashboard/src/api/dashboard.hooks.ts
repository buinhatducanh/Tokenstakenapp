// features/dashboard/src/api/dashboard.hooks.ts
import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRightLeft,
  type LucideIcon
} from "lucide-react";
import { mockDashboardAPI, getCurrentScenario, type Scenario, type Timeframe, type ChartDataPoint } from "./mock-api";

// ============ Type Definitions ============

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "amber" | "blue" | "rose";
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
}

// Type cho Invoice (giống với @packages/shared-types)
export interface Invoice {
  id: string;
  invoiceNumber: string;
  total: string;
  senderName: string;
  type: string;
  status: string;
  date: string;
}

// Type cho Transaction (giống với @packages/shared-types)
export interface Transaction {
  id: string;
  description: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  status: "APPROVED" | "PENDING" | "FAILED";
  date: string;
  reference?: string;
}

export interface DashboardData {
  stats: DashboardStat[];
  pendingInvoices: Invoice[];
  recentTransactions: Transaction[];
  chartData: ChartDataPoint[];
  isLoading: boolean;
  error: Error | null;
}

// ============ Helper Functions ============

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) return `Hôm nay, ${time}`;
  if (diffDays === 1) return `Hôm qua, ${time}`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

// ============ Converters ============

const getTrendText = (timeframe: string) => {
  switch (timeframe) {
    case "day": return "so với hôm qua";
    case "week": return "so với tuần trước";
    case "year": return "so với năm trước";
    case "month":
    default: return "so với tháng trước";
  }
};

const convertToStats = (mockStats: any, timeframe: string): DashboardStat[] => {
  const trendText = getTrendText(timeframe);
  return [
    {
      id: "revenue",
      label: "Doanh thu",
      value: formatCurrency(mockStats.revenue),
      detail: "",
      tone: "emerald",
      icon: TrendingUp,
      trend: `↑ ${mockStats.trends.revenue}% ${trendText}`,
      trendDirection: "up",
    },
    {
      id: "expenses",
      label: "Chi phí",
      value: formatCurrency(mockStats.expenses),
      detail: "",
      tone: "rose",
      icon: TrendingDown,
      trend: `↑ ${mockStats.trends.expenses}% ${trendText}`,
      trendDirection: "up",
    },
    {
      id: "pending",
      label: "Chờ duyệt",
      value: mockStats.pendingCount.toString(),
      detail: "hóa đơn đang chờ",
      tone: "amber",
      icon: Clock,
    },
    {
      id: "cashflow",
      label: "Dòng tiền",
      value: formatCurrency(mockStats.cashflow),
      detail: "",
      tone: "blue",
      icon: ArrowRightLeft,
      trend: `↑ ${mockStats.trends.cashflow}% ${trendText}`,
      trendDirection: mockStats.cashflow >= 0 ? "up" : "down",
    },
  ];
};

// Chuyển đổi mock approval thành Invoice (đúng format PendingApprovals cần)
const convertToInvoices = (mockApprovals: any[]): Invoice[] => {
  return mockApprovals.map((app) => ({
    id: app.id,
    invoiceNumber: app.code,
    total: app.amount.toString(),
    senderName: app.submitter,
    type: app.type === "invoice" ? "SALE" : "EXPENSE",
    status: "PENDING_APPROVAL",
    date: app.submittedAt || new Date().toISOString(),
  }));
};

// Chuyển đổi mock transaction thành Transaction (đúng format TransactionList cần)
const convertToTransactions = (mockTransactions: any[]): Transaction[] => {
  return mockTransactions.map((tx) => ({
    id: tx.id,
    description: tx.description,
    amount: tx.amount.toString(),
    type: tx.type === "INCOME" ? "INCOME" : "EXPENSE",
    status: tx.status === "PENDING" ? "PENDING" : "APPROVED",
    date: tx.date,
    reference: tx.invoiceNumber || tx.reference,
  }));
};

// ============ Main Hook ============

export function useDashboardStats(timeframe: Timeframe = "month"): DashboardData {
  const [data, setData] = useState<{
    stats: any;
    transactions: any[];
    pendingApprovals: any[];
    chartData: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const dashboardData = await mockDashboardAPI.getDashboardData(getCurrentScenario(), timeframe);
      setData(dashboardData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchData();

    const handleRefresh = () => {
      fetchData();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("dashboard-refresh", handleRefresh);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("dashboard-refresh", handleRefresh);
      }
    };
  }, [fetchData]);

  // Return loading state
  if (isLoading) {
    return {
      stats: [],
      pendingInvoices: [],
      recentTransactions: [],
      chartData: [],
      isLoading: true,
      error: null,
    };
  }

  // Return error state
  if (error || !data) {
    return {
      stats: [],
      pendingInvoices: [],
      recentTransactions: [],
      chartData: [],
      isLoading: false,
      error: error || new Error("No data available"),
    };
  }

  // Return success state với dữ liệu đã được convert đúng format
  return {
    stats: convertToStats(data.stats, timeframe),
    pendingInvoices: convertToInvoices(data.pendingApprovals),
    recentTransactions: convertToTransactions(data.transactions),
    chartData: data.chartData,
    isLoading: false,
    error: null,
  };
}

// ============ Additional Hooks ============

export function useRecentTransactions(): {
  data: Transaction[];
  isLoading: boolean;
  error: Error | null;
} {
  const { recentTransactions, isLoading, error } = useDashboardStats();
  return { data: recentTransactions, isLoading, error };
}

export function usePendingApprovals(): {
  data: Invoice[];
  isLoading: boolean;
  error: Error | null;
} {
  const { pendingInvoices, isLoading, error } = useDashboardStats();
  return { data: pendingInvoices, isLoading, error };
}

// Helper to refresh data (for testing)
export function useRefreshDashboard() {
  const [key, setKey] = useState(0);
  const refresh = useCallback(() => setKey((prev) => prev + 1), []);
  return { refresh, key };
}

// Export scenario changer for testing
export { setTestScenario, getCurrentScenario } from "./mock-api";
export type { Scenario } from "./mock-api";