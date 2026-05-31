import type { PnlReportData } from "../report.types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const formatMoney = (amount: string, currency: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount));

export const PnlReport = ({ data }: { data: PnlReportData }) => {
  const chartData = [
    { name: "Revenue", value: Number(data.totals.totalRevenue.amount) },
    { name: "Expenses", value: Number(data.totals.totalExpenses.amount) },
  ];

  const netProfitVal = Number(data.totals.netProfit.amount);
  const isProfit = netProfitVal >= 0;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-50 opacity-50 blur-3xl" />
      
      <div className="relative z-10 flex items-center justify-between pb-6 border-b border-neutral-100">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
            Profit & Loss
          </h2>
          <span className="text-[13px] text-neutral-500 mt-1 block">
            {data.range.from} — {data.range.to}
          </span>
        </div>
        <div className={`text-right px-4 py-2 rounded-xl border ${isProfit ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-0.5">Net Profit</p>
          <div className={`flex items-center gap-1.5 font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-lg">{formatMoney(data.totals.netProfit.amount, data.totals.netProfit.currency)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Chart Section */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(val: number) => formatMoney(val.toString(), data.currency)}
              />
              <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Revenue' ? '#3b82f6' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Details Section */}
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 block" /> Revenue
            </p>
            <ul className="space-y-2.5">
              {data.revenue.length > 0 ? data.revenue.map((line) => (
                <li key={`${line.accountCode ?? line.label}`} className="flex items-center justify-between text-[13px] group">
                  <span className="text-neutral-600 font-medium group-hover:text-blue-600 transition-colors">{line.label}</span>
                  <span className="font-semibold text-neutral-900">{formatMoney(line.total.amount, line.total.currency)}</span>
                </li>
              )) : <li className="text-[13px] text-neutral-400 italic">No revenue recorded</li>}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 block" /> Expenses
            </p>
            <ul className="space-y-2.5">
              {data.expenses.length > 0 ? data.expenses.map((line) => (
                <li key={`${line.accountCode ?? line.label}`} className="flex items-center justify-between text-[13px] group">
                  <span className="text-neutral-600 font-medium group-hover:text-rose-600 transition-colors">{line.label}</span>
                  <span className="font-semibold text-neutral-900">{formatMoney(line.total.amount, line.total.currency)}</span>
                </li>
              )) : <li className="text-[13px] text-neutral-400 italic">No expenses recorded</li>}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
