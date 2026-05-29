// Task 4: Dashboard Feature - Stats Cards, Recent Activity, Quick Actions
// Public API surface.

export { useDashboardStats, usePendingApprovals, useRecentTransactions } from "./api/dashboard.hooks";
export { mockDashboardAPI, setTestScenario } from "./api/mock-api";
export { DashboardView, PendingApprovals, QuickActions, StatCard, TransactionList } from "./components";
export type { DashboardData, DashboardStat, StatTone } from "./dashboard.types";
