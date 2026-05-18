// features/dashboard/src/components/PendingApprovals.tsx
import { FileText } from "lucide-react";
import type { Invoice } from "@packages/shared-types";

function formatVND(amountStr: string): string {
  return Number(amountStr).toLocaleString("vi-VN");
}

const iconColors = [
  "bg-amber-50 text-amber-500",
  "bg-amber-50 text-amber-500",
  "bg-rose-50 text-rose-500",
  "bg-emerald-50 text-emerald-600",
];

export function PendingApprovals({ invoices }: { invoices: Invoice[] }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-neutral-400">
          Chờ duyệt
        </h2>
      </div>

      <div className="divide-y divide-neutral-100">
        {invoices.map((invoice, i) => (
          <article
            key={invoice.id}
            className="flex items-center gap-3 px-5 py-3.5"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconColors[i % iconColors.length]}`}
            >
              <FileText className="h-4 w-4" strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-neutral-800">
                {invoice.invoiceNumber}
              </p>
              <p className="text-[12px] text-neutral-400">
                ₫{formatVND(invoice.total)} · {invoice.senderName}
              </p>
            </div>

            <button className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
              Duyệt
            </button>
          </article>
        ))}

        {invoices.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">
            Không có hóa đơn chờ duyệt.
          </p>
        )}
      </div>
    </section>
  );
}