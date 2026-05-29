import type { Invoice, Transaction } from "@packages/shared-types";
import type { LucideIcon } from "lucide-react";

export type StatTone = "emerald" | "amber" | "blue" | "rose";

export type DashboardStat = {
  label: string;
  value: string;
  detail: string;
  tone: StatTone;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
};

export type DashboardData = {
  organizationName: string;
  stats: DashboardStat[];
  invoices: Invoice[];
  transactions: Transaction[];
  pendingInvoices: Invoice[];
  recentTransactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
};
