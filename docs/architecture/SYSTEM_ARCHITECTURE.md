# SYSTEM ARCHITECTURE — Tokens_taken

## 1. System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  Next.js 15 (App Router, RSC)                                            │ │
│  │                                                                          │ │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │ │
│  │   │  Dashboard   │  │  Command     │  │  React Query                │   │ │
│  │   │  (RSC)       │  │  Palette     │  │  (Optimistic Updates +       │   │ │
│  │   │              │  │  (Ctrl+K)    │  │   Background Refetch)        │   │ │
│  │   └──────────────┘  └──────────────┘  └──────────────────────────────┘   │ │
│  │                                                                          │ │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │ │
│  │   │  Invoice     │  │  Transaction │  │  WebSocket Client            │   │ │
│  │   │  Manager     │  │  Ledger      │  │  (Real-time Sync)            │   │ │
│  │   └──────────────┘  └──────────────┘  └──────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────┘
                                      │
                            HTTPS (REST API) + WSS (WebSocket)
                                      │
┌────────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  NestJS Gateway                                                           │ │
│  │                                                                          │ │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │ │
│  │   │  Rate Limit  │  │  Auth Guard  │  │  WebSocket Gateway           │   │ │
│  │   │  (Redis)     │  │  (JWT+AD)   │  │  (Socket.IO)                 │   │ │
│  │   └──────────────┘  └──────────────┘  └──────────────────────────────┘   │ │
│  │                                                                          │ │
│  │   ┌──────────────────────────────────────────────────────────────────┐   │ │
│  │   │  Validation Pipe (class-validator + Zod)                         │   │ │
│  │   └──────────────────────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────┘
                                      │
            ┌──────────────────────────┼──────────────────────────┐
            │                          │                          │
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│   CACHING LAYER       │  │   SERVICE LAYER       │  │   SERVICE LAYER       │
│   Redis Cluster       │  │   (NestJS Modules)    │  │   (NestJS Modules)    │
│                       │  │                       │  │                       │
│  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │
│  │ Session Store   │  │  │  │ AuthService     │  │  │  │ InvoiceService  │  │
│  │ (TTL: 7 days)   │  │  │  │ - Magic Link    │  │  │  │ - OCR Extract   │  │
│  └─────────────────┘  │  │  │ - WebAuthn      │  │  │  │ - Bulk Approve  │  │
│  ┌─────────────────┐  │  │  │ - Session mgmt  │  │  │  │ - Auto-categorize│ │
│  │ Query Cache     │  │  │  └─────────────────┘  │  │  └─────────────────┘  │
│  │ (TTL: 30s-5min) │  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │
│  └─────────────────┘  │  │  │ TransactionSvc  │  │  │  │ ReportService   │  │
│  ┌─────────────────┐  │  │  │ - Double-entry  │  │  │  │ - Cash Flow     │  │
│  │ Rate Limit      │  │  │  │ - Reconciliation│  │  │  │ - P&L Report   │  │
│  │ Counter         │  │  │  └─────────────────┘  │  │  └─────────────────┘  │
│  └─────────────────┘  │  └───────────────────────┘  └───────────────────────┘
└───────────────────────┘
                                      │
                            ┌──────────┴──────────┐
                            │   DATA LAYER        │
                            │                     │
                            ▼                     ▼
                  ┌────────────────┐   ┌────────────────────┐
                  │  PostgreSQL     │   │  PostgreSQL         │
                  │  (Primary)     │   │  (Read Replica)     │
                  │                 │   │                     │
                  │  - ACID Txn    │   │  - Heavy queries    │
                  │  - Financial   │   │  - Reports          │
                  │    data        │   │                     │
                  └────────────────┘   └─────────────────────┘
```

### Data Flow Chi tiết

```
User Action (UI)
    │
    ▼
React Query (Optimistic Update) ──► UI cập nhật ngay lập tức
    │
    │ (background)
    ▼
