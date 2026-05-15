# PROJECT GUIDELINES — Tokens_taken

## 1. Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` — New feature (Task 1-6 feature development)
- `fix` — Bug fix
- `refactor` — Code restructuring without behavior change
- `chore` — Dependency updates, config changes
- `docs` — Documentation only
- `test` — Tests only
- `perf` — Performance improvement
- `ci` — CI/CD pipeline changes

**Scopes (task-based):**
- `task-1`, `task-2`, ..., `task-6`
- `auth`, `invoice`, `transaction`, `dashboard`, `cmdpalette`, `reports`
- `db`, `infra`, `shared`

**Examples:**
```
feat(task-1): implement magic link authentication flow
fix(task-2): correct invoice total calculation with tax
feat(task-5): add fuzzy search to command palette
chore(db): add index on transactions.date
docs(architecture): update system diagram
```

---

## 2. TypeScript Standards

### 2.1 Strict Mode (bắt buộc)

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2.2 Financial Data Types

```typescript
// packages/shared-types/src/types/currency.ts

// LUÔN dùng Decimal cho tiền tệ, không dùng number
import { Decimal } from "@prisma/client/runtime/library";

// Trong DTO/API layer
type Money = {
  amount: string;     // string vì JSON không có Decimal → serialize qua string
  currency: string;   // "VND", "USD", "EUR"
};

// Trong business logic (backend)
type MoneyValue = {
  amount: Decimal;    // Prisma Decimal
  currency: string;
};
```

### 2.3 Error Handling

```typescript
// Mọi service phải throw typed errors
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
  }
}

// Các error cụ thể
class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`, "NOT_FOUND", 404);
  }
}

class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string>) {
    super(message, "VALIDATION_ERROR", 400, { fields });
  }
}

class InsufficientPermissionError extends AppError {
  constructor() {
    super("You do not have permission", "FORBIDDEN", 403);
  }
}
```

### 2.4 Prisma Import Convention

```typescript
// Đúng ✅
import { PrismaClient } from "@tokens-taken/db";

// Sai ❌
import { PrismaClient } from "../../../node_modules/.prisma/client";
```

---

## 3. React/Next.js Standards

### 3.1 Component Structure

```
features/{name}/
├── src/
│   ├── index.ts              # Public exports only
│   ├── components/
│   │   ├── {Name}.tsx        # Main component (PascalCase)
│   │   ├── {Name}.test.tsx
│   │   └── {Name}.stories.tsx
│   ├── hooks/
│   │   ├── use{Name}.ts
│   │   └── use{Name}.test.ts
│   ├── api/
│   │   └── {name}.api.ts    # React Query hooks + API calls
│   ├── types/
│   │   └── {name}.types.ts
│   └── utils/
│       └── {name}.utils.ts
└── package.json
```

### 3.2 React Query Usage

```typescript
// LUÔN dùng pattern này cho mutations
const useApproveInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => invoiceApi.approve(invoiceId),

    // Optimistic update
    onMutate: async (invoiceId) => {
      await queryClient.cancelQueries({ queryKey: ["invoices"] });
      const previous = queryClient.getQueryData(["invoices"]);

      queryClient.setQueryData(["invoices"], (old: Invoice[]) =>
        old.map((inv) =>
          inv.id === invoiceId ? { ...inv, status: "APPROVED" } : inv
        )
      );

      return { previous };
    },

    onError: (err, invoiceId, context) => {
      // Rollback on error
      queryClient.setQueryData(["invoices"], context?.previous);
      toast.error("Failed to approve invoice");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};
```

### 3.3 Server Components vs Client Components

```
✅ Dùng Server Component (RSC) cho:
  - Data fetching (initial page load)
  - SEO-critical content
  - Static UI (layouts, shells)

✅ Dùng Client Component ("use client") cho:
  - Interactivity (onClick, onChange)
  - useState, useEffect
  - React Query (vì cần hooks)
  - Command Palette
  - Drag & Drop
```

---

## 4. NestJS Standards

### 4.1 Module Structure

```
features/{name}/
├── src/
│   ├── {name}.module.ts
│   ├── {name}.controller.ts
│   ├── {name}.service.ts
│   ├── {name}.service.spec.ts
│   ├── dto/
│   │   ├── create-{name}.dto.ts
│   │   ├── update-{name}.dto.ts
│   │   └── {name}.query.dto.ts
│   └── entities/
│       └── {name}.entity.ts
└── package.json
```

### 4.2 Transaction Safety Pattern

```typescript
// Dùng Prisma Transaction cho mọi operation liên quan đến tiền
@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async approveInvoice(invoiceId: string, userId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        // 1. Update invoice status
        const invoice = await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
            approvedById: userId,
          },
        });

        // 2. Create journal entries (double-entry)
        await tx.journalEntry.createMany({
          data: [
            {
              transactionId: invoice.id,
              accountId: "REVENUE_ACCOUNT", // from org settings
              credit: invoice.total,
            },
            {
              transactionId: invoice.id,
              accountId: "AR_ACCOUNT", // Accounts Receivable
              debit: invoice.total,
            },
          ],
        });

        // 3. Create audit log
        await tx.auditLog.create({
          data: {
            organizationId: invoice.organizationId,
            userId,
            action: "invoice.approve",
            entityType: "Invoice",
            entityId: invoiceId,
          },
        });

        return invoice;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10_000,
      }
    );
  }
}
```

---

## 5. Testing Strategy

### 5.1 Test Coverage Targets

| Layer | Min Coverage | Type |
|-------|-------------|------|
| `packages/` (shared) | 80% | Unit |
| `features/*` services | 70% | Unit + Integration |
| `features/*` components | 60% | Unit (Vitest) |
| E2E critical flows | 100% | E2E (Playwright) |

### 5.2 Naming Conventions

```
*.test.ts       → Unit tests
*.integration.test.ts → Integration tests
*.e2e.test.ts    → E2E tests
*.spec.ts       → Alternative unit (NestJS convention)
```

### 5.3 Critical Test Cases (Financial Operations)

BẮT BUỘC phải test cho mọi financial operation:
1. Debit = Credit (journal entry balance)
2. Concurrent updates không mất data (optimistic locking)
3. Approve → Reject không double-count
4. Currency precision không round sai (Decimal comparison)
5. Session expiry không gây orphan state

---

## 6. Code Review Checklist

Trước khi merge, đảm bảo:

- [ ] TypeScript compile không lỗi
- [ ] Không có `any` type không có lý do
- [ ] Không import cross-feature (kiểm tra `@features/`)
- [ ] Migration file được tạo cho mọi schema change
- [ ] Test viết cho logic mới
- [ ] Commit message đúng conventional commit format
- [ ] Không hardcode secrets (dùng env vars)
- [ ] Financial operations dùng `$transaction`
- [ ] API có validation (Zod/class-validator)
- [ ] Sensitive data không log ra console

---

## 7. Environment Variables

```bash
# apps/frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# apps/backend/.env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
SESSION_SECRET=...
RESEND_API_KEY=...
```

---

## 8. Performance Standards

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.0s |
| Largest Contentful Paint (LCP) | < 2.0s |
| Time to Interactive (TTI) | < 3.0s |
| API Response (p95) | < 200ms |
| Lighthouse Score | > 90 |
