import type { CashFlowReportData } from "../report.types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet, ArrowRightLeft } from "lucide-react";

const formatMoney = (amount: string, currency: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount));

const COLORS = ['#10b981', '#f43f5e']; // emerald for inflow, rose for outflow

export const CashFlowReport = ({ data }: { data: CashFlowReportData }) => {
  const inflow = Number(data.totals.totalInflow.amount);
  const outflow = Number(data.totals.totalOutflow.amount);

  const chartData = [
    { name: "Cash In", value: inflow, originalValue: inflow },
    { name: "Cash Out", value: outflow, originalValue: outflow }
  ].filter(item => item.value > 0);

  const netCash = Number(data.totals.netCashFlow.amount);
  const isPositive = netCash >= 0;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Background decoration */}
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-emerald-50 opacity-50 blur-3xl" />
      
      <div className="relative z-10 flex items-center justify-between pb-6 border-b border-neutral-100">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Wallet className="w-4 h-4" />
            </div>
            Cash Flow Tracker
          </h2>
          <span className="text-[13px] text-neutral-500 mt-1 block">
            {data.range.from} — {data.range.to}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-8 relative z-10">
        {/* Chart Section */}
        {chartData.length > 0 ? (
          <div className="h-[140px] w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Cash In' ? COLORS[0] : COLORS[1]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(_val: number, name: string, props: any) => 
                    [formatMoney(props.payload.originalValue.toString(), data.currency), name]
                  }
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[140px] w-[140px] shrink-0 flex items-center justify-center rounded-full border-2 border-dashed border-neutral-200">
            <span className="text-xs text-neutral-400">No data</span>
          </div>
        )}

        {/* Details Section */}
        <div className="w-full space-y-4">
          <ul className="space-y-3">
            {/* Inflow */}
            <li className="flex items-center justify-between text-[13px] group">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full block bg-emerald-500" />
                <span className="font-medium text-neutral-600 group-hover:text-emerald-600 transition-colors">Cash In (Tiền vào)</span>
              </div>
              <span className="font-semibold text-emerald-700">
                +{formatMoney(data.totals.totalInflow.amount, data.currency)}
              </span>
            </li>
            
            {/* Outflow */}
            <li className="flex items-center justify-between text-[13px] group">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full block bg-rose-500" />
                <span className="font-medium text-neutral-600 group-hover:text-rose-600 transition-colors">Cash Out (Tiền ra)</span>
              </div>
              <span className="font-semibold text-rose-700">
                -{formatMoney(data.totals.totalOutflow.amount, data.currency)}
              </span>
            </li>
          </ul>

          <div className={`mt-2 flex items-center justify-between rounded-xl px-4 py-3 border ${isPositive ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
            <span className="text-[13px] font-medium text-neutral-600 flex items-center gap-2">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Net Change
            </span>
            <span className={`font-bold text-[15px] ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isPositive ? '+' : ''}{formatMoney(data.totals.netCashFlow.amount, data.currency)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
