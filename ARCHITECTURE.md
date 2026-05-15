# TOKENS_TAKEN - KIẾN TRÚC HỆ THỐNG

## 📋 TỔNG QUAN DỰ ÁN

**Tên dự án:** Tokens_taken  
**Đối tượng:** B2B - Doanh nghiệp, Nhà kinh doanh  
**Mục tiêu cốt lõi:** Nền tảng quản lý tiền tệ với tốc độ load cực nhanh, UX tiện lợi vượt trội, UI minimalist B2B

---

## 🗂️ MONOREPO STRUCTURE

```
Tokenstakenapp/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # NestJS API server
├── packages/
│   ├── shared-types/      # Shared TypeScript types (cross-package contracts)
│   ├── common-utils/       # Pure utility functions
│   └── db/                # Prisma schema + migrations
├── features/              # Domain modules (Task 1-6)
│   ├── auth/              # Task 1: Magic Link + WebAuthn
│   ├── invoice/           # Task 2: Invoice CRUD + OCR + Bulk
│   ├── transaction/       # Task 3: Double-entry ledger
│   ├── dashboard/         # Task 4: Stats + widgets
│   ├── command-palette/   # Task 5: ⌘K overlay + shortcuts
│   └── reports/          # Task 6: P&L, Cash Flow, export
├── docs/
│   ├── architecture/      # Architecture diagrams + schemas
│   ├── rules/            # Task isolation rules
│   └── guidelines/       # Coding standards
├── scripts/              # DevOps & build scripts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json          # Root workspace config (pnpm workspaces)
├── pnpm-workspace.yaml   # Workspace package list
├── tsconfig.base.json    # Shared TypeScript config
└── CLAUDE.md            # AI assistant context file
```

**Dependency Rules (enforced):**
```
apps/frontend  ──────►  features/*  ──────►  packages/shared-types
     │                        │                    │
     │                        │                    ├──► packages/common-utils
     └──► packages/shared-types (direct)
apps/backend   ──────►  features/*  ──────►  packages/db (Prisma)
     │                        │
     │                        └──► packages/shared-types
     └──► packages/common-utils
```

**Isolation: Features CANNOT import from other features.** All cross-feature communication goes through `packages/shared-types`. See `docs/rules/TASK_ISOLATION_RULES.md` for full rules.

---

## 🏗️ 1. SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Next.js App (SSR/SSG + Client Components)                 │ │
│  │  - Command Palette (⌘K/Ctrl+K)                             │ │
│  │  - Optimistic UI Updates                                   │ │
│  │  - React Query/SWR (Client-side caching)                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  NestJS Backend (TypeScript)                               │ │
│  │  - RESTful API Endpoints                                   │ │
│  │  - WebSocket (Real-time updates)                           │ │
│  │  - Authentication Guard (JWT + WebAuthn)                   │ │
│  │  - Rate Limiting & Request Validation                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴──────────────────────┐
        ↓                                             ↓
┌──────────────────────┐                  ┌──────────────────────┐
│   CACHING LAYER      │                  │   SERVICE LAYER      │
│  ┌────────────────┐  │                  │  ┌────────────────┐  │
│  │ Redis Cluster  │  │                  │  │ Auth Service   │  │
│  │ - Session      │  │                  │  │ - Passwordless │  │
│  │ - Query Cache  │  │                  │  │ - WebAuthn     │  │
│  │ - Rate Limit   │  │                  │  └────────────────┘  │
│  └────────────────┘  │                  │  ┌────────────────┐  │
└──────────────────────┘                  │  │ Invoice Svc    │  │
                                          │  │ - OCR Extract  │  │
                                          │  │ - Approval     │  │
                                          │  └────────────────┘  │
                                          │  ┌────────────────┐  │
                                          │  │ Transaction    │  │
                                          │  │ - ACID Control │  │
                                          │  └────────────────┘  │
                                          └──────────────────────┘
                                                      ↓
                              ┌───────────────────────────────────┐
                              │   DATABASE LAYER                  │
                              │  ┌─────────────────────────────┐  │
                              │  │ PostgreSQL (Primary)        │  │
                              │  │ - Prisma ORM                │  │
                              │  │ - Transaction Isolation     │  │
                              │  │ - Read Replicas (Scale)     │  │
                              │  └─────────────────────────────┘  │
                              └───────────────────────────────────┘
