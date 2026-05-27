// ─────────────────────────────────────────────────────────────
// TransactionService — create, list, approve/reject transactions
// ACID-compliant double-entry ledger via Prisma $transaction.
// Owned by Task 3.
// ─────────────────────────────────────────────────────────────

import { PrismaClient, Prisma, TransactionStatus, TransactionType } from "@prisma/client";
import type {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  ApproveTransactionDTO,
  TransactionQuery,
  Transaction as TxView,
  TransactionSummary,
} from "@tokens-taken/shared-types";
import { isBalanced } from "../../../packages/common-utils/src/currency/currency.utils";
import { DEFAULT_CONFIG } from "./transaction.types";

// ─── helpers ──────────────────────────────────────────────────

function toView(row: any): TxView {
  return {
    id:             row.id,
    organizationId: row.organizationId,
    reference:      row.reference,
    type:           row.type,
    status:         row.status,
    description:    row.description,
    date:           row.date?.toISOString?.()      ?? row.date,
    amount:         row.amount?.toString()          ?? "0",
    currency:       row.currency,
    exchangeRate:   row.exchangeRate?.toString()    ?? "1",
    metadata:       row.metadata ?? {},
    approvedAt:     row.approvedAt?.toISOString?.() ?? null,
    approvedById:   row.approvedById               ?? null,
    createdAt:      row.createdAt?.toISOString?.()  ?? row.createdAt,
    updatedAt:      row.updatedAt?.toISOString?.()  ?? row.updatedAt,
    journalEntries: row.journalEntries?.map((e: any) => ({
      id:            e.id,
      transactionId: e.transactionId,
      accountId:     e.accountId,
      account:       e.account
        ? { id: e.account.id, code: e.account.code, name: e.account.name, type: e.account.type }
        : undefined,
      debit:         e.debit?.toString()  ?? "0",
      credit:        e.credit?.toString() ?? "0",
      description:   e.description,
      createdAt:     e.createdAt?.toISOString?.() ?? e.createdAt,
    })),
    approvals: row.approvals?.map((a: any) => ({
      id:            a.id,
      transactionId: a.transactionId,
      userId:        a.userId,
      action:        a.action,
      comment:       a.comment,
      decidedAt:     a.decidedAt?.toISOString?.() ?? a.decidedAt,
    })),
  };
}

// ─── service class ────────────────────────────────────────────

export class TransactionService {
  constructor(private prisma: PrismaClient) {}

  // ── Generate next reference ─────────────────────────────────
  private async nextReference(orgId: string, tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx ?? this.prisma;
    const year = new Date().getFullYear();
    const prefix = `TXN-${year}-`;

    const last = await (client as any).transaction.findFirst({
      where: {
        organizationId: orgId,
        reference: { startsWith: prefix },
      },
      orderBy: { createdAt: "desc" },
      select: { reference: true },
    });

    let seq = 1;
    if (last?.reference) {
      const parts = last.reference.split("-");
      seq = parseInt(parts[parts.length - 1] ?? "0", 10) + 1;
    }
    return `${prefix}${seq.toString().padStart(6, "0")}`;
  }

