import { FilePlus2, Plus, BarChart2, Clock } from "lucide-react";
import { Link } from "react-router";

const actions = [
  { label: "Tạo hóa đơn mới", href: "/invoices/new", icon: FilePlus2 },
  { label: "Tạo giao dịch", href: "/transactions/new", icon: Plus },
  { label: "Xem báo cáo", href: "/reports", icon: BarChart2 },
  { label: "Chờ duyệt (7)", href: "/invoices?status=pending", icon: Clock },
];

export function QuickActions() {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wide text-neutral-400">
        Thao tác nhanh
      </h2>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.href}
              className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-[13px] text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <Icon className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} />
              <span className="truncate">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}