Next.js API Route ──► NestJS Controller ──► Service Layer
    │                                           │
    │                                           ▼
    │                                    Redis Cache Check
    │                                           │
    │                                    ┌──────┴──────┐
    │                                    │             │
    │                               Cache Hit     Cache Miss
    │                                    │             │
    │                                    ▼             ▼
    │                               Return       PostgreSQL Query
    │                               from cache         │
    │                                    ▲             │
    │                                    └──────────────┘
    │                                           │
    │                                           ▼
    │                                    Write to DB
    │                                    (ACID Txn)
    │                                           │
    ▼                                           ▼
WebSocket Broadcast ──────────────────► Invalidate Cache
(Real-time sync)                            │
    │                                        ▼
    ▼                                   React Query
All Clients                              (Auto-refetch)
(Update UI)
```

---

## 2. Database Schema (Prisma Format)

```prisma
// packages/db/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────────────────────
// ORGANIZATION & USER
// ─────────────────────────────────────────────────────────────

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  plan        Plan     @default(FREE)
  settings    Json     @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     OrganizationMember[]
  accounts    Account[]
  invoices    Invoice[]
  transactions Transaction[]
  auditLogs   AuditLog[]

  @@index([slug])
}

enum Plan {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  displayName   String?
  avatarUrl     String?
  locale        String    @default("en")
  timezone      String    @default("UTC")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?

  // Auth
  magicLinkToken    String?   @unique
  magicLinkExpires  DateTime?
  webAuthnCredential WebAuthnCredential?

  // Relations
  organizationMemberships OrganizationMember[]
  sessions           Session[]
  auditLogs          AuditLog[]
  invoiceAssignments InvoiceAssignment[]
  transactionApprovals TransactionApproval[]

  @@index([email])
  @@index([magicLinkToken])
}

model OrganizationMember {
  id             String           @id @default(cuid())
  userId         String
  organizationId String
  role           OrgRole          @default(MEMBER)
  invitedAt      DateTime         @default(now())
  joinedAt       DateTime?
  isActive       Boolean          @default(true)

  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@index([organizationId])
}

enum OrgRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
  ACCOUNTANT
}

model Session {
  id           String    @id @default(cuid())
  userId       String
  token        String    @unique
  deviceInfo   Json?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime  @default(now())
  lastActiveAt DateTime  @default(now())

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@index([expiresAt])
}

// ─────────────────────────────────────────────────────────────
// WEBAUTHN / PASSKEYS
// ─────────────────────────────────────────────────────────────