  // ── CREATE ──────────────────────────────────────────────────
  /**
   * Creates a new Transaction with its JournalEntries inside a
   * Prisma interactive transaction (Serializable isolation).
   * Also writes to AuditLog.
   */
  async create(
    organizationId: string,
    userId: string,
    dto: CreateTransactionDTO,
  ): Promise<TxView> {
    // Validate debit = credit
    if (!isBalanced(dto.entries)) {
      throw new Error("Journal entries are not balanced: total debit ≠ total credit");
    }

    if (dto.entries.length === 0) {
      throw new Error("At least one journal entry is required");
    }

    if (dto.entries.length > DEFAULT_CONFIG.maxEntriesPerTransaction) {
      throw new Error(`Too many entries (max ${DEFAULT_CONFIG.maxEntriesPerTransaction})`);
    }

    return this.prisma.$transaction(
      async (tx) => {
        const reference = await this.nextReference(organizationId, tx);

        // 1. Create the Transaction record
        const transaction = await tx.transaction.create({
          data: {
            organizationId,
            reference,
            type:         dto.type as TransactionType,
            status:       "PENDING" as TransactionStatus,
            description:  dto.description ?? null,
            date:         dto.date ? new Date(dto.date) : new Date(),
            amount:       dto.amount,
            currency:     dto.currency ?? DEFAULT_CONFIG.defaultCurrency,
            exchangeRate: dto.exchangeRate ?? "1",
            metadata:     (dto.metadata as any) ?? {},
          },
        });

        // 2. Create JournalEntries (double-entry bookkeeping)
        for (const entry of dto.entries) {
          // Frontend sends 'code' (e.g. '111') in accountId for now since it's hardcoded mock data.
          // Wait, the DTO says accountId, but we're passing the code. Let's look up by code.
          let account = await tx.account.findFirst({ where: { id: entry.accountId, organizationId } });
          if (!account) {
            // fallback: try finding by code
            account = await tx.account.findUnique({ where: { organizationId_code: { organizationId, code: entry.accountId } } });
          }
          
          if (!account) throw new Error(`Account not found for ID or Code: ${entry.accountId}`);
          if (account.organizationId !== organizationId) {
            throw new Error(`Account ${entry.accountId} belongs to a different organization`);
          }

          await tx.journalEntry.create({
            data: {
              transactionId: transaction.id,
              accountId:     account.id, // Use the real ID!
              debit:         entry.debit,
              credit:        entry.credit,
              description:   entry.description ?? null,
            },
          });

          // 3. Update account balance
          //    ASSET & EXPENSE: balance increases with debit
          //    LIABILITY, EQUITY, REVENUE: balance increases with credit
          const debitAmount  = parseFloat(entry.debit);
          const creditAmount = parseFloat(entry.credit);
          let balanceDelta: number;

          if (account.type === "ASSET" || account.type === "EXPENSE") {
            balanceDelta = debitAmount - creditAmount;
          } else {
            balanceDelta = creditAmount - debitAmount;
          }

          // BALANCE CHECK: Prevent ASSET accounts (like Cash, Bank) from going negative
          if (account.type === "ASSET" && balanceDelta < 0) {
            const currentBalance = parseFloat(account.balance.toString());
            if (currentBalance + balanceDelta < 0) {
              throw new Error(
                `Số dư quỹ/tài khoản "${account.name}" không đủ! Hiện có: ${currentBalance}, cần chi: ${Math.abs(balanceDelta)}`
              );
            }
          }

          await tx.account.update({
            where: { id: account.id },
            data: { balance: { increment: balanceDelta } },
          });
        }

        // 4. Link to invoice if provided
        if (dto.invoiceId) {
          await tx.invoiceTransaction.create({
            data: {
              invoiceId:     dto.invoiceId,
              transactionId: transaction.id,
            },
          });
        }

        // 5. Audit log (append-only)
        await tx.auditLog.create({
          data: {
            organizationId,
            userId,
            action:     "transaction.create",
            entityType: "Transaction",
            entityId:   transaction.id,
            changes:    { after: { reference, type: dto.type, amount: dto.amount } },
          },
        });

        // Re-fetch with relations
        const full = await tx.transaction.findUniqueOrThrow({
          where: { id: transaction.id },
          include: {
            journalEntries: { include: { account: true } },
            approvals: true,
          },
        });

        return toView(full);
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: DEFAULT_CONFIG.transactionTimeout,
      },
    );
  }

