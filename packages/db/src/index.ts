// Re-export PrismaClient + Prisma types for use across the monorepo
// All packages should import from here, not directly from @prisma/client

export { PrismaClient } from "@prisma/client";
export type {
  Organization,
  User,
  OrganizationMember,
  Session,
  WebAuthnCredential,
  Account,
  Transaction,
  JournalEntry,
  TransactionApproval,
  Invoice,
  InvoiceAssignment,
  InvoiceTransaction,
  Attachment,
  AuditLog,
  Plan,
  OrgRole,
  AccountType,
  TransactionType,
  TransactionStatus,
  ApprovalAction,
  InvoiceType,
  InvoiceStatus,
} from "@prisma/client";
