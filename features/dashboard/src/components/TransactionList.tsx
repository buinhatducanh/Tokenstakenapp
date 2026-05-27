import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import type { Transaction } from "@packages/shared-types";

function formatVND(amount: string | number): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(num)) return "0";
  return num.toLocaleString("vi-VN");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  
  // Normalize to start of day for accurate day diff
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Hôm nay, ${time}`;
  if (diffDays === 1) return `Hôm qua, ${time}`;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${time}, ${day}/${month}/${year}`;
}

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wide text-neutral-400">
        Giao dịch gần đây
      </h2>

      <div className="flex flex-col">
        {transactions.map((tx, i) => {
          const isPending = tx.status === "PENDING";
          const isIncome = tx.type === "INCOME";

          const Icon = isPending
            ? Clock
            : isIncome
              ? ArrowDownLeft
              : ArrowUpRight;

          // Icon circle colors — match HTML: in=green, out=red, pend=amber
          const iconCls = isPending
            ? "bg-amber-50 text-amber-700"
            : isIncome
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700";

          // Amount color
          const amountCls = isPending
            ? "text-neutral-500"
            : isIncome
              ? "text-emerald-700"
              : "text-rose-600";

          const prefix = isPending ? "" : isIncome ? "+" : "−";

          return (
            <article
              key={tx.id}
              className={`flex items-center gap-2.5 py-2 ${i < transactions.length - 1
                ? "border-b border-neutral-100"
                : ""
                }`}
            >
              {/* Icon */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconCls}`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </div>

              {/* Name + date */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-neutral-800">
                  {tx.description ?? tx.reference}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {formatDate(tx.date)}
                </p>
              </div>

              {/* Amount */}
              <p className={`shrink-0 text-[13px] font-medium ${amountCls}`}>
                {prefix}₫{formatVND(tx.amount)}
              </p>
            </article>
          );
        })}

        {transactions.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400">
            Chưa có giao dịch nào.
          </p>
        )}
      </div>
    </section>
  );
}