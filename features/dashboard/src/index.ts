// Task 4: Dashboard Feature - Stats Cards, Recent Activity, Quick Actions
// Public API surface.

export { useDashboardStats, usePendingApprovals, useRecentTransactions } from "./api/dashboard.hooks";
export { DashboardView, PendingApprovals, QuickActions, StatCard, TransactionList } from "./components";
export type { DashboardData, DashboardStat, StatTone } from "./dashboard.types";