```

### Luồng dữ liệu (Data Flow):

1. **Client → API Gateway:** Next.js gửi request (REST/WebSocket) với JWT token
2. **Authentication:** NestJS verify JWT/WebAuthn credentials
3. **Cache Check:** Redis kiểm tra cache hit → trả về ngay nếu có
4. **Service Processing:** Logic nghiệp vụ xử lý (Invoice, Transaction)
5. **Database Transaction:** Prisma thực hiện ACID transaction trên PostgreSQL
6. **Real-time Sync:** WebSocket push updates về client ngay lập tức
7. **Optimistic UI:** Client render ngay, reconcile với server response sau

---

## 🗄️ 2. DATABASE SCHEMA (Prisma Format)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===================== AUTHENTICATION & USERS =====================

model User {
  id                String              @id @default(uuid())
  email             String              @unique
  emailVerified     DateTime?
  name              String?
  avatarUrl         String?
  role              UserRole            @default(MEMBER)
  
  // WebAuthn Credentials
  webAuthnCredentials WebAuthnCredential[]
  
  // Relationships
  organizationId    String
  organization      Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  createdInvoices   Invoice[]           @relation("CreatedBy")
  approvedInvoices  Invoice[]           @relation("ApprovedBy")
  transactions      Transaction[]       @relation("CreatedBy")
  
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  lastLoginAt       DateTime?
  
  @@index([organizationId])
  @@index([email])
}

enum UserRole {
  OWNER
  ADMIN
  ACCOUNTANT
  MEMBER
}

model WebAuthnCredential {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  credentialId    String   @unique // Base64-encoded credential ID
  publicKey       String   // Base64-encoded public key
  counter         BigInt   @default(0)
  deviceType      String?  // "platform" or "cross-platform"
  
  createdAt       DateTime @default(now())
  lastUsedAt      DateTime?
  
  @@index([userId])
}

model MagicLink {
  id          String   @id @default(uuid())
  email       String
  token       String   @unique
  expiresAt   DateTime
  usedAt      DateTime?
  
  createdAt   DateTime @default(now())
  
  @@index([email])
  @@index([token])
}

// ===================== ORGANIZATION =====================

model Organization {
  id              String        @id @default(uuid())
  name            String
  slug            String        @unique
  logoUrl         String?
  
  // Settings
  currency        String        @default("VND")
  timezone        String        @default("Asia/Ho_Chi_Minh")
  fiscalYearStart Int           @default(1) // Month (1-12)
  
  // Relationships
  users           User[]
  invoices        Invoice[]
  transactions    Transaction[]
  accounts        Account[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([slug])
}

// ===================== ACCOUNTING STRUCTURE =====================

model Account {
  id              String        @id @default(uuid())
  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  code            String        // e.g., "1121" (Tiền mặt)
  name            String
  type            AccountType
  parentId        String?
  parent          Account?      @relation("AccountHierarchy", fields: [parentId], references: [id])
  children        Account[]     @relation("AccountHierarchy")
  
  balance         Decimal       @default(0) @db.Decimal(19, 4)
  
  transactions    Transaction[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@unique([organizationId, code])
  @@index([organizationId])
  @@index([parentId])
}

enum AccountType {
  ASSET          // Tài sản
  LIABILITY      // Nợ phải trả
  EQUITY         // Vốn chủ sở hữu
  REVENUE        // Doanh thu
  EXPENSE        // Chi phí
}

// ===================== INVOICES =====================

model Invoice {
  id              String            @id @default(uuid())
  organizationId  String
  organization    Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  invoiceNumber   String
  type            InvoiceType
  status          InvoiceStatus     @default(DRAFT)
  
  // Dates
  issueDate       DateTime
  dueDate         DateTime?
  paidDate        DateTime?
  
  // Amounts (CRITICAL: Use Decimal for financial data)
  subtotal        Decimal           @db.Decimal(19, 4)
  taxAmount       Decimal           @default(0) @db.Decimal(19, 4)
  totalAmount     Decimal           @db.Decimal(19, 4)
  
  // Partner Info
  partnerName     String
  partnerTaxId    String?
  partnerAddress  String?
  
  // File Attachment
  fileUrl         String?
  extractedData   Json?             // OCR extracted data
  
  // Workflow
  createdById     String
  createdBy       User              @relation("CreatedBy", fields: [createdById], references: [id])
  approvedById    String?
  approvedBy      User?             @relation("ApprovedBy", fields: [approvedById], references: [id])
  approvedAt      DateTime?
  
  // Relationships
  lineItems       InvoiceLineItem[]
  transactions    Transaction[]
  
  notes           String?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@unique([organizationId, invoiceNumber])
  @@index([organizationId])
  @@index([status])
  @@index([issueDate])
}

enum InvoiceType {
  PURCHASE       // Hóa đơn mua hàng
  SALE           // Hóa đơn bán hàng
}

enum InvoiceStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  PAID
  CANCELLED
  OVERDUE
}

model InvoiceLineItem {
  id              String   @id @default(uuid())
  invoiceId       String
  invoice         Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  description     String
  quantity        Decimal  @db.Decimal(19, 4)
  unitPrice       Decimal  @db.Decimal(19, 4)
  amount          Decimal  @db.Decimal(19, 4)
  
  accountCode     String?  // Link to Chart of Accounts
  
  createdAt       DateTime @default(now())
  
  @@index([invoiceId])
}

// ===================== TRANSACTIONS (CRITICAL FOR ACID) =====================

model Transaction {
  id              String           @id @default(uuid())
  organizationId  String
  organization    Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  transactionDate DateTime
  description     String
  
  // Link to source document
  invoiceId       String?
  invoice         Invoice?         @relation(fields: [invoiceId], references: [id])
  
  // Double-entry bookkeeping
  entries         TransactionEntry[]
  
  // Audit trail
  createdById     String
  createdBy       User             @relation("CreatedBy", fields: [createdById], references: [id])
  
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  @@index([organizationId])
  @@index([transactionDate])
  @@index([invoiceId])
}

model TransactionEntry {
  id              String      @id @default(uuid())
  transactionId   String
  transaction     Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  
  accountId       String
  account         Account     @relation(fields: [accountId], references: [id])
  
  // CRITICAL: Debit/Credit must balance
  debit           Decimal     @default(0) @db.Decimal(19, 4)
  credit          Decimal     @default(0) @db.Decimal(19, 4)
  
  description     String?
  
  createdAt       DateTime    @default(now())
  
  @@index([transactionId])
  @@index([accountId])
}

// ===================== AUDIT LOG =====================

model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  action      String   // "INVOICE_CREATED", "TRANSACTION_APPROVED", etc.
  entityType  String   // "Invoice", "Transaction", etc.
  entityId    String
  changes     Json?    // Store before/after states
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

### Key Design Decisions:

1. **Decimal cho Financial Data:** Tất cả số tiền dùng `Decimal` với precision 19,4 để tránh floating-point errors
2. **ACID Transaction:** Model `Transaction` + `TransactionEntry` đảm bảo double-entry bookkeeping
3. **Audit Trail:** Mọi thay đổi quan trọng đều log vào `AuditLog`
4. **WebAuthn Support:** Table riêng cho credentials, support multiple devices/user
5. **Soft Delete (optional):** Có thể thêm `deletedAt` field nếu cần

---

## 🔐 3. AUTHENTICATION FLOW (Passwordless + WebAuthn)

### 3.1. Magic Link Flow (Passwordless Email)

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  Client  │                    │  NestJS  │                    │ Database │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                                │                              │
     │  1. POST /auth/magic-link     │                              │
     │    { email: "user@company" }  │                              │
     ├──────────────────────────────>│                              │
     │                                │  2. Generate unique token   │
     │                                │     (UUID + expiry 15min)   │
     │                                ├─────────────────────────────>│
     │                                │                              │
     │                                │  3. Send email with link    │
     │                                │     (background job)         │
     │  4. "Email sent!"              │                              │
     │<───────────────────────────────┤                              │
     │                                │                              │
     │  5. User clicks email link    │                              │
     │     GET /auth/verify?token=…  │                              │
     ├──────────────────────────────>│                              │
     │                                │  6. Validate token           │
     │                                ├─────────────────────────────>│
     │                                │  7. Mark token as used       │
     │                                │  8. Create session (JWT)     │
     │  9. Redirect + Set JWT Cookie  │                              │
     │<───────────────────────────────┤                              │
     │                                │                              │
```

