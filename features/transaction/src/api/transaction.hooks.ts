import { useMemo } from "react";
import type { Transaction } from "@packages/shared-types";

export type UseTransactionsResult = {
  data: Transaction[];
  isLoading: boolean;
  error: Error | null;
};

const TRANSACTIONS: Transaction[] = [
  {
    id: "txn_2026_001",
    organizationId: "org_tokens_taken",
    reference: "Hôm nay, 09:14",
    type: "INCOME",
    status: "APPROVED",
    description: "Khách hàng Nguyễn Văn A",
    date: "2026-05-18",
    amount: "12500000",
    currency: "VND",
    exchangeRate: "1",
    approvedAt: "2026-05-18T09:14:00.000Z",
    createdAt: "2026-05-18T09:14:00.000Z",
    updatedAt: "2026-05-18T09:14:00.000Z",
  },
  {
    id: "txn_2026_002",
    organizationId: "org_tokens_taken",
    reference: "Hôm nay, 08:30",
    type: "EXPENSE",
    status: "APPROVED",
    description: "Chi phí văn phòng phẩm",
    date: "2026-05-18",
    amount: "850000",
    currency: "VND",
    exchangeRate: "1",
    approvedAt: "2026-05-18T08:30:00.000Z",
    createdAt: "2026-05-18T08:30:00.000Z",
    updatedAt: "2026-05-18T08:30:00.000Z",
  },
  {
    id: "txn_2026_003",
    organizationId: "org_tokens_taken",
    reference: "Hôm qua, 16:45",
    type: "INCOME",
    status: "APPROVED",
    description: "Hóa đơn #INV-0042",
    date: "2026-05-17",
    amount: "38000000",
    currency: "VND",
    exchangeRate: "1",
    approvedAt: "2026-05-17T16:45:00.000Z",
    createdAt: "2026-05-17T16:45:00.000Z",
    updatedAt: "2026-05-17T16:45:00.000Z",
  },
  {
    id: "txn_2026_004",
    organizationId: "org_tokens_taken",
    reference: "Hôm qua, 10:00",
    type: "EXPENSE",
    status: "APPROVED",
    description: "Lương tháng 12",
    date: "2026-05-17",
    amount: "45000000",
    currency: "VND",
    exchangeRate: "1",
    approvedAt: "2026-05-17T10:00:00.000Z",
    createdAt: "2026-05-17T10:00:00.000Z",
    updatedAt: "2026-05-17T10:00:00.000Z",
  },
  {
    id: "txn_2026_005",
    organizationId: "org_tokens_taken",
    reference: "2 ngày trước",
    type: "EXPENSE", // The type doesn't matter much if it's PENDING
    status: "PENDING",
    description: "Hóa đơn #INV-0041 — chờ xử lý",
    date: "2026-05-16",
    amount: "7200000",
    currency: "VND",
    exchangeRate: "1",
    approvedAt: null,
    createdAt: "2026-05-16T14:00:00.000Z",
  },
];

export function useTransactions(organizationId?: string): UseTransactionsResult {
  return useMemo(
    () => ({
      data: organizationId
        ? TRANSACTIONS.filter((transaction) => transaction.organizationId === organizationId)
        : TRANSACTIONS,
      isLoading: false,
      error: null,
    }),
    [organizationId],
  );
}

export function useTransaction(transactionId: string): UseTransactionsResult {
  return useMemo(
    () => ({
      data: TRANSACTIONS.filter((transaction) => transaction.id === transactionId),
      isLoading: false,
      error: null,
    }),
    [transactionId],
  );
}

export function useCreateTransaction() {
  return { mutate: () => undefined, isPending: false };
}

export function useApproveTransaction() {
  return { mutate: () => undefined, isPending: false };
}
