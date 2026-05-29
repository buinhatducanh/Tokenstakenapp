// // features/dashboard/src/components/StatCard.tsx
// import { ArrowUp, ArrowDown } from "lucide-react";
// import type { DashboardStat } from "../dashboard.types";

// const iconColor: Record<string, string> = {
//   emerald: "text-emerald-600",
//   rose: "text-rose-500",
//   amber: "text-amber-600",
//   blue: "text-blue-500",
// };

// export function StatCard({ stat }: { stat: DashboardStat }) {
//   // Kiểm tra nếu icon là null hoặc undefined thì không render
//   const Icon = stat.icon;
//   const isUp = stat.trendDirection === "up";
//   const TrendIcon = isUp ? ArrowUp : ArrowDown;
//   const trendColor =
//     stat.tone === "rose" ? "text-rose-500" : "text-emerald-600";

//   return (
//     <section className="flex flex-col rounded-lg bg-neutral-100 p-4">
//       {/* Label row */}
//       <div className="flex items-center gap-1.5">
//         {/* Chỉ render Icon nếu nó tồn tại và là function/component */}
//         {Icon && typeof Icon === 'function' && (
//           <Icon
//             className={`h-[15px] w-[15px] ${iconColor[stat.tone]}`}
//             strokeWidth={2.5}
//           />
//         )}
//         <p className="text-[12px] text-neutral-500">{stat.label}</p>
//       </div>

//       {/* Value */}
//       <p className="mt-2 text-[22px] font-medium leading-none text-neutral-900">
//         {stat.value}
//       </p>

//       {/* Trend or detail */}
//       {stat.trend ? (
//         <div
//           className={`mt-1.5 flex items-center gap-1 text-[12px] font-medium ${trendColor}`}
//         >
//           <TrendIcon className="h-3 w-3" strokeWidth={2.5} />
//           <span>{stat.trend}</span>
//         </div>
//       ) : (
//         <p className="mt-1.5 text-[12px] text-neutral-400">{stat.detail}</p>
//       )}
//     </section>
//   );
// }

// features/dashboard/src/components/StatCard.tsx
import { useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { DashboardStat } from "../dashboard.types";

const iconColor: Record<string, string> = {
  emerald: "#10b981",
  rose: "#f43f5e",
  amber: "#d97706",
  blue: "#3b82f6",
};

/* ====================== CSS ====================== */
const statCardStyles = `
  .stat-card {
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    background-color: #f5f5f5;
    padding: 16px;
  }

  .stat-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stat-icon {
    height: 15px;
    width: 15px;
    flex-shrink: 0;
  }

  .stat-label {
    font-size: 12px;
    color: #737373;
  }

  .stat-value {
    margin-top: 8px;
    font-size: 22px;
    font-weight: 500;
    line-height: 1;
    color: #171717;
  }

  .stat-trend {
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .stat-detail {
    margin-top: 6px;
    font-size: 12px;
    color: #a3a3a3;
  }
`;
/* ================================================ */

export function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = stat.icon;
  const isUp = stat.trendDirection === "up";
  const TrendIcon = isUp ? ArrowUp : ArrowDown;
  const trendColor = stat.tone === "rose" ? "#f43f5e" : "#10b981";

  // Inject CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = statCardStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section className="stat-card">
      {/* Label row */}
      <div className="stat-header">
        {Icon && typeof Icon === 'function' && (
          <Icon
            className="stat-icon"
            style={{ color: iconColor[stat.tone] }}
            strokeWidth={2.5}
          />
        )}
        <p className="stat-label">{stat.label}</p>
      </div>

      {/* Value */}
      <p className="stat-value">
        {stat.value}
      </p>

      {/* Trend or detail */}
      {stat.trend ? (
        <div
          className="stat-trend"
          style={{ color: trendColor }}
        >
          <TrendIcon className="h-3 w-3" strokeWidth={2.5} />
          <span>{stat.trend}</span>
        </div>
      ) : (
        <p className="stat-detail">{stat.detail}</p>
      )}
    </section>
  );
}