**Implementation (NestJS):**

```typescript
// auth.service.ts
async sendMagicLink(email: string) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  await prisma.magicLink.create({
    data: { email, token, expiresAt }
  });
  
  await emailService.send({
    to: email,
    subject: 'Login to Tokens_taken',
    html: `<a href="${process.env.APP_URL}/auth/verify?token=${token}">Click to login</a>`
  });
}

async verifyMagicLink(token: string) {
  const link = await prisma.magicLink.findUnique({ where: { token } });
  
  if (!link || link.usedAt || link.expiresAt < new Date()) {
    throw new UnauthorizedException('Invalid or expired link');
  }
  
  await prisma.magicLink.update({
    where: { id: link.id },
    data: { usedAt: new Date() }
  });
  
  const user = await prisma.user.findUnique({ where: { email: link.email } });
  return this.generateJWT(user);
}
```

### 3.2. WebAuthn Flow (Passkeys/Biometric)

**Registration Flow:**

```
Client                          NestJS                          Browser WebAuthn API
  │                               │                                      │
  │ 1. POST /auth/webauthn/register                                     │
  │    { email: "user@company" }  │                                      │
  ├──────────────────────────────>│                                      │
  │                               │ 2. Generate challenge (random bytes) │
  │ 3. Return challenge options   │                                      │
  │<───────────────────────────────┤                                      │
  │                               │                                      │
  │ 4. navigator.credentials.create(options)                            │
  ├─────────────────────────────────────────────────────────────────────>│
  │                               │                          5. Show biometric prompt
  │ 6. Return credential          │                                      │
  │<─────────────────────────────────────────────────────────────────────┤
  │                               │                                      │
  │ 7. POST /auth/webauthn/verify │                                      │
  │    { credential, challenge }  │                                      │
  ├──────────────────────────────>│                                      │
  │                               │ 8. Verify signature                  │
  │                               │ 9. Store credential in DB            │
  │ 10. Return JWT                │                                      │
  │<───────────────────────────────┤                                      │
```

