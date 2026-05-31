import { Decimal } from "@prisma/client/runtime/library";
import type { Account, JournalEntry } from "@packages/shared-types";
import type {
  BalanceSheetReportData,
  CashFlowReportData,
  DateRange,
  PnlReportData,
  ReportPeriod,
} from "./report.types";

export type ReportDataSource = {
  getAccounts: (orgId: string) => Promise<Account[]>;
  getJournalEntries: (orgId: string, range: DateRange) => Promise<JournalEntry[]>;
};

export class ReportService {
  constructor(private readonly dataSource: ReportDataSource) {}

  async getPnlReport(
    orgId: string,
    period: ReportPeriod,
    range: DateRange,
    currency: string
  ): Promise<PnlReportData> {
    const [accounts, entries] = await Promise.all([
      this.dataSource.getAccounts(orgId),
      this.dataSource.getJournalEntries(orgId, range),
    ]);

    const revenueLines = aggregateByAccount(accounts, entries, "REVENUE", currency);
    const expenseLines = aggregateByAccount(accounts, entries, "EXPENSE", currency);

    const totalRevenue = revenueLines.decimal;
    const totalExpenses = expenseLines.decimal;

    return {
      period,
      range,
      currency,
      revenue: revenueLines.lines,
      expenses: expenseLines.lines,
      totals: {
        totalRevenue: decimalToMoney(totalRevenue, currency),
        totalExpenses: decimalToMoney(totalExpenses, currency),
        netProfit: decimalToMoney(totalRevenue.minus(totalExpenses), currency),
      },
    };
  }

  async getCashFlowReport(
    orgId: string,
    period: ReportPeriod,
    range: DateRange,
    currency: string
  ): Promise<CashFlowReportData> {
    const [accounts, entries] = await Promise.all([
      this.dataSource.getAccounts(orgId),
      this.dataSource.getJournalEntries(orgId, range),
    ]);

    const cashAccounts = accounts.filter(isCashAccount);
    const cashAccountIds = new Set(cashAccounts.map((a) => a.id));

    let inflow = new Decimal(0);
    let outflow = new Decimal(0);

    for (const entry of entries) {
      if (cashAccountIds.has(entry.accountId)) {
        // ASSET account: debit increases balance (inflow), credit decreases balance (outflow)
        const debit = new Decimal(entry.debit || 0);
        const credit = new Decimal(entry.credit || 0);
        inflow = inflow.plus(debit);
        outflow = outflow.plus(credit);
      }
    }

    const netCashFlow = inflow.minus(outflow);

    return {
      period,
      range,
      currency,
      lines: [
        {
          section: "inflow",
          label: "Cash Inflow",
          total: decimalToMoney(inflow, currency),
        },
        {
          section: "outflow",
          label: "Cash Outflow",
          total: decimalToMoney(outflow, currency),
        },
      ],
      totals: {
        totalInflow: decimalToMoney(inflow, currency),
        totalOutflow: decimalToMoney(outflow, currency),
        netCashFlow: decimalToMoney(netCashFlow, currency),
      },
    };
  }

  async getBalanceSheetReport(
    orgId: string,
    asOf: string,
    currency: string
  ): Promise<BalanceSheetReportData> {
    const range = { from: "1900-01-01", to: asOf };
    const [accounts, entries] = await Promise.all([
      this.dataSource.getAccounts(orgId),
      this.dataSource.getJournalEntries(orgId, range),
    ]);

    const assets = aggregateByAccount(accounts, entries, "ASSET", currency);
    const liabilities = aggregateByAccount(accounts, entries, "LIABILITY", currency);
    const equity = aggregateByAccount(accounts, entries, "EQUITY", currency);

    return {
      asOf,
      currency,
      assets: assets.lines,
      liabilities: liabilities.lines,
      equity: equity.lines,
      totals: {
        totalAssets: decimalToMoney(assets.decimal, currency),
        totalLiabilities: decimalToMoney(liabilities.decimal, currency),
        totalEquity: decimalToMoney(equity.decimal, currency),
      },
    };
  }
}

type AggregateResult = {
  lines: {
    label: string;
    accountCode?: string;
    accountName?: string;
    total: { amount: string; currency: string };
  }[];
  decimal: Decimal;
};

const creditNormalTypes: Account["type"][] = ["LIABILITY", "EQUITY", "REVENUE"];

const aggregateByAccount = (
  accounts: Account[],
  entries: JournalEntry[],
  accountType: Account["type"],
  currency: string
): AggregateResult => {
  const byAccount = new Map<string, Decimal>();
  const accountMap = new Map(accounts.map((account) => [account.id, account]));
  const isCreditNormal = creditNormalTypes.includes(accountType);

  for (const entry of entries) {
    const account = accountMap.get(entry.accountId);
    if (!account || account.type !== accountType) continue;

    const debit = toDecimal(entry.debit);
    const credit = toDecimal(entry.credit);
    const amount = isCreditNormal ? credit.minus(debit) : debit.minus(credit);

    const current = byAccount.get(account.id) ?? new Decimal(0);
    byAccount.set(account.id, current.plus(amount));
  }

  const lines = Array.from(byAccount.entries()).map(([accountId, total]) => {
    const account = accountMap.get(accountId);
    return {
      label: account?.name ?? accountId,
      accountCode: account?.code,
      accountName: account?.name,
      total: decimalToMoney(total, currency),
    };
  });

  const decimal = lines.reduce(
    (sum, line) => sum.plus(new Decimal(line.total.amount)),
    new Decimal(0)
  );

  return { lines, decimal };
};

const toDecimal = (value?: string | null) => new Decimal(value ?? "0");

const decimalToMoney = (decimal: Decimal, currency: string) => ({
  amount: decimal.toFixed(4),
  currency,
});

const isCashAccount = (account: Account) => {
  const name = account.name.toLowerCase();
  return name.includes("cash") || name.includes("bank") || account.code.startsWith("10");
};

