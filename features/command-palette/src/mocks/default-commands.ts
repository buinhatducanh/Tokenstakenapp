import type { CommandRegistry } from "@packages/shared-types";

export function registerDefaultMockCommands(
  registry: CommandRegistry,
  navigate: (path: string) => void
) {
  // --- Auth Commands ---
  registry.register({
    id: "auth-group",
    label: "Tài khoản (Account)",
    items: [
      {
        id: "auth:logout",
        label: "Đăng xuất",
        description: "Đăng xuất khỏi tài khoản hiện tại",
        keywords: ["logout", "dang xuat", "sign out", "thoat"],
        action: () => {
          navigate("/login");
        },
      },
      {
        id: "auth:switch-org",
        label: "Chuyển tổ chức",
        description: "Chọn tổ chức khác để làm việc",
        keywords: ["switch org", "chuyen to chuc", "organization", "workspace"],
        action: () => {
          navigate("/login");
        },
      },
    ],
  });

  // --- Invoice Commands ---
  registry.register({
    id: "invoice-group",
    label: "Hóa đơn (Invoices)",
    items: [
      {
        id: "invoice:create",
        label: "Tạo hóa đơn mới",
        description: "Mở form tạo hóa đơn",
        shortcut: "Ctrl+I",
        keywords: ["new invoice", "create", "tao hoa don", "them moi"],
        action: () => {
          navigate("/invoices");
        },
      },
      {
        id: "invoice:approve",
        label: "Duyệt hóa đơn",
        description: "Xem danh sách hóa đơn chờ duyệt",
        shortcut: "Ctrl+E",
        keywords: ["approve", "duyet", "pending", "cho duyet"],
        action: () => {
          navigate("/invoices");
        },
      },
      {
        id: "invoice:list",
        label: "Xem danh sách hóa đơn",
        keywords: ["list", "danh sach", "invoices", "view"],
        action: () => {
          navigate("/invoices");
        },
      },
    ],
  });

  // --- Reports Commands ---
  registry.register({
    id: "reports-group",
    label: "Báo cáo (Reports)",
    items: [
      {
        id: "reports:pnl",
        label: "Xem Báo cáo P&L",
        description: "Báo cáo lãi lỗ theo kỳ",
        keywords: ["pnl", "profit loss", "bao cao", "lai lo", "p&l"],
        action: () => {
          navigate("/reports");
        },
      },
    ],
  });

  // --- Transaction Commands ---
  registry.register({
    id: "transaction-group",
    label: "Giao dịch (Transactions)",
    items: [
      {
        id: "transaction:create",
        label: "Tạo giao dịch mới",
        description: "Mở form tạo giao dịch",
        shortcut: "Ctrl+G",
        keywords: ["new transaction", "create", "tao giao dich", "them giao dich"],
        action: () => {
          navigate("/transactions");
        },
      },
    ],
  });
}