**Implementation (NestJS + @simplewebauthn/server):**

```typescript
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

// Registration
async startWebAuthnRegistration(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  const options = await generateRegistrationOptions({
    rpName: 'Tokens_taken',
    rpID: process.env.RP_ID, // e.g., 'tokens-taken.com'
    userID: user.id,
    userName: user.email,
    attestationType: 'none',
  });
  
  // Store challenge in Redis (temporary)
  await redis.setex(`webauthn:${userId}`, 300, options.challenge);
  
  return options;
}

async verifyWebAuthnRegistration(userId: string, credential: any) {
  const expectedChallenge = await redis.get(`webauthn:${userId}`);
  
  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: process.env.ORIGIN,
    expectedRPID: process.env.RP_ID,
  });
  
  if (verification.verified) {
    await prisma.webAuthnCredential.create({
      data: {
        userId,
        credentialId: Buffer.from(verification.registrationInfo.credentialID).toString('base64'),
        publicKey: Buffer.from(verification.registrationInfo.credentialPublicKey).toString('base64'),
        counter: verification.registrationInfo.counter,
      }
    });
  }
  
  return this.generateJWT(userId);
}
```

**Frontend (Next.js):**

```typescript
// app/auth/webauthn/page.tsx
import { startRegistration } from '@simplewebauthn/browser';

async function registerWebAuthn() {
  // 1. Get options from server
  const optionsRes = await fetch('/api/auth/webauthn/register');
  const options = await optionsRes.json();
  
  // 2. Trigger browser biometric prompt
  const credential = await startRegistration(options);
  
  // 3. Send credential to server for verification
  const verifyRes = await fetch('/api/auth/webauthn/verify', {
    method: 'POST',
    body: JSON.stringify(credential),
  });
  
  const { token } = await verifyRes.json();
  // Store JWT and redirect
}
```

### 3.3. Recommended Auth Strategy

**Kết hợp cả 2:**
- **Lần đầu tiên:** User dùng Magic Link để login
- **Sau khi login:** Prompt user đăng ký WebAuthn (Passkey) để lần sau login nhanh hơn
- **Lần sau:** User chỉ cần sinh trắc học (Face ID/Touch ID) → login trong 2 giây

**Security Layers:**
1. JWT với short-lived access token (15 phút) + refresh token (7 ngày)
2. Rate limiting trên Magic Link endpoint (5 requests/hour/email)
3. WebAuthn inherently 2FA (possession + biometric)

