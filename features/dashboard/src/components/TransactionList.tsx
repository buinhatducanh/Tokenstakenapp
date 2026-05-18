// features/dashboard/src/components/TransactionList.tsx
import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import type { Transaction } from "@packages/shared-types";

function formatVND(amountStr: string): string {
  return Number(amountStr).toLocaleString("vi-VN");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (diffDays === 0) return `Hôm nay, ${time}`;
  if (diffDays === 1) return `Hôm qua, ${time}`;
  return `${diffDays} ngày trước`;
}

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-neutral-400">
          Giao dịch gần đây
        </h2>
      </div>

      <div className="divide-y divide-neutral-100">
        {transactions.map((tx) => {
          const isPending = tx.status === "PENDING";
          const isIncome = tx.type === "INCOME";

          const Icon = isPending
            ? Clock
            : isIncome
              ? ArrowDownLeft
              : ArrowUpRight;

          const iconCls = isPending
            ? "bg-amber-50 text-amber-500"
            : isIncome
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-500";

          const amountCls = isPending
            ? "text-neutral-500"
            : isIncome
              ? "text-emerald-600"
              : "text-rose-500";

          const prefix = isPending ? "" : isIncome ? "+" : "−";

          return (
            <article
              key={tx.id}
              className="flex items-center gap-3 px-5 py-3.5"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconCls}`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-neutral-800">
                  {tx.description ?? tx.reference}
                </p>
                <p className="text-[12px] text-neutral-400">
                  {formatDate(tx.date)}
                </p>
              </div>

              <p className={`shrink-0 text-[14px] font-semibold ${amountCls}`}>
                {prefix}₫{formatVND(tx.amount)}
              </p>
            </article>
          );
        })}

        {transactions.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">
            Chưa có giao dịch nào.
          </p>
        )}
      </div>
    </section>
  );
}