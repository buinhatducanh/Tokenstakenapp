import { useMemo } from "react";
import type { Invoice } from "@packages/shared-types";

export type UseInvoicesResult = {
  data: Invoice[];
  isLoading: boolean;
  error: Error | null;
};

const INVOICES: Invoice[] = [
  {
    id: "inv_2026_001",
    organizationId: "org_tokens_taken",
    invoiceNumber: "INV-0045",
    type: "SALE",
    status: "PENDING_APPROVAL",
    senderName: "Trần Thị B",
    senderTaxCode: "",
    receiverName: "Tokens_taken Finance",
    receiverTaxCode: "",
    subtotal: "14000000",
    taxRate: "0",
    taxAmount: "0",
    total: "14000000",
    currency: "VND",
    dueDate: "2026-05-28",
    lineItems: [],
    notes: null,
    sourceFileUrl: null,
    approvedAt: null,
    createdAt: "2026-05-18T08:00:00.000Z",
    updatedAt: "2026-05-18T08:00:00.000Z",
  },
  {
    id: "inv_2026_002",
    organizationId: "org_tokens_taken",
    invoiceNumber: "INV-0044",
    type: "SALE",
    status: "PENDING_APPROVAL",
    senderName: "Lê Văn C",
    senderTaxCode: "",
    receiverName: "Tokens_taken Finance",
    receiverTaxCode: "",
    subtotal: "6500000",
    taxRate: "0",
    taxAmount: "0",
    total: "6500000",
    currency: "VND",
    dueDate: "2026-05-28",
    lineItems: [],
    notes: null,
    sourceFileUrl: null,
    approvedAt: null,
    createdAt: "2026-05-17T08:00:00.000Z",
    updatedAt: "2026-05-17T08:00:00.000Z",
  },
  {
    id: "inv_2026_003",
    organizationId: "org_tokens_taken",
    invoiceNumber: "TXN-0088",
    type: "EXPENSE",
    status: "PENDING_APPROVAL",
    senderName: "Chi phí IT",
    senderTaxCode: "",
    receiverName: "Tokens_taken Finance",
    receiverTaxCode: "",
    subtotal: "22000000",
    taxRate: "0",
    taxAmount: "0",
    total: "22000000",
    currency: "VND",
    dueDate: "2026-05-28",
    lineItems: [],
    notes: null,
    sourceFileUrl: null,
    approvedAt: null,
    createdAt: "2026-05-16T08:00:00.000Z",
    updatedAt: "2026-05-16T08:00:00.000Z",
  },
  {
    id: "inv_2026_004",
    organizationId: "org_tokens_taken",
    invoiceNumber: "INV-0043",
    type: "SALE",
    status: "PENDING_APPROVAL",
    senderName: "Công ty XYZ",
    senderTaxCode: "",
    receiverName: "Tokens_taken Finance",
    receiverTaxCode: "",
    subtotal: "9800000",
    taxRate: "0",
    taxAmount: "0",
    total: "9800000",
    currency: "VND",
    dueDate: "2026-05-28",
    lineItems: [],
    notes: null,
    sourceFileUrl: null,
    approvedAt: null,
    createdAt: "2026-05-15T08:00:00.000Z",
    updatedAt: "2026-05-15T08:00:00.000Z",
  },
];

export function useInvoices(organizationId?: string): UseInvoicesResult {
  return useMemo(
    () => ({
      data: organizationId ? INVOICES.filter((invoice) => invoice.organizationId === organizationId) : INVOICES,
      isLoading: false,
      error: null,
    }),
    [organizationId],
  );
}

export function useInvoice(invoiceId: string): UseInvoicesResult {
  return useMemo(
    () => ({
      data: INVOICES.filter((invoice) => invoice.id === invoiceId),
      isLoading: false,
      error: null,
    }),
    [invoiceId],
  );
}

export function useCreateInvoice() {
  return { mutate: () => undefined, isPending: false };
}

export function useApproveInvoice() {
  return { mutate: () => undefined, isPending: false };
}

export function useBulkAction() {
  return { mutate: () => undefined, isPending: false };
}
