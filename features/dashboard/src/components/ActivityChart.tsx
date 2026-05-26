import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "../api/mock-api";

export function ActivityChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-neutral-400">
        Giao dịch & Chờ duyệt
      </h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#737373" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#737373" }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "#f5f5f5" }}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
            <Bar dataKey="approvedCount" name="Đã giao dịch" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="pendingCount" name="Chờ duyệt" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
