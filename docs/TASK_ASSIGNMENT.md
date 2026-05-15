# PHÂN CHIA TASK — Tokens_taken

> **Mục đích:** Ranh giới rõ ràng giữa 6 team/task, đảm bảo không đè code lên nhau.

---

## TỔNG QUAN

| # | Task | Team | Branch | Package | Trạng thái |
|---|------|------|--------|---------|-------------|
| 1 | Xác thực (Auth) | Auth Team | `feat/task-1-auth` | `features/auth/` | Chưa bắt đầu |
| 2 | Hóa đơn (Invoice) | Invoice Team | `feat/task-2-invoice` | `features/invoice/` | Chưa bắt đầu |
| 3 | Giao dịch (Transaction) | Transaction Team | `feat/task-3-transaction` | `features/transaction/` | Chưa bắt đầu |
| 4 | Dashboard | Dashboard Team | `feat/task-4-dashboard` | `features/dashboard/` | Chưa bắt đầu |
| 5 | Command Palette | CmdPalette Team | `feat/task-5-cmdpalette` | `features/command-palette/` | Chưa bắt đầu |
| 6 | Báo cáo (Reports) | Reports Team | `feat/task-6-reports` | `features/reports/` | Chưa bắt đầu |

---

## RANH GIỚI SỞ HỮU (FILE OWNERSHIP)

### Task 1 — Auth (`features/auth/`)

**Sở hữu:**
- `features/auth/src/` — toàn bộ logic auth
- `packages/db/prisma/schema.prisma` — phần `User`, `Session`, `WebAuthnCredential`, `OrganizationMember`
- `packages/shared-types/src/auth/` — type liên quan auth

**Cho phép đụng:**
- `apps/frontend/` — gọi auth guard/component để bảo vệ route
- `apps/backend/` — gọi `AuthService`, `JwtAuthGuard`
- `packages/shared-types/` — thêm type auth mới

**Cấm đụng:**
- `features/invoice/`, `features/transaction/`, `features/dashboard/`, `features/command-palette/`, `features/reports/`

---

### Task 2 — Invoice (`features/invoice/`)

**Sở hữu:**
- `features/invoice/src/` — toàn bộ logic invoice
- `packages/db/prisma/schema.prisma` — phần `Invoice`, `InvoiceAssignment`, `InvoiceTransaction`, `Attachment`
- `packages/shared-types/src/invoice/` — type liên quan invoice

**Cho phép đụng:**
- `features/auth/` — gọi user context từ auth
- `features/transaction/` — link invoice ↔ transaction (qua `InvoiceTransaction` model)
- `apps/frontend/` — gọi InvoiceService, Invoice components
- `apps/backend/` — gọi `InvoiceService`

**Cấm đụng:**
- Logic auth (mượn qua `@features/auth`)
- Logic transaction (chỉ link, không sửa transaction logic)
- Logic dashboard/report (chỉ cung cấp data, không render widget)

---

### Task 3 — Transaction (`features/transaction/`)

**Sở hữu:**
- `features/transaction/src/` — toàn bộ logic giao dịch + sổ kép
- `packages/db/prisma/schema.prisma` — phần `Transaction`, `JournalEntry`, `Account`, `TransactionApproval`, `AuditLog`
- `packages/shared-types/src/transaction/` — type liên quan transaction

**Cho phép đụng:**
- `features/auth/` — gọi user context từ auth
- `features/invoice/` — link invoice ↔ transaction (qua `InvoiceTransaction` model)
- `packages/common-utils/` — dùng `moneyAdd`, `moneySubtract`, `isBalanced`
- `apps/frontend/` — gọi TransactionService, components
- `apps/backend/` — gọi `TransactionService`

**Cấm đụng:**
- Logic auth, invoice, dashboard, command-palette, reports

---

### Task 4 — Dashboard (`features/dashboard/`)

