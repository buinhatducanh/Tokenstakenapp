// ─────────────────────────────────────────────────────────────
// TransactionController — NestJS-style REST controller
// Maps HTTP endpoints to TransactionService / AccountService.
// Owned by Task 3.
// ─────────────────────────────────────────────────────────────
//
// NOTE: The actual NestJS backend is not yet scaffolded (apps/backend/).
// This file provides the controller logic so it is ready to wire up
// once NestJS is in place.  For now it exports a plain class that
// can also be used as a request handler map.
// ─────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import { TransactionService } from "./transaction.service";
import { AccountService }     from "./account.service";
import { JournalService }     from "./journal.service";
import type {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  ApproveTransactionDTO,
  TransactionQuery,
  CreateAccountDTO,
  UpdateAccountDTO,
  AccountQuery,
} from "@tokens-taken/shared-types";

export class TransactionController {
  private txService:      TransactionService;
  private accountService: AccountService;
  private journalService: JournalService;

  constructor(prisma: PrismaClient) {
    this.txService      = new TransactionService(prisma);
    this.accountService = new AccountService(prisma);
    this.journalService = new JournalService(prisma);
  }

  // ─── Transaction endpoints ──────────────────────────────────

  /** POST /api/transactions */
  async createTransaction(orgId: string, userId: string, body: CreateTransactionDTO) {
    const data = await this.txService.create(orgId, userId, body);
    return { success: true, data };
  }

  /** GET /api/transactions */
  async listTransactions(orgId: string, query: TransactionQuery) {
    return this.txService.list(orgId, query);
  }

  /** GET /api/transactions/:id */
  async getTransaction(id: string) {
    const data = await this.txService.getById(id);
    if (!data) return { success: false, message: "Transaction not found" };
    return { success: true, data };
  }

  /** PATCH /api/transactions/:id */
  async updateTransaction(id: string, userId: string, body: UpdateTransactionDTO) {
    const data = await this.txService.update(id, userId, body);
    return { success: true, data };
  }

  /** POST /api/transactions/:id/approve */
  async approveTransaction(id: string, userId: string, body: ApproveTransactionDTO) {
    const data = await this.txService.approve(id, userId, body);
    return { success: true, data };
  }

  /** POST /api/transactions/:id/cancel */
  async cancelTransaction(id: string, userId: string) {
    const data = await this.txService.cancel(id, userId);
    return { success: true, data };
  }

  /** GET /api/transactions/summary */
  async getTransactionSummary(orgId: string, dateFrom?: string, dateTo?: string) {
    const data = await this.txService.getSummary(orgId, dateFrom, dateTo);
    return { success: true, data };
  }

  // ─── Account endpoints ──────────────────────────────────────

  /** POST /api/accounts */
  async createAccount(orgId: string, body: CreateAccountDTO) {
    const data = await this.accountService.create(orgId, body);
    return { success: true, data };
  }

  /** GET /api/accounts */
  async listAccounts(orgId: string, query?: AccountQuery) {
    const data = await this.accountService.list(orgId, query);
    return { success: true, data };
  }

  /** GET /api/accounts/:id */
  async getAccount(id: string) {
    const data = await this.accountService.getById(id);
    if (!data) return { success: false, message: "Account not found" };
    return { success: true, data };
  }

  /** PATCH /api/accounts/:id */
  async updateAccount(id: string, body: UpdateAccountDTO) {
    const data = await this.accountService.update(id, body);
    return { success: true, data };
  }

  /** GET /api/accounts/tree */
  async getAccountTree(orgId: string) {
    const data = await this.accountService.getTree(orgId);
    return { success: true, data };
  }

  // ─── Journal endpoints ──────────────────────────────────────

  /** GET /api/journal/:transactionId */
  async getJournalEntries(transactionId: string) {
    const data = await this.journalService.getByTransactionId(transactionId);
    return { success: true, data };
  }

  /** GET /api/ledger-balances */
  async getLedgerBalances(orgId: string) {
    const data = await this.journalService.getLedgerBalances(orgId);
    return { success: true, data };
  }
}
