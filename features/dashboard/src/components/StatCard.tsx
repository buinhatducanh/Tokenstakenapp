// features/dashboard/src/components/StatCard.tsx
import { ArrowUp, ArrowDown } from "lucide-react";
import type { DashboardStat } from "../dashboard.types";

const toneConfig: Record<
  string,
  { icon: string; trend: string; bg: string; border: string }
> = {
  emerald: {
    icon: "text-emerald-500",
      trend: "text-emerald-600",
        bg: "bg-emerald-50",
          border: "border-emerald-100",
  },
  rose: {
    icon: "text-rose-500",
      trend: "text-rose-500",
        bg: "bg-rose-50",
          border: "border-rose-100",
  },
  amber: {
    icon: "text-amber-500",
      trend: "text-amber-600",
        bg: "bg-amber-50",
          border: "border-amber-100",
  },
  blue: {
    icon: "text-blue-500",
      trend: "text-blue-600",
        bg: "bg-blue-50",
          border: "border-blue-100",
  },
};

export function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = stat.icon;
  const cfg = toneConfig[stat.tone];
  const isUp = stat.trendDirection === "up";
  const TrendIcon = isUp ? ArrowUp : ArrowDown;

  return (
    <section
      className={`flex flex-col rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-center gap-2">
        <div className={`rounded-md p-1.5 ${cfg.bg}`}>
          <Icon className={`h-4 w-4 ${cfg.icon}`} strokeWidth={2.5} />
        </div>
        <p className="text-[13px] font-medium text-neutral-500">{stat.label}</p>
      </div>

      <p className="mt-3 text-[26px] font-semibold tracking-tight text-neutral-900">
        {stat.value}
      </p>

      {stat.trend ? (
        <div
          className={`mt-1.5 flex items-center gap-1 text-[12px] font-medium ${cfg.trend}`}
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