model WebAuthnCredential {
  id              String   @id @default(cuid())
  userId          String   @unique
  credentialId    String   @unique
  publicKey       String
  counter         BigInt
  deviceType      String?
  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ─────────────────────────────────────────────────────────────
// ACCOUNTING (Double-Entry Ledger)
// ─────────────────────────────────────────────────────────────

model Account {
  id             String       @id @default(cuid())
  organizationId String
  code           String       // e.g. "1000", "2000", "4000"
  name           String
  type           AccountType
  currency       String       @default("VND")
  balance        Decimal      @default(0) @db.Decimal(20, 4)
  isActive       Boolean      @default(true)
  isSystem       Boolean      @default(false) // System accounts: cash, bank, revenue, expense
  parentId       String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  parent         Account?     @relation("AccountHierarchy", fields: [parentId], references: [id])
  children       Account[]    @relation("AccountHierarchy")
  journalEntries JournalEntry[]

  @@unique([organizationId, code])
  @@index([organizationId])
  @@index([type])
}

enum AccountType {
  ASSET       // Tài sản (1000: Tiền mặt, 1100: Ngân hàng)
  LIABILITY   // Nợ phải trả (2000: Phải trả người bán)
  EQUITY      // Vốn chủ sở hữu (3000)
  REVENUE     // Doanh thu (4000)
  EXPENSE     // Chi phí (5000)
}

// ─────────────────────────────────────────────────────────────
// TRANSACTIONS (Double-Entry Journal)
// ─────────────────────────────────────────────────────────────

model Transaction {
  id             String            @id @default(cuid())
  organizationId String
  reference      String            // Internal ref: TXN-2026-000001
  type           TransactionType
  status         TransactionStatus @default(PENDING)
  description    String?
  date           DateTime          @default(now())
  amount         Decimal           @db.Decimal(20, 4)
  currency       String            @default("VND")
  exchangeRate   Decimal           @default(1) @db.Decimal(20, 8)
  metadata       Json              @default("{}")
  approvedAt     DateTime?
  approvedById   String?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  organization   Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  journalEntries JournalEntry[]
  approvals      TransactionApproval[]
  attachments    Attachment[]
  invoiceLinks   InvoiceTransaction[]

  @@unique([organizationId, reference])
  @@index([organizationId])
  @@index([date])
  @@index([status])
}

enum TransactionType {
  INCOME       // Thu tiền
  EXPENSE      // Chi tiền
  TRANSFER     // Chuyển khoản nội bộ
  ADJUSTMENT   // Điều chỉnh
  JOURNAL      // Bút toán kép thủ công
}

enum TransactionStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model JournalEntry {
  id            String   @id @default(cuid())
  transactionId String
  accountId     String
  debit         Decimal  @default(0) @db.Decimal(20, 4)
  credit        Decimal  @default(0) @db.Decimal(20, 4)
  description   String?
  createdAt     DateTime @default(now())

  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  account       Account     @relation(fields: [accountId], references: [id])

  @@index([transactionId])
  @@index([accountId])

  // Constraint: mỗi JournalEntry phải có debit = credit (enforced in application layer)
}

model TransactionApproval {
  id            String   @id @default(cuid())
  transactionId String
  userId        String
  action        ApprovalAction
  comment       String?
  decidedAt     DateTime @default(now())

  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  user          User        @relation(fields: [userId], references: [id])

  @@index([transactionId])
}

enum ApprovalAction {
  APPROVE
  REJECT
  REQUEST_INFO
}

// ─────────────────────────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────────────────────────

model Invoice {
  id             String         @id @default(cuid())
  organizationId String
  invoiceNumber  String
  type           InvoiceType
  status         InvoiceStatus  @default(DRAFT)

  // Parties
  senderName     String
  senderTaxCode  String?
  senderAddress  String?
  receiverName   String
  receiverTaxCode String?
  receiverAddress String?

  // Financial
  subtotal       Decimal        @default(0) @db.Decimal(20, 4)
  taxRate        Decimal        @default(0) @db.Decimal(5, 4)
  taxAmount      Decimal        @default(0) @db.Decimal(20, 4)
  total          Decimal        @default(0) @db.Decimal(20, 4)
  currency       String         @default("VND")
  dueDate        DateTime?

  // Content
  lineItems      Json           @default("[]") // [{description, quantity, unitPrice, amount}]
  notes          String?

  // File
  sourceFileUrl  String?        // Original uploaded file (PDF/image)
  ocrExtracted   Json?          // OCR result cache

  // Workflow
  approvedAt     DateTime?
  approvedById   String?
  publishedAt    DateTime?

  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  assignments    InvoiceAssignment[]
  attachments    Attachment[]
  transactionLinks InvoiceTransaction[]

  @@unique([organizationId, invoiceNumber])
  @@index([organizationId])
  @@index([status])
  @@index([dueDate])
}

enum InvoiceType {
  SALE       // Hóa đơn bán
  PURCHASE   // Hóa đơn mua
  EXPENSE    // Phiếu chi
  CREDIT     // Giảm trừ
}

enum InvoiceStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
  PUBLISHED
  CANCELLED
  OVERDUE
}

model InvoiceAssignment {
  id         String   @id @default(cuid())
  invoiceId  String
  userId     String
  role       String   @default("reviewer")
  assignedAt DateTime @default(now())

  invoice    Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id])

  @@unique([invoiceId, userId])
}

model InvoiceTransaction {
  id            String      @id @default(cuid())
  invoiceId     String
  transactionId String

  invoice       Invoice     @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  @@unique([invoiceId, transactionId])
}

// ─────────────────────────────────────────────────────────────
// ATTACHMENTS
// ─────────────────────────────────────────────────────────────

model Attachment {
  id             String   @id @default(cuid())
  fileName       String
  fileSize       Int
  mimeType       String
  storageKey     String   // S3/GCS key
  url            String
  thumbnailUrl   String?
  uploadedById   String?
  invoiceId      String?
  transactionId  String?
  createdAt      DateTime @default(now())

  invoice        Invoice?    @relation(fields: [invoiceId], references: [id])
  transaction    Transaction? @relation(fields: [transactionId], references: [id])

  @@index([invoiceId])
  @@index([transactionId])
}

