// // features/dashboard/src/components/DashboardView.tsx
// import { useState } from "react";
// import { useDashboardStats } from "../api/dashboard.hooks";
// import type { Timeframe } from "../api/mock-api";
// import { PendingApprovals } from "./PendingApprovals";
// import { QuickActions } from "./QuickActions";
// import { StatCard } from "./StatCard";
// import { TransactionList } from "./TransactionList";
// import { FinancialChart } from "./FinancialChart";
// import { ActivityChart } from "./ActivityChart";

// export function DashboardView() {
//   const [timeframe, setTimeframe] = useState<Timeframe>("month");
//   const dashboard = useDashboardStats(timeframe);

//   if (dashboard.error) {
//     return (
//       <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
//         Dashboard data could not be loaded.
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6">
//       {/* Header */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <h1 className="text-[22px] font-medium text-neutral-900">Dashboard</h1>
//         <div className="flex items-center gap-4">
//           <select
//             value={timeframe}
//             onChange={(e) => setTimeframe(e.target.value as Timeframe)}
//             className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 outline-none hover:bg-neutral-50 focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100"
//           >
//             <option value="day">Hôm nay</option>
//             <option value="week">Tuần này</option>
//             <option value="month">Tháng này</option>
//             <option value="year">Năm nay</option>
//           </select>
//           <span className="text-[13px] text-neutral-400">
//             Dữ liệu mô phỏng — Mock Data
//           </span>
//         </div>
//       </div>

//       {/* Row 1: Stat Cards */}
//       <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
//         {dashboard.stats.map((stat) => (
//           <StatCard key={stat.label} stat={stat} />
//         ))}
//       </div>

//       {/* Row 2: Charts */}
//       {dashboard.chartData && dashboard.chartData.length > 0 && (
//         <div className="grid gap-3 lg:grid-cols-2">
//           <FinancialChart data={dashboard.chartData} />
//           <ActivityChart data={dashboard.chartData} />
//         </div>
//       )}

//       {/* Row 3: Transactions + Pending Approvals */}
//       <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
//         <TransactionList transactions={dashboard.recentTransactions} />
//         {/* Truyền đúng props - items thay vì invoices */}
//         <PendingApprovals items={dashboard.pendingInvoices} />
//       </div>

//       {/* Row 4: Quick Actions */}
//       <QuickActions />
//     </div>
//   );
// }

// features/dashboard/src/components/DashboardView.tsx
import { useState, useEffect } from "react";
import { useDashboardStats } from "../api/dashboard.hooks";
import type { Timeframe } from "../api/mock-api";
import { PendingApprovals } from "./PendingApprovals";
import { QuickActions } from "./QuickActions";
import { StatCard } from "./StatCard";
import { TransactionList } from "./TransactionList";
import { FinancialChart } from "./FinancialChart";
import { ActivityChart } from "./ActivityChart";

/* ====================== CSS ====================== */
const dashboardStyles = `
  .dashboard-container {
    margin-left: auto;
    margin-right: auto;
    max-width: 1152px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px 16px;
  }

  .dashboard-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  @media (min-width: 640px) {
    .dashboard-header {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .dashboard-title {
    font-size: 22px;
    font-weight: 500;
    color: #171717;
  }

  .dashboard-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .dashboard-select {
    border-radius: 8px;
    border: 1px solid #e5e5e5;
    background-color: #ffffff;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    color: #525252;
    outline: none;
    transition: all 0.2s;
  }

  .dashboard-select:hover {
    background-color: #fafafa;
  }

  .dashboard-select:focus {
    border-color: #d4d4d4;
    box-shadow: 0 0 0 2px #f5f5f5;
  }

  .dashboard-mock-text {
    font-size: 13px;
    color: #a3a3a3;
  }

  .dashboard-error {
    border-radius: 8px;
    border: 1px solid #fecaca;
    background-color: #fff1f2;
    padding: 16px;
    font-size: 14px;
    color: #b91c1c;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (min-width: 1280px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .charts-grid {
    display: grid;
    gap: 12px;
  }

  @media (min-width: 1024px) {
    .charts-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .main-content-grid {
    display: grid;
    gap: 12px;
  }

  @media (min-width: 1024px) {
    .main-content-grid {
      grid-template-columns: 1.6fr 1fr;
    }
  }
`;
/* ================================================ */

export function DashboardView() {
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const dashboard = useDashboardStats(timeframe);

  // Inject CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = dashboardStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (dashboard.error) {
    return (
      <div className="dashboard-error">
        Dashboard data could not be loaded.
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        
        <div className="dashboard-controls">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
            className="dashboard-select"
          >
            <option value="day">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
          <span className="dashboard-mock-text">
            Dữ liệu mô phỏng — Mock Data
          </span>
        </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="stats-grid">
        {dashboard.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Row 2: Charts */}
      {dashboard.chartData && dashboard.chartData.length > 0 && (
        <div className="charts-grid">
          <FinancialChart data={dashboard.chartData} />
          <ActivityChart data={dashboard.chartData} />
        </div>
      )}

      {/* Row 3: Transactions + Pending Approvals */}
      <div className="main-content-grid">
        <TransactionList transactions={dashboard.recentTransactions} />
        <PendingApprovals items={dashboard.pendingInvoices} />
      </div>

      {/* Row 4: Quick Actions */}
      <QuickActions />
    </div>
  );
}