  // ── LIST (paginated) ────────────────────────────────────────
  async list(organizationId: string, query?: TransactionQuery) {
    const page     = query?.page     ?? 1;
    const pageSize = query?.pageSize ?? 20;
    const skip     = (page - 1) * pageSize;

    const where: Prisma.TransactionWhereInput = { organizationId };

    if (query?.status)   where.status = query.status as TransactionStatus;
    if (query?.type)     where.type   = query.type   as TransactionType;
    if (query?.dateFrom || query?.dateTo) {
      where.date = {};
      if (query.dateFrom) (where.date as any).gte = new Date(query.dateFrom);
      if (query.dateTo)   (where.date as any).lte = new Date(query.dateTo);
    }
    if (query?.search) {
      where.OR = [
        { reference:   { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.TransactionOrderByWithRelationInput[] = [
      { [query?.sortBy ?? "createdAt"]: query?.sortOrder ?? "desc" },
      { createdAt: "desc" },
    ];

    const [rows, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          journalEntries: { include: { account: true } },
          approvals: true,
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: rows.map(toView),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // ── GET by id ───────────────────────────────────────────────
  async getById(id: string): Promise<TxView | null> {
    const row = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        journalEntries: { include: { account: true } },
        approvals: true,
      },
    });
    return row ? toView(row) : null;
  }

  // ── UPDATE (only PENDING transactions) ──────────────────────
  async update(id: string, userId: string, dto: UpdateTransactionDTO): Promise<TxView> {
    return this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.transaction.findUnique({ where: { id } });
        if (!existing) throw new Error(`Transaction not found: ${id}`);
        if (existing.status !== "PENDING") {
          throw new Error("Only PENDING transactions can be updated");
        }

        const before = { description: existing.description, metadata: existing.metadata };

        const updated = await tx.transaction.update({
          where: { id },
          data: {
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.metadata    !== undefined ? { metadata: dto.metadata as any }       : {}),
          },
          include: {
            journalEntries: { include: { account: true } },
            approvals: true,
          },
        });

        await tx.auditLog.create({
          data: {
            organizationId: existing.organizationId,
            userId,
            action:     "transaction.update",
            entityType: "Transaction",
            entityId:   id,
            changes:    { before, after: { description: updated.description, metadata: updated.metadata } },
          },
        });

        return toView(updated);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: DEFAULT_CONFIG.transactionTimeout },
    );
  }

