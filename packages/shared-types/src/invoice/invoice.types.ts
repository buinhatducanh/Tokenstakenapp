// Invoice types — shared between frontend and backend

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "CANCELLED"
  | "OVERDUE";

export type InvoiceType = "SALE" | "PURCHASE" | "EXPENSE" | "CREDIT";

export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: string;
  amount: string;
};

export type Invoice = {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;

  senderName: string;
  senderTaxCode: string | null;
  receiverName: string;
  receiverTaxCode: string | null;

  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  currency: string;
  dueDate: string | null;

  lineItems: LineItem[];
  notes: string | null;
  sourceFileUrl: string | null;

  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateInvoiceDTO = {
  type: InvoiceType;
  senderName: string;
  senderTaxCode?: string;
  senderAddress?: string;
  receiverName: string;
  receiverTaxCode?: string;
  receiverAddress?: string;
  lineItems: LineItem[];
  taxRate?: string;
  dueDate?: string;
  notes?: string;
  sourceFileUrl?: string;
};

export type UpdateInvoiceDTO = Partial<Omit<Invoice, "id" | "organizationId" | "createdAt" | "updatedAt">>;

export type BulkInvoiceAction = {
  invoiceIds: string[];
  action: "approve" | "reject" | "publish" | "cancel";
};