**Sở hữu:**
- `features/dashboard/src/` — widget, thẻ thống kê, layout dashboard
- **Không sở hữu schema** — chỉ đọc data từ các task khác

**Cho phép đụng:**
- `features/invoice/` — gọi `useInvoices()` để lấy số liệu thống kê
- `features/transaction/` — gọi `useTransactions()` để lấy giao dịch gần đây
- `features/auth/` — gọi `useAuth()` để lấy org context
- `packages/shared-types/` — dùng type từ invoice/transaction
- `apps/frontend/` — gọi Dashboard components

**Cấm đụng:**
- Sửa schema bất kỳ bảng nào
- Tạo service mới trong domain khác
- Viết API endpoint cho task khác

---

### Task 5 — Command Palette (`features/command-palette/`)

**Sở hữu:**
- `features/command-palette/src/` — Command Palette overlay, registry, fuzzy search
- **Không sở hữu schema**

**Cho phép đụng:**
- `features/invoice/` — đăng ký command "Tạo Invoice", "Duyệt Invoice #XYZ"
- `features/transaction/` — đăng ký command "Tạo Giao dịch"
- `features/auth/` — đăng ký command "Đăng xuất", "Chuyển tổ chức"
- `features/reports/` — đăng ký command "Xem Báo cáo P&L"
- `packages/shared-types/` — dùng type
- `apps/frontend/` — gọi `CommandPaletteProvider`

**Cấm đụng:**
- Sửa logic nghiệp vụ của task khác (chỉ gọi, không sửa)
- Sửa schema

**Cơ chế hoạt động:**
```typescript
// Command Palette là "người đăng ký", features là "người cung cấp"
// features/invoice/src/commands.ts
export const invoiceCommands = {
  id: "invoice",
  register: (registry: CommandRegistry) => {
    registry.register({
      id: "invoice:create",
      label: "Tạo hóa đơn mới",
      shortcut: "Ctrl+N",
      action: () => navigate("/invoices/new"),
    });
    registry.register({
      id: "invoice:approve",
      label: "Duyệt hóa đơn",
      async search(query: string) {
        const { data } = await fetchPendingInvoices();
        return data.filter(inv =>
          inv.invoiceNumber.toLowerCase().includes(query.toLowerCase())
        );
      },
    });
  },
};
```

---

### Task 6 — Reports (`features/reports/`)

**Sở hữu:**
- `features/reports/src/` — report components, export logic
- **Không sở hữu schema** — chỉ đọc từ transaction + invoice

**Cho phép đụng:**
- `features/transaction/` — gọi `useTransactions()` để tính P&L, Cash Flow
- `features/invoice/` — gọi `useInvoices()` để tính revenue
- `packages/shared-types/` — dùng type
- `apps/frontend/` — gọi Report components

**Cấm đụng:**
- Sửa schema, sửa logic transaction/invoice

---

## SƠ ĐỒ PHỤ THUỘC GIỮA CÁC TASK

```
Task 1 (Auth)
    │
    ├──► Task 2 (Invoice)     — cần auth context
    ├──► Task 3 (Transaction) — cần auth context
    ├──► Task 4 (Dashboard)  — cần auth + invoice + transaction data
    ├──► Task 5 (CmdPalette) — cần auth commands + all feature commands
    └──► Task 6 (Reports)    — cần auth context

Task 2 (Invoice)
    └──► Task 3 (Transaction) — InvoiceTransaction link (2 chiều)

Task 3 (Transaction)
    └──► Task 4 (Dashboard)  — đọc transaction data
    └──► Task 6 (Reports)    — đọc transaction data cho P&L

Task 4 (Dashboard)
    └──► Task 5 (CmdPalette) — đăng ký quick actions

Task 5 (CmdPalette) — không phụ thuộc task nào
Task 6 (Reports)    — không phụ thuộc task nào
```

