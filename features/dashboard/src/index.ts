// Task 4: Dashboard Feature — Stats Cards, Charts, Recent Activity, Quick Actions
// Public API surface.

export { DashboardService } from "./dashboard.service";
export { StatCard, TransactionList, PendingApprovals, QuickActions } from "./components";
export { useDashboardStats, useRecentTransactions, usePendingApprovals } from "./api/dashboard.hooks";
