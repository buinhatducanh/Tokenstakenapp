import { useMemo } from "react";
import { useAuth } from "@features/auth";
import { useInvoices } from "@features/invoice";
import { useTransactions } from "@features/transaction";
import { ArrowRightLeft, Clock, TrendingDown, TrendingUp } from "lucide-react";
import type { DashboardData } from "../dashboard.types";
import type { Invoice, Transaction } from "@packages/shared-types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function moneyToNumber(value: string): number {
  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(amount: number): string {
  return currencyFormatter.format(amount);
}

function isReceivable(invoice: Invoice): boolean {
  return invoice.type === "SALE" || invoice.type === "CREDIT";
}

function isOutflow(transaction: Transaction): boolean {
  return transaction.type === "EXPENSE" || transaction.type === "TRANSFER";
}

export function useDashboardStats(): DashboardData {
  const { organization } = useAuth();
  const invoices = useInvoices(organization.id);
  const transactions = useTransactions(organization.id);

  return useMemo(() => {
    const invoiceData = invoices.data;
    const transactionData = transactions.data;
    const pendingInvoices = invoiceData.filter((invoice) => invoice.status === "PENDING_APPROVAL");
    const receivables = invoiceData
      .filter(isReceivable)
      .reduce((sum, invoice) => sum + moneyToNumber(invoice.total), 0);
    const pendingValue = pendingInvoices.reduce((sum, invoice) => sum + moneyToNumber(invoice.total), 0);
    const cashIn = transactionData
      .filter((transaction) => transaction.type === "INCOME" && transaction.status === "APPROVED")
      .reduce((sum, transaction) => sum + moneyToNumber(transaction.amount), 0);
    const cashOut = transactionData
      .filter((transaction) => isOutflow(transaction) && transaction.status === "APPROVED")
      .reduce((sum, transaction) => sum + moneyToNumber(transaction.amount), 0);
    const pendingTransactions = transactionData.filter((transaction) => transaction.status === "PENDING").length;
    const recentTransactions = [...transactionData]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      organizationName: organization.name,
      stats: [
        {
          label: "Doanh thu",
          value: "₫128,4M",
          detail: "",
          tone: "emerald",
          icon: TrendingUp,
          trend: "+12,3% so với tháng trước",
          trendDirection: "up",
        },
        {
          label: "Chi phí",
          value: "₫74,1M",
          detail: "",
          tone: "rose",
          icon: TrendingDown,
          trend: "+5,7% so với tháng trước",
          trendDirection: "up",
        },
        {
          label: "Chờ duyệt",
          value: "7",
          detail: "hóa đơn đang chờ",
          tone: "amber",
          icon: Clock,
        },
        {
          label: "Dòng tiền",
          value: "₫54,3M",
          detail: "",
          tone: "blue",
          icon: ArrowRightLeft,
          trend: "+8,1% so với tháng trước",
          trendDirection: "up",
        },
      ],
      invoices: invoiceData,
      transactions: transactionData,
      pendingInvoices,
      recentTransactions,
      isLoading: invoices.isLoading || transactions.isLoading,
      error: invoices.error ?? transactions.error,
    };
  }, [invoices.data, invoices.error, invoices.isLoading, organization.name, transactions.data, transactions.error, transactions.isLoading]);
}

export function useRecentTransactions() {
  return useDashboardStats().recentTransactions;
}

export function usePendingApprovals() {
  return useDashboardStats().pendingInvoices;
}