**Thứ tự triển khai đề xuất:**
```
Task 1 (Auth) ──► Task 2 (Invoice) ──► Task 3 (Transaction)
                     │                        │
                     └──────┬─────────────────┘
                            │
                  Task 4 (Dashboard)
                  Task 5 (CmdPalette)    (song song)
                  Task 6 (Reports)        (song song)
```

---

## CONFLICT RESOLUTION

### Loại 1: Conflict trên Schema (`packages/db/prisma/schema.prisma`)

**Ai sở hữu bảng nào:**
- `User`, `Session`, `WebAuthnCredential`, `OrganizationMember` → **Task 1**
- `Invoice`, `InvoiceAssignment`, `InvoiceTransaction`, `Attachment` → **Task 2**
- `Transaction`, `JournalEntry`, `Account`, `TransactionApproval`, `AuditLog` → **Task 3**
- `Organization` → **Task 1** (Task 2, 3 chỉ reference)

**Khi conflict:**
1. Xác định bảng thuộc task nào
2. Task sở hữu bảng quyết định
3. Task kia phải điều chỉnh
4. Chạy `pnpm db:generate` sau khi resolve

### Loại 2: Conflict trên Shared Types (`packages/shared-types/src/`)

- Mỗi task thêm type vào thư mục con tương ứng
- Không sửa type của task khác
- Nếu cần type mới dùng chung → tạo trong `packages/shared-types/src/api/`

### Loại 3: Conflict trên Apps (`apps/frontend/`, `apps/backend/`)

- **Không ai sở hữu tuyệt đối**
- `apps/frontend/` = integration layer, mọi task đều được import vào
- Tech Lead review PR merge vào `apps/`
- Import order: `features/auth` → `features/invoice` → ... → `features/reports`

### Loại 4: Conflict trên `packages/common-utils/`

- Utilities chung → thêm mới phải được Tech Lead approve
- Không sửa existing utils của task khác

---

## QUY TRÌNH MERGE

```
1. Tạo branch
   git checkout -b feat/task-N-feature-name

2. Phát triển trong features/{name}/
3. Import vào apps/frontend hoặc apps/backend
4. Chạy typecheck
   pnpm --filter @tokens-taken/backend typecheck
   pnpm --filter @tokens-taken/frontend typecheck

5. Commit (conventional commit)
   git commit -m "feat(task-N): mô tả ngắn gọn"

6. Tạo Pull Request
   - Mô tả: task gì, thay đổi gì, test gì
   - Gán reviewer: Tech Lead + 1 dev từ task liên quan

7. Sau khi merge:
   git checkout main
   git pull
   pnpm workspace:install   # cập nhật lockfile
   pnpm db:generate          # nếu schema thay đổi
```

---

## CHECKLIST TRƯỚC KHI COMMIT

- [ ] Đang ở branch đúng (`feat/task-N-...`)
- [ ] File thay đổi nằm trong `features/{name}/` hoặc `packages/` mà mình sở hữu
- [ ] Không import từ `features/` khác (dùng `packages/shared-types` thay thế)
- [ ] Schema thay đổi đã được task sở hữu bảng đó review
- [ ] TypeScript compile không lỗi
- [ ] Test đã pass (`pnpm --filter @tokens-taken/feature-{name} test`)
- [ ] Commit message đúng format: `feat(task-N):`

---

## QUICK REFERENCE — AI ASSISTANT

Khi được hỏi về một file/code:

1. **Xác định file thuộc task nào** bằng bảng phân chia ở trên
2. **Chỉ sửa file trong phạm vi task đang làm**
3. **Nếu cần dùng logic task khác** → gọi qua public API surface (`src/index.ts` của feature đó)
4. **Nếu cần type chia sẻ** → kiểm tra `packages/shared-types/` trước, không có thì hỏi Tech Lead

> **Nguyên tắc vàng:** Nếu không chắc chắn task nào sở hữu → hỏi Tech Lead, không tự ý sửa.
