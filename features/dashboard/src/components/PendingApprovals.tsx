// // features/dashboard/src/components/PendingApprovals.tsx
// import { FileText } from "lucide-react";

// // Tạo type linh hoạt hơn
// interface PendingItem {
//   id: string;
//   code: string;      // có thể là invoiceNumber hoặc code
//   amount: number | string;
//   submitter: string; // có thể là senderName hoặc submitter
// }

// function formatVND(amount: number | string): string {
//   const num = typeof amount === "string" ? Number(amount) : amount;
//   if (isNaN(num)) return "0";
//   return num.toLocaleString("vi-VN");
// }

// function formatDate(dateStr: string): string {
//   const date = new Date(dateStr);
//   const now = new Date();
  
//   const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
//   const diffDays = Math.floor(
//     (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
//   );
  
//   const time = date.toLocaleTimeString("vi-VN", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   if (diffDays === 0) return `Hôm nay, ${time}`;
//   if (diffDays === 1) return `Hôm qua, ${time}`;
  
//   const day = date.getDate().toString().padStart(2, '0');
//   const month = (date.getMonth() + 1).toString().padStart(2, '0');
//   const year = date.getFullYear();

//   return `${time}, ${day}/${month}/${year}`;
// }

// // Props có thể nhận nhiều dạng khác nhau
// export function PendingApprovals({
//   items
// }: {
//   items: Array<{
//     id: string;
//     invoiceNumber?: string;
//     code?: string;
//     total?: string | number;
//     amount?: string | number;
//     senderName?: string;
//     submitter?: string;
//     date?: string;
//   }>
// }) {
//   const formattedItems = items.map(item => ({
//     id: item.id,
//     code: item.invoiceNumber || item.code || "N/A",
//     amount: item.total ?? item.amount ?? 0,
//     submitter: item.senderName || item.submitter || "Unknown",
//     date: item.date || new Date().toISOString(),
//   }));

//   return (
//     <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
//       <div className="border-b border-neutral-100 px-5 py-4">
//         <h2 className="text-[13px] font-semibold uppercase tracking-wider text-neutral-400">
//           Chờ duyệt
//         </h2>
//       </div>

//       <div className="divide-y divide-neutral-100">
//         {formattedItems.map((item, i) => (
//           <article key={item.id} className="flex items-center gap-3 px-5 py-3.5">
//             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
//               <FileText className="h-4 w-4" strokeWidth={2} />
//             </div>

//             <div className="min-w-0 flex-1">
//               <p className="truncate text-[14px] font-medium text-neutral-800">
//                 {item.code}
//               </p>
//               <p className="text-[12px] text-neutral-400 mt-0.5">
//                 ₫{formatVND(item.amount)} · {item.submitter}
//               </p>
//               <p className="text-[11px] text-neutral-400 mt-0.5">
//                 {formatDate(item.date)}
//               </p>
//             </div>

//             <button 
//               onClick={() => {
//                 import("../api/mock-api").then(({ mockDashboardAPI }) => {
//                   mockDashboardAPI.approvePendingItem(item.id);
//                 });
//               }}
//               className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
//               Duyệt
//             </button>
//           </article>
//         ))}

//         {formattedItems.length === 0 && (
//           <p className="py-8 text-center text-sm text-neutral-400">
//             Không có hóa đơn chờ duyệt.
//           </p>
//         )}
//       </div>
//     </section>
//   );
// }
// features/dashboard/src/components/PendingApprovals.tsx
import { useEffect } from "react";
import { FileText } from "lucide-react";

// Tạo type linh hoạt hơn
interface PendingItem {
  id: string;
  code: string;
  amount: number | string;
  submitter: string;
}

function formatVND(amount: number | string): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(num)) return "0";
  return num.toLocaleString("vi-VN");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  
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

/* ====================== CSS ====================== */
const pendingApprovalsStyles = `
  .pending-approvals-container {
    border-radius: 12px;
    border: 1px solid #e5e5e5;
    background-color: #ffffff;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    overflow: hidden;
  }

  .pending-approvals-header {
    border-bottom: 1px solid #f3f3f3;
    padding: 16px 20px;
  }

  .pending-approvals-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #a3a3a3;
  }

  .pending-approvals-list {
    display: flex;
    flex-direction: column;
    divide-width: 1px;
    divide-color: #f3f3f3;
  }

  .pending-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
  }

  .pending-icon {
    display: flex;
    height: 36px;
    width: 36px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: #fef3c7;
    color: #d97706;
    flex-shrink: 0;
  }

  .pending-content {
    min-width: 0;
    flex: 1;
  }

  .pending-code {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pending-amount {
    font-size: 12px;
    color: #a3a3a3;
    margin-top: 2px;
  }

  .pending-date {
    font-size: 11px;
    color: #a3a3a3;
    margin-top: 2px;
  }

  .pending-approve-btn {
    flex-shrink: 0;
    border-radius: 8px;
    border: 1px solid #e5e5e5;
    background-color: #ffffff;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    color: #525252;
    transition: all 0.2s;
  }

  .pending-approve-btn:hover {
    background-color: #fafafa;
  }

  .pending-empty {
    padding: 32px 20px;
    text-align: center;
    font-size: 14px;
    color: #a3a3a3;
  }
`;
/* ================================================ */

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
    date?: string;
  }>
}) {
  const formattedItems = items.map(item => ({
    id: item.id,
    code: item.invoiceNumber || item.code || "N/A",
    amount: item.total ?? item.amount ?? 0,
    submitter: item.senderName || item.submitter || "Unknown",
    date: item.date || new Date().toISOString(),
  }));

  // Inject CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = pendingApprovalsStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section className="pending-approvals-container">
      <div className="pending-approvals-header">
        <h2 className="pending-approvals-title">
          Chờ duyệt
        </h2>
      </div>

      <div className="pending-approvals-list">
        {formattedItems.map((item) => (
          <article key={item.id} className="pending-item">
            <div className="pending-icon">
              <FileText className="h-4 w-4" strokeWidth={2} />
            </div>

            <div className="pending-content">
              <p className="pending-code">
                {item.code}
              </p>
              <p className="pending-amount">
                ₫{formatVND(item.amount)} · {item.submitter}
              </p>
              <p className="pending-date">
                {formatDate(item.date)}
              </p>
            </div>

            <button 
              onClick={() => {
                import("../api/mock-api").then(({ mockDashboardAPI }) => {
                  mockDashboardAPI.approvePendingItem(item.id);
                });
              }}
              className="pending-approve-btn"
            >
              Duyệt
            </button>
          </article>
        ))}

        {formattedItems.length === 0 && (
          <p className="pending-empty">
            Không có hóa đơn chờ duyệt.
          </p>
        )}
      </div>
    </section>
  );
}