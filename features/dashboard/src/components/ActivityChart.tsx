// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Legend,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import type { ChartDataPoint } from "../api/mock-api";

// export function ActivityChart({ data }: { data: ChartDataPoint[] }) {
//   return (
//     <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
//       <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-neutral-400">
//         Giao dịch & Chờ duyệt
//       </h2>
//       <div className="h-[300px] w-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
//               allowDecimals={false}
//             />
//             <Tooltip
//               cursor={{ fill: "#f5f5f5" }}
//               contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
//             />
//             <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
//             <Bar dataKey="approvedCount" name="Đã giao dịch" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
//             <Bar dataKey="pendingCount" name="Chờ duyệt" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </section>
//   );
// }
// features/dashboard/src/components/ActivityChart.tsx
import { useEffect } from "react";
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

/* ====================== CSS ====================== */
const activityChartStyles = `
  .activity-chart-container {
    border-radius: 12px;
    border: 1px solid #e5e5e5;
    background-color: #ffffff;
    padding: 16px;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .activity-chart-title {
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #a3a3a3;
  }

  .activity-chart-wrapper {
    height: 300px;
    width: 100%;
  }
`;
/* ================================================ */

export function ActivityChart({ data }: { data: ChartDataPoint[] }) {
  // Inject CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = activityChartStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section className="activity-chart-container">
      <h2 className="activity-chart-title">
        Giao dịch & Chờ duyệt
      </h2>
      <div className="activity-chart-wrapper">
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
              contentStyle={{ 
                borderRadius: "8px", 
                border: "none", 
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" 
              }}
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