---

## 🎨 4. UX/UI DESIGN PRINCIPLES

### 4.1. Layout Architecture: "Command-First Dashboard"

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  Tokens_taken          [⌘K] Search      [User] [Notify] │ ← Sticky Top Bar (60px)
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────┐ ┌───────────────────────────────────────────┐ │
│ │ Sidebar       │ │  Main Workspace                           │ │
│ │ (Auto-hide)   │ │  ┌─────────────────────────────────────┐  │ │
│ │               │ │  │  Dashboard / Invoice List / Detail  │  │ │
│ │ • Dashboard   │ │  │  (Content loads instantly via SSR)  │  │ │
│ │ • Invoices    │ │  │                                     │  │ │
│ │ • Transactions│ │  │  [Table with Optimistic Updates]    │  │ │
│ │ • Reports     │ │  │                                     │  │ │
│ │               │ │  └─────────────────────────────────────┘  │ │
│ │ [Collapse]    │ │                                           │ │
│ └───────────────┘ └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         ↑                           ↑
    240px width               Auto-flex (fill remaining)
    (collapsible to 60px)
```

**Nguyên tắc:**
- **Sidebar tối giản:** Chỉ hiện icon khi collapse, expand khi hover
- **Main workspace full-width:** Tận dụng tối đa không gian cho data table
- **No unnecessary chrome:** Không có decorative borders, gradients, shadows nặng

---

### 4.2. The "Killer Features" Implementation

#### ✨ Feature 1: Command Palette (Ctrl+K / ⌘K)

**Tại sao cần:**
- Thay thế 5-6 clicks bằng 1 keyboard shortcut
- User có thể làm mọi thứ mà không rời tay khỏi bàn phím

**Chức năng:**
```
┌──────────────────────────────────────────────────┐
│  🔍 Type a command or search...                  │
├──────────────────────────────────────────────────┤
│  Quick Actions                                   │
│  ⚡ Create Invoice                    Ctrl+N     │
│  ⚡ Approve Pending                   Ctrl+A     │
│  💸 New Transaction                   Ctrl+T     │
│                                                  │
│  Recent Invoices                                 │
│  📄 INV-2024-001 - $1,500 (Pending)             │
│  📄 INV-2024-002 - $3,200 (Paid)                │
│                                                  │
│  Navigate                                        │
│  🏠 Go to Dashboard                              │
│  📊 Go to Reports                                │
└──────────────────────────────────────────────────┘
```

**Tech Implementation:**
- Library: `cmdk` (by Vercel) hoặc `kbar`
- Fuzzy search với `fuse.js`
- Server-side search API với debounce 300ms

#### ✨ Feature 2: Optimistic UI Updates

**Tại sao cần:**
- User thấy kết quả ngay lập tức → Cảm giác "instant"
- Nếu server fail → rollback + show error toast

**Example Flow:**
1. User click "Approve Invoice"
2. UI ngay lập tức chuyển status → "Approved" (màu xanh)
3. Background: POST /api/invoices/:id/approve
4. Nếu success → do nothing (UI đã update rồi)
5. Nếu fail → rollback UI + show "❌ Failed to approve"

**Tech Implementation:**
```typescript
// Using React Query
const { mutate } = useMutation({
  mutationFn: approveInvoice,
  onMutate: async (invoiceId) => {
    // Optimistically update UI
    await queryClient.cancelQueries(['invoices']);
    const previous = queryClient.getQueryData(['invoices']);
    
    queryClient.setQueryData(['invoices'], (old) =>
      old.map(inv => inv.id === invoiceId ? { ...inv, status: 'APPROVED' } : inv)
    );
    
    return { previous }; // For rollback
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['invoices'], context.previous);
    toast.error('Failed to approve invoice');
  },
});
```

#### ✨ Feature 3: Bulk Drag & Drop Invoice Processing

**Tại sao cần:**
- Kế toán thường xử lý hàng chục hóa đơn cùng lúc
- Drag & drop PDF → auto-extract → 1-click approve tất cả

**UI Flow:**
```
┌────────────────────────────────────────────────┐
│  Drag & Drop Invoices Here (or click to browse)│
│  ┌──────────────────────────────────────────┐  │
│  │  📄 invoice1.pdf ✅ Extracted             │  │
│  │  📄 invoice2.pdf ⏳ Processing...         │  │
│  │  📄 invoice3.pdf ❌ Failed (manual edit)  │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  [Review All] [Approve All (2/3)]             │
└────────────────────────────────────────────────┘
```

**Tech Stack:**
- Upload: `react-dropzone`
- OCR: Cloud Vision API / Tesseract.js (for simple invoices)
- Queue: Bull (Redis-based job queue) để xử lý batch processing

---

### 4.3. Top 3 UX/UI Recommendations

#### 1️⃣ **Data Density > Visual Fluff**
   - **Principle:** Hiển thị nhiều data nhất có thể trên 1 màn hình mà không bị overwhelm
   - **How:** 
     - Table với compact row height (40px thay vì 60px)
     - Font size nhỏ hơn (14px body, 12px secondary text)
     - Màu sắc subtle (Gray scale chủ yếu, chỉ dùng color cho status)
   - **Example:** Salesforce Lightning, Linear.app

#### 2️⃣ **Keyboard-First Navigation**
   - **Principle:** Mọi thao tác quan trọng phải có keyboard shortcut
   - **How:**
     - Command Palette (⌘K) là entry point chính
     - Arrow keys để navigate trong table
     - Enter để open detail, Escape để close modal
     - Show hints nhẹ bên cạnh buttons: `Approve (⌘⏎)`
   - **Example:** Gmail, Notion, Linear

#### 3️⃣ **Progressive Disclosure + Smart Defaults**
   - **Principle:** Không show hết mọi field ngay từ đầu → overwhelm user
   - **How:**
     - Form tạo Invoice chỉ show 4-5 fields bắt buộc
     - Advanced options ẩn sau "Show more options"
     - Auto-fill thông tin dựa trên context (e.g., VAT rate mặc định 10%)
     - Validation real-time ngay khi user type (không đợi submit)
   - **Example:** Stripe Dashboard, Gusto Payroll

---

## 🚀 5. PERFORMANCE OPTIMIZATION CHECKLIST

### Frontend (Next.js)
- ✅ **SSR/SSG:** Dashboard + Invoice list dùng `getServerSideProps` để load nhanh
- ✅ **Image Optimization:** `next/image` với lazy loading
- ✅ **Code Splitting:** Dynamic imports cho heavy components
- ✅ **React Query:** Aggressive caching + stale-while-revalidate
- ✅ **Virtualization:** Dùng `react-window` cho tables >100 rows

### Backend (NestJS)
- ✅ **Redis Caching:** Cache query results (TTL 5 phút)
- ✅ **Database Indexing:** Indexes trên mọi foreign keys + query fields
- ✅ **Connection Pooling:** Prisma connection pool (min: 5, max: 20)
- ✅ **Rate Limiting:** Throttle API endpoints (100 req/min/user)
- ✅ **Compression:** Gzip responses >1KB

### Database (PostgreSQL)
- ✅ **Read Replicas:** Phân tách read/write traffic
- ✅ **Materialized Views:** Pre-compute dashboard statistics
- ✅ **Partitioning:** Partition `transactions` table by year nếu data lớn

---

## 📦 6. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────┐
│  Cloudflare / AWS CloudFront (CDN)              │
│  - Static assets caching                        │
│  - DDoS protection                              │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│  Load Balancer (AWS ALB / Vercel)               │
└────────────────┬────────────────────────────────┘
                 ↓
         ┌───────┴────────┐
         ↓                ↓
┌──────────────┐  ┌──────────────┐
│ Next.js App  │  │ NestJS API   │
│ (Vercel)     │  │ (AWS ECS)    │
│ - SSR/SSG    │  │ - Auto-scale │
└──────────────┘  └──────┬───────┘
                         ↓
                 ┌───────┴────────┐
                 ↓                ↓
         ┌──────────────┐  ┌──────────────┐
         │ PostgreSQL   │  │ Redis        │
         │ (AWS RDS)    │  │ (ElastiCache)│
         │ Multi-AZ     │  │ Cluster      │
         └──────────────┘  └──────────────┘
```

