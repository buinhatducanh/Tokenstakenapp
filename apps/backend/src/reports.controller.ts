import { Controller, Get, Query } from "@nestjs/common";
import { PrismaClient } from "@tokens-taken/db";
import type { Account, JournalEntry } from "@packages/shared-types";
import { ReportService } from "@features/reports/server";

@Controller("reports")
export class ReportsController {
  private readonly prisma = new PrismaClient();
  private readonly reportService = new ReportService({
    getAccounts: async (orgId) => {
      const accounts = await this.prisma.account.findMany({
        where: { organizationId: orgId },
      });

      return accounts.map((account) => ({
        id: account.id,
        organizationId: account.organizationId,
        code: account.code,
        name: account.name,
        type: account.type,
        currency: account.currency,
        balance: account.balance.toString(),
        isActive: account.isActive,
        isSystem: account.isSystem,
        parentId: account.parentId,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      })) satisfies Account[];
    },
    getJournalEntries: async (orgId, range) => {
      const entries = await this.prisma.journalEntry.findMany({
        where: {
          transaction: {
            organizationId: orgId,
            status: { notIn: ["REJECTED", "CANCELLED"] },
            date: { 
              gte: new Date(range.from), 
              lte: new Date(`${range.to}T23:59:59.999Z`) 
            },
          },
        },
        include: { account: true },
      });

      return entries.map((entry) => ({
        id: entry.id,
        transactionId: entry.transactionId,
        accountId: entry.accountId,
        account: entry.account
          ? {
              id: entry.account.id,
              code: entry.account.code,
              name: entry.account.name,
              type: entry.account.type,
            }
          : undefined,
        debit: entry.debit.toString(),
        credit: entry.credit.toString(),
        description: entry.description,
        createdAt: entry.createdAt.toISOString(),
      })) satisfies JournalEntry[];
    },
  });

  @Get("pnl")
  async pnl(
    @Query("orgId") _orgId: string,
    @Query("from") from: string,
    @Query("to") to: string,
    @Query("period") period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
    @Query("currency") currency: string
  ) {
    const org = await this.prisma.organization.findFirst();
    const actualOrgId = org ? org.id : _orgId;
    return this.reportService.getPnlReport(actualOrgId, period, { from, to }, currency);
  }

  @Get("cashflow")
  async cashflow(
    @Query("orgId") _orgId: string,
    @Query("from") from: string,
    @Query("to") to: string,
    @Query("period") period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
    @Query("currency") currency: string
  ) {
    const org = await this.prisma.organization.findFirst();
    const actualOrgId = org ? org.id : _orgId;
    return this.reportService.getCashFlowReport(actualOrgId, period, { from, to }, currency);
  }

  @Get("balance-sheet")
  async balanceSheet(
    @Query("orgId") _orgId: string,
    @Query("asOf") asOf: string,
    @Query("currency") currency: string
  ) {
    const org = await this.prisma.organization.findFirst();
    const actualOrgId = org ? org.id : _orgId;
    return this.reportService.getBalanceSheetReport(actualOrgId, asOf, currency);
  }
}

