# Features Overview

Quick reference for each feature module.

## Feature 1: Auth (`features/auth`)

**Scope:** Login, session management, authorization
- Magic Link via email (Resend)
- WebAuthn / Passkeys registration + login
- JWT + httpOnly cookie session
- Role-based access (Owner, Admin, Member, Viewer, Accountant)

**Public API:** `@features/auth`
```typescript
import { AuthService, JwtAuthGuard, WebAuthnGuard } from "@features/auth";
```

## Feature 2: Invoice (`features/invoice`)

**Scope:** Invoice lifecycle management
- CRUD invoice (SALE, PURCHASE, EXPENSE, CREDIT)
- Bulk drag-drop file upload
- OCR extraction (stub — integrate Tesseract.js or cloud OCR)
- Bulk approve/reject/publish
- Real-time status sync via WebSocket

**Public API:** `@features/invoice`
```typescript
import { InvoiceService, useInvoices, useApproveInvoice } from "@features/invoice";
```

## Feature 3: Transaction (`features/transaction`)

**Scope:** Double-entry bookkeeping
- Create journal entries (debit = credit enforced)
- Multi-currency with exchange rate
- Approval workflow (approve, reject, request_info)
- Account reconciliation
- Balance calculation per account

**Public API:** `@features/transaction`
```typescript
import { TransactionService, JournalService } from "@features/transaction";
```

## Feature 4: Dashboard (`features/dashboard`)

**Scope:** Main dashboard + analytics widgets
- Stats cards (Revenue, Pending, Cash Flow, Expenses)
- Recent Transactions list
- Pending Approvals list
- Quick action buttons

**Public API:** `@features/dashboard`
```typescript
import { StatCard, useDashboardStats } from "@features/dashboard";
```

## Feature 5: Command Palette (`features/command-palette`)

**Scope:** Global ⌘K command interface
- Fuzzy search across all entities
- Keyboard-first navigation
- Registered actions: navigate, create, approve, search
- Extensible command registry

**Public API:** `@features/command-palette`
```typescript
import { CommandPalette, useCommandPalette, CommandRegistry } from "@features/command-palette";
```

## Feature 6: Reports (`features/reports`)

**Scope:** Financial reporting
- Profit & Loss (P&L) statement
- Cash Flow statement
- Balance Sheet
- CSV + PDF export
- Scheduled report delivery (future)

**Public API:** `@features/reports`
```typescript
import { ReportService, PnlReport, usePnlReport } from "@features/reports";
```