**Khuyến nghị:**
- **Frontend:** Deploy trên Vercel (zero-config, tối ưu cho Next.js)
- **Backend:** AWS ECS Fargate (containerized NestJS)
- **Database:** AWS RDS PostgreSQL (Managed service, auto-backup)
- **Redis:** AWS ElastiCache (Managed Redis cluster)

---

## 📝 7. DEVELOPMENT ROADMAP (MVP → Full Product)

### Phase 1: MVP (4-6 tuần) 🎯
- [ ] Authentication (Magic Link + WebAuthn)
- [ ] Organization & User Management
- [ ] Basic Invoice CRUD (Manual entry only)
- [ ] Simple Dashboard (Invoice list + stats)
- [ ] Command Palette (basic navigation)

### Phase 2: Core Features (6-8 tuần)
- [ ] Bulk Invoice Upload + OCR Extraction
- [ ] Transaction Management (Double-entry)
- [ ] Approval Workflow
- [ ] Real-time updates (WebSocket)
- [ ] Optimistic UI

### Phase 3: Advanced Features (8-10 tuần)
- [ ] Advanced Reporting (Custom date ranges, export)
- [ ] Multi-currency support
- [ ] Recurring invoices
- [ ] Mobile responsive UI
- [ ] Audit logs viewer