// ─────────────────────────────────────────────────────────────
// AUDIT LOG (Immutable)
// ─────────────────────────────────────────────────────────────

model AuditLog {
  id             String   @id @default(cuid())
  organizationId String
  userId         String?
  action         String   // "invoice.create", "transaction.approve", etc.
  entityType     String   // "Invoice", "Transaction", "User"
  entityId       String
  changes        Json?    // {before, after}
  ipAddress      String?
  userAgent      String?
  createdAt      DateTime @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User?        @relation(fields: [userId], references: [id])

  // Audit log is append-only — no UPDATE or DELETE allowed
  @@index([organizationId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

### Schema Design Principles (ACID for Financial Data)

1. **Double-entry bookkeeping**: `JournalEntry` enforces every transaction has balanced debit/credit
2. **Immutable Audit Log**: No UPDATE/DELETE on `AuditLog` — enforced via PostgreSQL RLS
3. **Optimistic locking**: All financial records include `@updatedAt` for conflict detection
4. **Currency precision**: `Decimal(20, 4)` for amounts, `Decimal(20, 8)` for exchange rates
5. **Soft concurrency**: Row-level locking with `SELECT ... FOR UPDATE` on balance updates
6. **Cascading soft-delete**: Financial records never hard-delete — use `isActive` flags

---

## 3. Authentication Flow (Passwordless + WebAuthn)

### Flow 1: Magic Link (Passwordless)

```
[Browser]                          [NestJS Backend]               [Email Provider]
     │                                      │                               │
     │  POST /auth/magic-link              │                               │
     │  { email: "user@company.com" }      │                               │
     │ ─────────────────────────────────►  │                               │
     │                                      │                               │
     │                                      │  1. Generate random token     │
     │                                      │  2. Set token + 15min TTL     │
     │                                      │     in Redis                  │
     │                                      │     key: "magic:{token}"      │
     │                                      │     value: {userId, orgId}    │
     │                                      │                               │
     │                                      │  3. Send email via Resend     │
     │                                      │     with magic link           │
     │                                      │ ────────────────────────────► │
     │                                      │                               │
     │  200 OK (email sent)                │                               │
     │ ◄────────────────────────────────── │                               │
     │                                      │                               │
     │  User clicks link in email           │                               │
     │  GET /auth/verify?token=xxx          │                               │
     │ ─────────────────────────────────►  │                               │
     │                                      │                               │
     │                                      │  1. Validate token in Redis    │
     │                                      │  2. Delete token (single-use)  │
     │                                      │  3. Create Session record      │
     │                                      │  4. Generate JWT (15min)      │
     │                                      │  5. Set httpOnly cookie       │
     │                                      │                               │
     │  302 → /dashboard (with JWT cookie)  │                               │
     │ ◄────────────────────────────────── │                               │
```

### Flow 2: WebAuthn / Passkeys

```
[Browser]                          [NestJS Backend]               [WebAuthn]
     │                                      │                         │
     │  POST /auth/webauthn/register/options│                         │
     │ ─────────────────────────────────►  │                         │
     │  200: credentialCreationOptions     │                         │
     │ ◄────────────────────────────────── │                         │
     │                                      │                         │
     │  navigator.credentials.create()     │                         │
     │  (uses platform authenticator)       │                         │
     │                                      │                         │
     │  POST /auth/webauthn/register/verify │                         │
     │  { credential }                     │                         │
     │ ─────────────────────────────────►  │                         │
     │                                      │                         │
     │  1. Verify attestation             │                         │
     │  2. Store credentialId + publicKey  │                         │
     │     in WebAuthnCredential table     │                         │
     │  3. Create session                 │                         │
     │                                      │                         │
     │  200: success + JWT                 │                         │
     │ ◄────────────────────────────────── │                         │
     │                                      │                         │
     │  [Login flow - same pattern]         │                         │
     │  POST /auth/webauthn/login/options  │                         │
     │ ─────────────────────────────────►  │                         │
     │                                      │                         │
     │  GET /auth/webauthn/login/verify   │                         │
     │  { assertion }                     │                         │
     │ ─────────────────────────────────►  │                         │
     │                                      │                         │
     │  1. Verify assertion with stored   │                         │
     │     publicKey                       │                         │
     │  2. Update credential counter      │                         │
     │  3. Issue JWT                      │                         │
```

### Next.js Integration (Frontend)

```typescript
// apps/frontend/lib/auth.ts

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

// Server-side: read session from httpOnly cookie
export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: 'tt_session',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  });
  return session;
}

// Middleware: protect all routes except auth
// apps/frontend/middleware.ts
export function middleware(request: NextRequest) {
  const session = await getSession();
  if (!session.userId && !isPublicRoute(request.pathname)) {
    return NextResponse.redirect('/login');
  }
}
```

### NestJS Auth Module Structure

```
features/auth/
├── src/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── webauthn.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── webauthn-auth.guard.ts
│   ├── dto/
│   │   ├── magic-link.dto.ts
│   │   └── webauthn.dto.ts
│   └── webauthn.service.ts
└── index.ts
```

---

## 4. UX/UI Layout Recommendations

### 4.1 Global Layout: Single-Column with Fixed Sidebar

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (56px fixed)                                             │
│ ┌──────────┬───────────────────────────────┬──────────────────┐ │
│ │          │  Search (⌘K) + Breadcrumb     │ 🔔  👤 Avatar   │ │
│ │ Sidebar  │                               │                  │ │
│ │ (240px)  │  MAIN CONTENT AREA            │                  │ │
│ │          │  (scrollable, max-width:       │                  │ │
│ │ - Logo   │   1280px, centered)           │                  │ │
│ │ - Nav    │                               │                  │ │
│ │ - Quick  │                               │                  │ │
│ │   Stats  │                               │                  │ │
│ │          │                               │                  │ │
│ │ (68px    │                               │                  │ │
│ │  collapsed)│                             │                  │ │
│ └──────────┴───────────────────────────────┴──────────────────┘ │
│ Command Palette Overlay (⌘K triggered, full-screen dim)         │
└─────────────────────────────────────────────────────────────────┘
```

**Tại sao:**
- Sidebar 240px hiển thị icon + label, 68px collapsed chỉ icon → tiết kiệm không gian nhưng vẫn nhận diện được
- Main content max-width 1280px, centered → mắt không phải focus quá rộng
- Header fixed 56px → luôn thấy context (org name, user)

### 4.2 Command Palette là Trung tâm Thao tác

- **Vị trí:** Full-screen overlay, xuất hiện khi nhấn `Ctrl+K` / `Cmd+K`
- **Design:** Input ở trên cùng, kết quả bên dưới phân loại theo category
- **Kết quả gợi ý:**
  - 🔍 **Quick Actions:** "New Invoice", "Transfer Money", "Approve #INV-2026"
  - 📄 **Invoices:** Các invoice gần đây / pending
  - 💰 **Transactions:** Tìm kiếm giao dịch
  - 📊 **Reports:** "Monthly P&L", "Cash Flow Statement"
  - ⚙️ **Settings:** "Organization Settings", "Manage Team"
- **Keyboard-first:** Tab/Arrow để navigate, Enter để execute, Esc để close
- **Fuzzy search:** Tìm bằng alias, không cần từ khóa chính xác

**Tại sao đây là "Killer Feature":**
- Người dùng B2B thường là power user, thao tác hàng trăm lần/ngày
- Giảm 70% click so với navigation menu truyền thống
- Có thể chain actions: "Tạo invoice → gửi → theo dõi" chỉ với bàn phím

### 4.3 Data Tables = Primary UI Pattern

```
┌──────────────────────────────────────────────────────────────────┐
│ Table Header (sortable, filterable)                               │
│ ┌──────────┬────────────┬──────────┬───────────┬─────────────┐ │
│ │ Invoice# │ Client     │ Amount   │ Status    │ Due Date    │ │
│ │ ▲▼        │ ▲▼         │ ▲▼        │ [Filter▾] │ [Filter▾]  │ │
│ ├──────────┼────────────┼──────────┼───────────┼─────────────┤ │
│ │ INV-001  │ Acme Corp  │ ₫12.5M   │ ✅ Paid   │ 2026-05-20  │ │
│ │ INV-002  │ Beta Ltd   │ ₫3.2M    │ ⏳ Pending│ 2026-05-22  │ │
│ │ ...      │ ...        │ ...      │ ...       │ ...         │ │
│ └──────────┴────────────┴──────────┴───────────┴─────────────┘ │
│ Pagination: ◀ 1 2 3 ... 12 ▶    [10 / 25 / 50 per page]         │
├──────────────────────────────────────────────────────────────────┤
│ Bulk Action Bar (appears when rows selected):                  │
│ [Approve (3)] [Reject (3)] [Export (3)] [Delete (3)]            │
└──────────────────────────────────────────────────────────────────┘
```

**Tại sao:**
- Tables chiếm ~70% screen trong phần mềm ERP → ưu tiên không gian cho data
- Bulk actions xuất hiện khi select → không tốn không gian khi không cần
- Inline status badges (màu sắc + icon) → nhận diện nhanh không cần đọc text
- Sort/Filter trên header → không cần sidebar filter riêng

### 4.4 Optimistic UI Pattern cho Mọi Thao tác

```
User clicks "Approve Invoice"
    │
    ▼
[UI cập nhật ngay: Invoice status = APPROVED (màu xanh)]
    │
    ▼
[React Query mutation fires in background]
    │
    ├── [Success] → Cache invalidated, data confirmed
    │
    └── [Error] → UI revert về trạng thái cũ + toast error
```

**Implement:**
- `useMutation` với `onMutate`: optimistic update
- `onError`: rollback + show toast
- `onSettled`: invalidate query → refetch để sync
- Loading state: subtle spinner trên row, không block entire page

---

## 5. Deployment Architecture

```
                    ┌──────────────────┐
                    │   Cloudflare CDN  │
                    │   (Global Edge)   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Vercel         │
                    │  (Next.js Frontend)│
                    │  - Edge Runtime  │
                    │  - ISR Enabled    │
                    └────────┬─────────┘
                             │
┌──────────────────────────────────────────────────────────┐
│                   AWS VPC (Private)                       │
│                                                          │
│   ┌──────────────┐         ┌──────────────────────────┐ │
│   │ AWS ECS       │         │ AWS RDS                  │ │
│   │ (NestJS API)  │◄───────►│ (PostgreSQL 16)          │ │
│   │ - 2+ instances│         │ - Primary + 1 Replica   │ │
│   │ - Auto-scale  │         │ - PITR Backup           │ │
│   └───────┬───────┘         └──────────────────────────┘ │
│           │                                                  │
│   ┌───────▼───────┐         ┌──────────────────────────┐ │
│   │ AWS ElastiCache│         │ AWS S3                   │ │
│   │ (Redis 7)     │         │ (Invoice attachments)    │ │
│   │ - Cluster mode│         │ - Versioning enabled    │ │
│   └───────────────┘         └──────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Development Roadmap (6 Tasks)

| Task | Phase | Scope | Priority |
|------|-------|-------|----------|
| **Task 1** | Auth & Infrastructure | Magic Link, WebAuthn, JWT, Prisma setup, Redis | P0 |
| **Task 2** | Invoice Processing | Invoice CRUD, drag-drop, OCR stub, bulk approve | P0 |
| **Task 3** | Transaction Ledger | Double-entry journal, approvals, reconciliation | P0 |
| **Task 4** | Dashboard & Widgets | Stats cards, charts, recent activity, quick actions | P1 |
| **Task 5** | Command Palette | ⌘K overlay, fuzzy search, keyboard shortcuts, actions | P1 |
| **Task 6** | Reports & Export | P&L, Cash Flow, CSV/PDF export, scheduled reports | P2 |

**Thứ tự phụ thuộc:**
```
Task 1 (Auth) ──► Task 2 (Invoice)
         │              │
         └──────────┬───┘
                    │
                    ▼
              Task 3 (Transaction)
                    │
         ┌──────────┴──────────┐
         ▼                      ▼
   Task 4 (Dashboard)    Task 5 (CmdPalette)
         │                      │
         └──────────┬───────────┘
                    ▼
              Task 6 (Reports)
```