  // ── CHANGE STATUS (APPROVE / REJECT / PENDING) ──────────────
  async approve(
    id: string,
    userId: string,
    dto: ApproveTransactionDTO,
  ): Promise<TxView> {
    return this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.transaction.findUnique({ where: { id } });
        if (!existing) throw new Error(`Transaction not found: ${id}`);

        // Determine new status
        let newStatus: TransactionStatus;
        switch (dto.action) {
          case "APPROVE":
            newStatus = "APPROVED";
            break;
          case "REJECT":
            newStatus = "REJECTED";
            break;
          case "REQUEST_INFO":
            newStatus = "PENDING";
            break;
          default:
            throw new Error(`Invalid approval action: ${dto.action}`);
        }

        if (existing.status === newStatus) {
          return toView(existing);
        }

        // Create approval/status-change record
        await tx.transactionApproval.create({
          data: {
            transactionId: id,
            userId,
            action:  dto.action as any,
            comment: dto.comment ?? null,
          },
        });

        // Update transaction status
        const updated = await tx.transaction.update({
          where: { id },
          data: {
            status: newStatus,
            ...(dto.action === "APPROVE" ? { approvedAt: new Date(), approvedById: userId } : {})
          },
          include: {
            journalEntries: { include: { account: true } },
            approvals: true,
          },
        });

        // BALANCE HANDLING
        // If current state has balances APPLIED (APPROVED, PENDING)
        // and new state has balances REVERSED (REJECTED, CANCELLED)
        const currentlyApplied = existing.status === "APPROVED" || existing.status === "PENDING";
        const willBeApplied = newStatus === "APPROVED" || newStatus === "PENDING";

        if (currentlyApplied && !willBeApplied) {
          // REVERSE the account balance changes
          const entries = await tx.journalEntry.findMany({
            where: { transactionId: id },
            include: { account: true },
          });
          for (const entry of entries) {
            const debitAmt  = parseFloat(entry.debit.toString());
            const creditAmt = parseFloat(entry.credit.toString());
            let reverseDelta: number;

            if (entry.account.type === "ASSET" || entry.account.type === "EXPENSE") {
              reverseDelta = creditAmt - debitAmt; // reverse of (debit - credit)
            } else {
              reverseDelta = debitAmt - creditAmt; // reverse of (credit - debit)
            }

            await tx.account.update({
              where: { id: entry.accountId },
              data: { balance: { increment: reverseDelta } },
            });
          }
        } else if (!currentlyApplied && willBeApplied) {
          // RE-APPLY the account balance changes
          const entries = await tx.journalEntry.findMany({
            where: { transactionId: id },
            include: { account: true },
          });
          for (const entry of entries) {
            const debitAmt  = parseFloat(entry.debit.toString());
            const creditAmt = parseFloat(entry.credit.toString());
            let applyDelta: number;

            if (entry.account.type === "ASSET" || entry.account.type === "EXPENSE") {
              applyDelta = debitAmt - creditAmt; 
            } else {
              applyDelta = creditAmt - debitAmt;
            }

            // BALANCE CHECK
            if (entry.account.type === "ASSET" && applyDelta < 0) {
              const currentBalance = parseFloat(entry.account.balance.toString());
              if (currentBalance + applyDelta < 0) {
                throw new Error(
                  `Số dư quỹ/tài khoản "${entry.account.name}" không đủ để chuyển lại trạng thái này! Hiện có: ${currentBalance}, cần chi: ${Math.abs(applyDelta)}`
                );
              }
            }

            await tx.account.update({
              where: { id: entry.accountId },
              data: { balance: { increment: applyDelta } },
            });
          }
        }

        // Audit log
        await tx.auditLog.create({
          data: {
            organizationId: existing.organizationId,
            userId,
            action:     `transaction.status_change`,
            entityType: "Transaction",
            entityId:   id,
            changes:    {
              before: { status: existing.status },
              after:  { status: newStatus, comment: dto.comment },
            },
          },
        });

        return toView(updated);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: DEFAULT_CONFIG.transactionTimeout },
    );
  }

  // ── CANCEL ──────────────────────────────────────────────────
  async cancel(id: string, userId: string): Promise<TxView> {
    return this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.transaction.findUnique({ where: { id } });
        if (!existing) throw new Error(`Transaction not found: ${id}`);
        if (existing.status === "CANCELLED") {
          throw new Error("Transaction is already cancelled");
        }

        // Reverse balance changes if previously counted
        if (existing.status === "PENDING" || existing.status === "APPROVED") {
          const entries = await tx.journalEntry.findMany({
            where: { transactionId: id },
            include: { account: true },
          });
          for (const entry of entries) {
            const debitAmt  = parseFloat(entry.debit.toString());
            const creditAmt = parseFloat(entry.credit.toString());
            let reverseDelta: number;

            if (entry.account.type === "ASSET" || entry.account.type === "EXPENSE") {
              reverseDelta = creditAmt - debitAmt;
            } else {
              reverseDelta = debitAmt - creditAmt;
            }

            await tx.account.update({
              where: { id: entry.accountId },
              data: { balance: { increment: reverseDelta } },
            });
          }
        }

        const updated = await tx.transaction.update({
          where: { id },
          data: { status: "CANCELLED" },
          include: {
            journalEntries: { include: { account: true } },
            approvals: true,
          },
        });

        await tx.auditLog.create({
          data: {
            organizationId: existing.organizationId,
            userId,
            action:     "transaction.cancel",
            entityType: "Transaction",
            entityId:   id,
            changes:    { before: { status: existing.status }, after: { status: "CANCELLED" } },
          },
        });

        return toView(updated);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: DEFAULT_CONFIG.transactionTimeout },
    );
  }

  // ── SUMMARY (for Dashboard / Reports) ───────────────────────
  async getSummary(organizationId: string, dateFrom?: string, dateTo?: string): Promise<TransactionSummary> {
    const where: Prisma.TransactionWhereInput = {
      organizationId,
      status: { not: "CANCELLED" },
    };
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as any).gte = new Date(dateFrom);
      if (dateTo)   (where.date as any).lte = new Date(dateTo);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      select: { type: true, status: true, amount: true, currency: true },
    });

    let totalIncome  = 0;
    let totalExpense = 0;
    let pendingCount  = 0;
    let approvedCount = 0;

    for (const t of transactions) {
      const amt = parseFloat(t.amount.toString());
      if (t.type === "INCOME")  totalIncome  += amt;
      if (t.type === "EXPENSE") totalExpense += amt;
      if (t.status === "PENDING")  pendingCount++;
      if (t.status === "APPROVED") approvedCount++;
    }

    return {
      totalIncome:   totalIncome.toFixed(4),
      totalExpense:  totalExpense.toFixed(4),
      netCashFlow:   (totalIncome - totalExpense).toFixed(4),
      pendingCount,
      approvedCount,
      currency: "VND",
    };
  }
}
