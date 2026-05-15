# TASK ISOLATION RULES — Tokens_taken

> **Mục đích:** Đảm bảo 6 task phát triển độc lập, không ảnh hưởng lẫn nhau.

---

## 1. Nguyên tắc Vàng (Golden Rules)

- [ ] **Mỗi feature là một domain riêng.** File nằm trong `features/{name}/` chỉ được import từ chính domain đó hoặc `packages/`.
- [ ] **Cấm import cross-feature.** Không được `import something from "@features/auth"` bên trong `@features/invoice`.
- [ ] **Shared code đi qua `packages/`.** Muốn dùng logic chung → đặt vào `packages/shared-types/` hoặc `packages/common-utils/`, rồi import từ đó.
- [ ] **Mỗi feature tự quản dependency riêng.** Không chia sẻ node_modules giữa các feature.
- [ ] **Schema DB thống nhất qua Prisma.** Tất cả schema nằm ở `packages/db/prisma/`. Không tự tạo bảng riêng.
- [ ] **Test isolation:** Mỗi feature có `tests/unit/` và `tests/integration/` riêng. File test không share state với feature khác.

---

## 2. Cấu trúc Dependency cho phép

```
apps/frontend  ──────>  features/*  ──────>  packages/shared-types
     │                      │                      │
     │                      │                      └──>  packages/common-utils
     │                      │
     │                      └──>  packages/shared-types
     │
     └──>  packages/shared-types

apps/backend   ──────>  features/*  ──────>  packages/db (Prisma)
     │                      │
     │                      └──>  packages/shared-types
     │
     └──>  packages/common-utils
```

**Điều này có nghĩa:**
- `apps/frontend` và `apps/backend` là 2 điểm entry duy nhất
- Feature chỉ biết về feature khác qua `packages/`
- Hoàn toàn tránh được circular dependency và feature creep

---

## 3. Task Ownership Map

| Task | Owner | Domain | Key Files |
|------|-------|--------|-----------|
| Task 1 | Auth Team | `features/auth/` | Auth pages, guards, services |
| Task 2 | Invoice Team | `features/invoice/` | Invoice CRUD, drag-drop, OCR |
| Task 3 | Transaction Team | `features/transaction/` | Transaction ledger, reconciliation |
| Task 4 | Dashboard Team | `features/dashboard/` | Dashboard widgets, charts |
| Task 5 | CmdPalette Team | `features/command-palette/` | Cmd+K overlay, shortcuts |
| Task 6 | Reports Team | `features/reports/` | Report generation, export |

---

## 4. Git Branching Strategy

```
main
├── feat/task-1-auth
├── feat/task-2-invoice
├── feat/task-3-transaction
├── feat/task-4-dashboard
├── feat/task-5-cmdpalette
└── feat/task-6-reports
```

- Mỗi task làm trên branch riêng: `feat/task-{N}-{name}`
- **Merge qua Pull Request bắt buộc review** từ Tech Lead
- **Không được force-push** lên branch đã merge
- Branch `main` chỉ nhận merge, không push trực tiếp

---

## 5. CI/CD Isolation

Mỗi task có pipeline riêng:
- **Lint + Type-check** cho feature đang thay đổi
- **Unit tests** cho feature đang thay đổi
- **Không chạy full test suite** (tránh ảnh hưởng từ task chưa xong)
- **E2E tests** chạy trên `main` sau mỗi merge

---

## 6. Import Aliasing (TypeScript Path Mapping)

```json
// tsconfig.base.json (shared)
{
  "compilerOptions": {
    "paths": {
      "@features/auth":       ["./src/features/auth/src/index.ts"],
      "@features/invoice":     ["./src/features/invoice/src/index.ts"],
      "@features/transaction": ["./src/features/transaction/src/index.ts"],
      "@features/dashboard":    ["./src/features/dashboard/src/index.ts"],
      "@features/command-palette": ["./src/features/command-palette/src/index.ts"],
      "@features/reports":     ["./src/features/reports/src/index.ts"],
      "@packages/shared-types": ["./src/packages/shared-types/src/index.ts"],
      "@packages/common-utils": ["./src/packages/common-utils/src/index.ts"]
    }
  }
}
```

> **Lưu ý:** Khi import, **luôn dùng path alias**, không dùng relative path vượt domain. VD: `import { InvoiceStatus } from "@features/invoice"` thay vì `import { InvoiceStatus } from "../../../invoice/src/..."`

---

## 7. Database Schema Ownership

- Schema file: `packages/db/prisma/schema.prisma`
- **Task chỉ được thêm field/model mới** vào schema sau khi discussed với team
- Migrations: `packages/db/prisma/migrations/` — commit message phải ghi rõ task nào
- **Seed data** cho test: mỗi task tự tạo seed file riêng trong `packages/db/seeds/`

---

## 8. State Management

| Loại State | Nơi lưu | Ai quản |
|-----------|---------|---------|
| Auth state (token, session) | Redis / httpOnly cookie | `features/auth` |
| Feature state (invoice list, etc) | React Query cache | Feature đó |
| Cross-feature state (org context) | Zustand store hoặc Context | `packages/common-utils` |
| Persistent UI state | localStorage (encrypted) | `packages/common-utils` |

---

## 9. Conflict Resolution Checklist

Khi có conflict giữa 2 task:

1. Xác định domain của file bị conflict
2. Feature nào sở hữu file đó → lead resolution
3. Nếu conflict ở `packages/` → Tech Lead decide
4. Không tự ý resolve bằng cách copy file đi chỗ khác
5. Sau khi resolve → chạy `pnpm --filter {affected-feature} typecheck` trước khi commit

---

## 10. Fast-Track: Bắt đầu task mới

```bash
# 1. Tạo branch
git checkout -b feat/task-N-feature-name

# 2. Build feature của bạn trong features/{name}/
# 3. Export qua index.ts (chỉ export những gì public)
# 4. Import vào apps/frontend hoặc apps/backend
# 5. Chạy typecheck
pnpm --filter @tokens-taken/frontend typecheck
pnpm --filter @tokens-taken/backend typecheck

# 6. Commit với conventional commit
git commit -m "feat(task-N): add feature description"
```
