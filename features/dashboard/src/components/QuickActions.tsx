// features/dashboard/src/components/QuickActions.tsx
import { FilePlus2, Plus, BarChart2, Clock } from "lucide-react";

const actions = [
  { label: "Tạo hóa đơn mới", href: "/invoices/new", icon: FilePlus2 },
  { label: "Tạo giao dịch", href: "/transactions/new", icon: Plus },
  { label: "Xem báo cáo", href: "/reports", icon: BarChart2 },
  { label: "Chờ duyệt (7)", href: "/invoices?status=pending", icon: Clock },
];

export function QuickActions() {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-neutral-400">
        Thao tác nhanh
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-[13px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              <Icon className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} />
              <span className="truncate">{action.label}</span>
            </a>
          );
        })}
    </div>
    </section >
  );
}