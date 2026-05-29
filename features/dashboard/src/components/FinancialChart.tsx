// import {
//   Bar,
//   CartesianGrid,
//   ComposedChart,
//   Legend,
//   Line,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import type { ChartDataPoint } from "../api/mock-api";

// export function FinancialChart({ data }: { data: ChartDataPoint[] }) {
//   return (
//     <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
//       <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-neutral-400">
//         Tổng quan Tài chính
//       </h2>
//       <div className="h-[300px] w-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
//             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
//             <XAxis
//               dataKey="period"
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12, fill: "#737373" }}
//               dy={10}
//             />
//             <YAxis
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12, fill: "#737373" }}
//               tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
//               width={50}
//             />
//             <Tooltip
//               formatter={(value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)}
//               cursor={{ fill: "#f5f5f5" }}
//               contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
//             />
//             <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
//             <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
//             <Bar dataKey="expenses" name="Chi phí" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
//             <Line type="monotone" dataKey="cashflow" name="Dòng tiền" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
//           </ComposedChart>
//         </ResponsiveContainer>
//       </div>
//     </section>
//   );
// }
// features/dashboard/src/components/FinancialChart.tsx
import { useEffect } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "../api/mock-api";

/* ====================== CSS ====================== */
const financialChartStyles = `
  .financial-chart-container {
    border-radius: 12px;
    border: 1px solid #e5e5e5;
    background-color: #ffffff;
    padding: 16px;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .financial-chart-title {
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #a3a3a3;
  }

  .financial-chart-wrapper {
    height: 300px;
    width: 100%;
  }
`;
/* ================================================ */

export function FinancialChart({ data }: { data: ChartDataPoint[] }) {
  // Inject CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = financialChartStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section className="financial-chart-container">
      <h2 className="financial-chart-title">
        Tổng quan Tài chính
      </h2>
      <div className="financial-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              width={50}
            />
            <Tooltip
              formatter={(value: number | string) => [
                new Intl.NumberFormat("vi-VN", { 
                  style: "currency", 
                  currency: "VND" 
                }).format(Number(value)),
                ""
              ]}
              cursor={{ fill: "#f5f5f5" }}
              contentStyle={{ 
                borderRadius: "8px", 
                border: "none", 
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" 
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
            <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expenses" name="Chi phí" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Line 
              type="monotone" 
              dataKey="cashflow" 
              name="Dòng tiền" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}