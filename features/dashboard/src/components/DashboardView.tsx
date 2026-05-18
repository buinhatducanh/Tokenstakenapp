import { useDashboardStats } from "../api/dashboard.hooks";
import { PendingApprovals } from "./PendingApprovals";
import { QuickActions } from "./QuickActions";
import { StatCard } from "./StatCard";
import { TransactionList } from "./TransactionList";

export function DashboardView() {
  const dashboard = useDashboardStats();

  if (dashboard.error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Dashboard data could not be loaded.
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-medium text-neutral-900">Dashboard</h1>
        <span className="text-[13px] text-neutral-400">
          Dữ liệu mô phỏng — Mock Data
        </span>
      </div>

      {/* Row 1: Stat Cards — 4 cols */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {dashboard.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Row 2: Transactions (left 1.6fr) + Pending Approvals (right 1fr) */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <TransactionList transactions={dashboard.recentTransactions} />
        <PendingApprovals invoices={dashboard.pendingInvoices} />
      </div>

      {/* Row 3: Quick Actions */}
      <QuickActions />
    </div>
  );
}