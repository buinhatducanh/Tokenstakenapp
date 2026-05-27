// features/dashboard/src/components/DashboardView.tsx
import { useState } from "react";
import { useDashboardStats } from "../api/dashboard.hooks";
import type { Timeframe } from "../api/mock-api";
import { PendingApprovals } from "./PendingApprovals";
import { QuickActions } from "./QuickActions";
import { StatCard } from "./StatCard";
import { TransactionList } from "./TransactionList";
import { FinancialChart } from "./FinancialChart";
import { ActivityChart } from "./ActivityChart";

export function DashboardView() {
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const dashboard = useDashboardStats(timeframe);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[22px] font-medium text-neutral-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 outline-none hover:bg-neutral-50 focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100"
          >
            <option value="day">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
          <span className="text-[13px] text-neutral-400">
            Dữ liệu mô phỏng — Mock Data
          </span>
        </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {dashboard.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Row 2: Charts */}
      {dashboard.chartData && dashboard.chartData.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          <FinancialChart data={dashboard.chartData} />
          <ActivityChart data={dashboard.chartData} />
        </div>
      )}

      {/* Row 3: Transactions + Pending Approvals */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <TransactionList transactions={dashboard.recentTransactions} />
        {/* Truyền đúng props - items thay vì invoices */}
        <PendingApprovals items={dashboard.pendingInvoices} />
      </div>

      {/* Row 4: Quick Actions */}
      <QuickActions />
    </div>
  );
}