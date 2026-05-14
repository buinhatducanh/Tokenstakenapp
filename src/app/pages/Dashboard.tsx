import React from "react";
import { ArrowDownRight, ArrowUpRight, DollarSign, FileText, Activity } from "lucide-react";

export function Dashboard() {
  const stats = [
    { name: "Total Revenue", value: "$45,231.89", change: "+20.1%", trend: "up" },
    { name: "Pending Invoices", value: "12", change: "-2", trend: "down" },
    { name: "Cash Flow", value: "+$12,400.00", change: "+4.5%", trend: "up" },
    { name: "Total Expenses", value: "$32,831.89", change: "+2.4%", trend: "up" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Overview of your financial performance.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-neutral-500 mb-4">
              <span className="text-sm font-medium">{stat.name}</span>
              {i === 0 && <DollarSign className="h-4 w-4" />}
              {i === 1 && <FileText className="h-4 w-4" />}
              {i === 2 && <Activity className="h-4 w-4" />}
              {i === 3 && <DollarSign className="h-4 w-4" />}
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-semibold text-neutral-900">{stat.value}</div>
              <div className={`flex items-center text-xs font-medium ${stat.trend === 'up' && i !== 3 ? 'text-emerald-600' : stat.trend === 'down' && i === 1 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-medium">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Company {String.fromCharCode(64 + i)}</div>
                    <div className="text-xs text-neutral-500">Invoice #{2024000 + i}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-neutral-900">+$1,250.00</div>
                  <div className="text-xs text-emerald-600">Paid</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Pending Approvals</h3>
          <div className="space-y-4">
            {[5, 6, 7].map((i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                <div>
                  <div className="text-sm font-medium text-neutral-900">Supplier {String.fromCharCode(64 + i)}</div>
                  <div className="text-xs text-neutral-500">Due in {i} days</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-neutral-900">-$3,400.00</div>
                  <button className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded hover:bg-indigo-100 transition-colors">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
