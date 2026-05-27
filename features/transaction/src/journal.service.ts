// ─────────────────────────────────────────────────────────────
// JournalService — query & validate journal entries
// Provides ledger balance reporting used by Task 6 (Reports).
// Owned by Task 3.
// ─────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import type {
  JournalEntry as JournalView,
  LedgerBalance,
} from "@tokens-taken/shared-types";

// ─── helpers ──────────────────────────────────────────────────

function toView(row: any): JournalView {
  return {
    id:            row.id,
    transactionId: row.transactionId,
    accountId:     row.accountId,
    account:       row.account
      ? { id: row.account.id, code: row.account.code, name: row.account.name, type: row.account.type }
      : undefined,
    debit:         row.debit?.toString()  ?? "0",
    credit:        row.credit?.toString() ?? "0",
    description:   row.description,
    createdAt:     row.createdAt?.toISOString?.() ?? row.createdAt,
  };
}

// ─── service class ────────────────────────────────────────────

export class JournalService {
  constructor(private prisma: PrismaClient) {}

  // ── Get entries for a specific transaction ──────────────────
  async getByTransactionId(transactionId: string): Promise<JournalView[]> {
    const rows = await this.prisma.journalEntry.findMany({
      where: { transactionId },
      include: { account: true },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toView);
  }

  // ── Get entries for a specific account ──────────────────────
  async getByAccountId(
    accountId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<JournalView[]> {
    const where: any = { accountId };
    if (dateFrom || dateTo) {
      where.transaction = { date: {} };
      if (dateFrom) where.transaction.date.gte = new Date(dateFrom);
      if (dateTo)   where.transaction.date.lte = new Date(dateTo);
    }

    const rows = await this.prisma.journalEntry.findMany({
      where,
      include: { account: true, transaction: { select: { date: true, reference: true, status: true } } },
      orderBy: { createdAt: "asc" },
    });

    // Filter out CANCELLED and REJECTED transactions
    return rows
      .filter((r: any) => r.transaction?.status !== "CANCELLED" && r.transaction?.status !== "REJECTED")
      .map(toView);
  }

  // ── Ledger balance report (for Reports / Dashboard) ─────────
  async getLedgerBalances(organizationId: string): Promise<LedgerBalance[]> {
    const accounts = await this.prisma.account.findMany({
      where: { organizationId, isActive: true },
      include: {
        journalEntries: {
          include: {
            transaction: { select: { status: true } },
          },
        },
      },
      orderBy: { code: "asc" },
    });

    return accounts.map((acc) => {
      // Only count entries from non-cancelled/non-rejected transactions
      const validEntries = acc.journalEntries.filter(
        (e: any) => e.transaction?.status !== "CANCELLED" && e.transaction?.status !== "REJECTED",
      );

      const debitTotal  = validEntries.reduce((s, e) => s + parseFloat(e.debit.toString()),  0);
      const creditTotal = validEntries.reduce((s, e) => s + parseFloat(e.credit.toString()), 0);

      let balance: number;
      if (acc.type === "ASSET" || acc.type === "EXPENSE") {
        balance = debitTotal - creditTotal;
      } else {
        balance = creditTotal - debitTotal;
      }

      return {
        accountId:   acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        accountType: acc.type,
        debitTotal:  debitTotal.toFixed(4),
        creditTotal: creditTotal.toFixed(4),
        balance:     balance.toFixed(4),
      };
    });
  }

  // ── Validate that a transaction's entries balance ───────────
  async validateBalance(transactionId: string): Promise<boolean> {
    const entries = await this.prisma.journalEntry.findMany({
      where: { transactionId },
    });

    const totalDebit  = entries.reduce((s, e) => s + parseFloat(e.debit.toString()),  0);
    const totalCredit = entries.reduce((s, e) => s + parseFloat(e.credit.toString()), 0);

    return Math.abs(totalDebit - totalCredit) < 0.0001;
  }
}
