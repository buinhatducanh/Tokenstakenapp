// import { FilePlus2, Plus, BarChart2, Clock } from "lucide-react";
// import { Link } from "react-router";

// const actions = [
//   { label: "Tạo hóa đơn mới", href: "/invoices/new", icon: FilePlus2 },
//   { label: "Tạo giao dịch", href: "/transactions/new", icon: Plus },
//   { label: "Xem báo cáo", href: "/reports", icon: BarChart2 },
//   { label: "Chờ duyệt (7)", href: "/invoices?status=pending", icon: Clock },
// ];

// export function QuickActions() {
//   return (
//     <section className="rounded-lg border border-neutral-200 bg-white p-4">
//       <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wide text-neutral-400">
//         Thao tác nhanh
//       </h2>

//       <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
//         {actions.map((action) => {
//           const Icon = action.icon;
//           return (
//             <Link
//               key={action.label}
//               to={action.href}
//               className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-[13px] text-neutral-700 transition-colors hover:bg-neutral-50"
//             >
//               <Icon className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} />
//               <span className="truncate">{action.label}</span>
//             </Link>
//           );
//         })}
//       </div>
//     </section>
//   );
// }
// import { FilePlus2, Plus, BarChart2, Clock } from "lucide-react";

// const actions = [
//   { label: "Tạo hóa đơn mới", href: "/invoices/new", icon: FilePlus2 },
//   { label: "Tạo giao dịch", href: "/transactions/new", icon: Plus },
//   { label: "Xem báo cáo", href: "/reports", icon: BarChart2 },
//   { label: "Chờ duyệt (7)", href: "/invoices?status=pending", icon: Clock },
// ];

// export function QuickActions() {
//   return (
//     <section className="rounded-lg border border-neutral-200 bg-white p-4">
//       <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wide text-neutral-400">
//         Thao tác nhanh
//       </h2>

//       <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
//         {actions.map((action) => {
//           const Icon = action.icon;

//           return (
//             <button
//               key={action.label}
//               onClick={() => (window.location.href = action.href)}
//               className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-[13px] text-neutral-700 transition-colors hover:bg-neutral-50"
//             >
//               <Icon className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} />
//               <span className="truncate">{action.label}</span>
//             </button>
//           );
//         })}
//       </div>
//     </section>
//   );
// }

// features/dashboard/src/components/QuickActions.tsx
import { useEffect } from "react";
import { FilePlus2, Plus, BarChart2, Clock } from "lucide-react";

const actions = [
  { label: "Tạo hóa đơn mới", href: "/invoices/new", icon: FilePlus2 },
  { label: "Tạo giao dịch", href: "/transactions/new", icon: Plus },
  { label: "Xem báo cáo", href: "/reports", icon: BarChart2 },
  { label: "Chờ duyệt (7)", href: "/invoices?status=pending", icon: Clock },
];

/* ====================== CSS ====================== */
const quickActionsStyles = `
  .quick-actions-container {
    border-radius: 12px;
    border: 1px solid #e5e5e5;
    background-color: #ffffff;
    padding: 16px;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .quick-actions-title {
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #a3a3a3;
  }

  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  @media (min-width: 640px) {
    .quick-actions-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .quick-action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 6px;
    border: 1px solid #e5e5e5;
    background-color: #ffffff;
    padding: 10px 12px;
    font-size: 13px;
    color: #444444;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
  }

  .quick-action-btn:hover {
    background-color: #fafafa;
  }

  .quick-action-icon {
    flex-shrink: 0;
    color: #a3a3a3;
  }
`;
/* ================================================ */

export function QuickActions() {
  // Inject CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = quickActionsStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section className="quick-actions-container">
      <h2 className="quick-actions-title">
        Thao tác nhanh
      </h2>

      <div className="quick-actions-grid">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              onClick={() => (window.location.href = action.href)}
              className="quick-action-btn"
            >
              <Icon className="quick-action-icon h-4 w-4" strokeWidth={2} />
              <span className="truncate">{action.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}