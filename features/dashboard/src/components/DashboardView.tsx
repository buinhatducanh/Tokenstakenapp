// features/dashboard/src/views/DashboardView.tsx
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Dashboard
        </h1>
        <span className="text-sm text-neutral-400">
          Dữ liệu mô phỏng — Mock Data
        </span>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {dashboard.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Row 2: Transactions (left) + Pending Approvals (right) */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <TransactionList transactions={dashboard.recentTransactions} />
        <PendingApprovals invoices={dashboard.pendingInvoices} />
      </div>

      {/* Row 3: Quick Actions */}
      <QuickActions />
    </div>
  );
}