### Phase 4: Scale & Polish (Ongoing)
- [ ] Advanced search (full-text search)
- [ ] API for third-party integrations
- [ ] White-label support
- [ ] AI-powered insights (spending patterns, anomaly detection)

---

## 🛡️ 8. SECURITY CONSIDERATIONS

### Critical Security Measures:
1. **SQL Injection:** Prisma ORM đã prevent (parameterized queries)
2. **XSS:** Next.js auto-escapes JSX, nhưng validate user input trên server
3. **CSRF:** Next.js CSRF tokens cho form submissions
4. **Rate Limiting:** Implement trên auth endpoints (prevent brute force)
5. **Data Encryption:** 
   - Passwords: N/A (passwordless)
   - Sensitive data: Encrypt at rest (AWS RDS encryption)
   - Transit: HTTPS only (force SSL redirect)
6. **RBAC:** Implement role-based permissions (Owner/Admin/Accountant/Member)
7. **Audit Logs:** Log mọi critical actions (delete, approve, money transfer)

---

## 🧪 9. TESTING STRATEGY

### Unit Tests (Jest + React Testing Library)
- **Coverage Target:** >80% cho critical paths
- **Focus:** Service layer (NestJS), utility functions, React hooks

### Integration Tests (Playwright / Cypress)
- **Critical Flows:**
  - Login flow (Magic Link + WebAuthn)
  - Invoice creation → approval → payment
  - Transaction balancing (debit = credit)

### Load Testing (k6 / Artillery)
- **Scenarios:**
  - 100 concurrent users uploading invoices
  - 1000 dashboard page loads/second
  - Transaction write throughput (target: 500 TPS)

---

## 📚 10. TECH STACK SUMMARY

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) | SSR/SSG, optimal performance, React Server Components |
| **UI Framework** | React 18 + TypeScript | Type safety, component reusability |
| **Styling** | Tailwind CSS v4 | Rapid development, minimalist design |
| **State Management** | React Query (TanStack Query) | Server state caching, optimistic updates |
| **Backend** | NestJS + TypeScript | Structured architecture, dependency injection |
| **ORM** | Prisma | Type-safe DB access, migrations |
| **Database** | PostgreSQL 15 | ACID compliance, JSON support, mature |
| **Caching** | Redis | Session storage, query cache, rate limiting |
| **Authentication** | Passport.js + @simplewebauthn | Passwordless + WebAuthn support |
| **Real-time** | Socket.io / WebSockets | Live updates for invoices, notifications |
| **File Storage** | AWS S3 / Cloudflare R2 | Invoice PDFs, avatars |
| **Email** | SendGrid / AWS SES | Magic link delivery |
| **Deployment** | Vercel (FE) + AWS ECS (BE) | Scalable, managed infrastructure |
| **Monitoring** | Sentry + DataDog | Error tracking, performance monitoring |

---

## 🎯 NEXT STEPS

1. **Review Kiến trúc:** Xem xét và feedback về design decisions
2. **Setup Repository:** Monorepo (Turborepo) hoặc separate repos?
3. **Environment Setup:** Docker Compose cho local development
4. **Kickoff Development:** Start với Phase 1 MVP

---

**Document Version:** 2.0 — Updated with Monorepo Architecture
**Last Updated:** 2026-05-15
**Author:** AI Software Architect
**Status:** Active Development ✅
