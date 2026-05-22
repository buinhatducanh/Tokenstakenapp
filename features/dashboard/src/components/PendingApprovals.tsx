// features/dashboard/src/components/PendingApprovals.tsx
import { FileText } from "lucide-react";

// Tạo type linh hoạt hơn
interface PendingItem {
  id: string;
  code: string;      // có thể là invoiceNumber hoặc code
  amount: number | string;
  submitter: string; // có thể là senderName hoặc submitter
}

function formatVND(amount: number | string): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(num)) return "0";
  return num.toLocaleString("vi-VN");
}

// Props có thể nhận nhiều dạng khác nhau
export function PendingApprovals({
  items
}: {
  items: Array<{
    id: string;
    invoiceNumber?: string;
    code?: string;
    total?: string | number;
    amount?: string | number;
    senderName?: string;
    submitter?: string;
  }>
}) {
  const formattedItems = items.map(item => ({
    id: item.id,
    code: item.invoiceNumber || item.code || "N/A",
    amount: item.total ?? item.amount ?? 0,
    submitter: item.senderName || item.submitter || "Unknown",
  }));

  return (
    <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-neutral-400">
          Chờ duyệt
        </h2>
      </div>

      <div className="divide-y divide-neutral-100">
        {formattedItems.map((item, i) => (
          <article key={item.id} className="flex items-center gap-3 px-5 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <FileText className="h-4 w-4" strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-neutral-800">
                {item.code}
              </p>
              <p className="text-[12px] text-neutral-400">
                ₫{formatVND(item.amount)} · {item.submitter}
              </p>
            </div>

            <button 
              onClick={() => {
                import("../api/mock-api").then(({ mockDashboardAPI }) => {
                  mockDashboardAPI.approvePendingItem(item.id);
                });
              }}
              className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
              Duyệt
            </button>
          </article>
        ))}

        {formattedItems.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">
            Không có hóa đơn chờ duyệt.
          </p>
        )}
      </div>
    </section>
  );
}