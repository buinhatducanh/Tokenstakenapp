import { ArrowUp, ArrowDown } from "lucide-react";
import type { DashboardStat } from "../dashboard.types";

const iconColor: Record<string, string> = {
  emerald: "text-emerald-600",
  rose: "text-rose-500",
  amber: "text-amber-600",
  blue: "text-blue-500",
};

export function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = stat.icon;
  const isUp = stat.trendDirection === "up";
  const TrendIcon = isUp ? ArrowUp : ArrowDown;
  const trendColor =
    stat.tone === "rose" ? "text-rose-500" : "text-emerald-600";

  return (
    <section className="flex flex-col rounded-lg bg-neutral-100 p-4">
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <Icon
          className={`h-[15px] w-[15px] ${iconColor[stat.tone]}`}
          strokeWidth={2.5}
        />
        <p className="text-[12px] text-neutral-500">{stat.label}</p>
      </div>

      {/* Value */}
      <p className="mt-2 text-[22px] font-medium leading-none text-neutral-900">
        {stat.value}
      </p>

      {/* Trend or detail */}
      {stat.trend ? (
        <div
          className={`mt-1.5 flex items-center gap-1 text-[12px] font-medium ${trendColor}`}
        >
          <TrendIcon className="h-3 w-3" strokeWidth={2.5} />
          <span>{stat.trend}</span>
        </div>
      ) : (
        <p className="mt-1.5 text-[12px] text-neutral-400">{stat.detail}</p>
      )}
    </section>
  );
}