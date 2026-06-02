import { useState, useEffect, useMemo, useCallback } from "react";
import type { Invoice, CreateInvoiceDTO, BulkInvoiceAction, UpdateInvoiceDTO } from "@packages/shared-types";

// ============================================================
// CƠ SỞ DỮ LIỆU ĐỘNG TRONG BỘ NHỚ (IN-MEMORY INVOICE DATABASE)
// ============================================================

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv_2026_001",
    organizationId: "org_tokens_taken",
    invoiceNumber: "INV-0045",
    type: "SALE",
    status: "PENDING_APPROVAL",
    senderName: "Công ty TNHH Giải pháp Phần mềm Việt",
    senderTaxCode: "0107293841",
    senderAddress: null,
    receiverName: "Tokens_taken Finance Ltd",
    receiverTaxCode: "0109876543",
    receiverAddress: null,
    subtotal: "14000000",
    taxRate: "0.08",
    taxAmount: "1120000",
    total: "15120000",
    currency: "VND",
    dueDate: "2026-06-15",
    lineItems: [
      {
        description: "Dịch vụ phát triển phần mềm - Kỳ tháng 5/2026",
        quantity: 1,
        unitPrice: "14000000",
        amount: "14000000"
      }
    ],
    notes: "Hóa đơn thanh toán đợt 1 dự án nâng cấp core.",
    sourceFileUrl: "/mock-storage/INV-0045.pdf",
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
    senderName: "Công ty CP Dịch vụ Số Tân Bình",
    senderTaxCode: "0314098231",
    senderAddress: null,
    receiverName: "Tokens_taken Finance Ltd",
    receiverTaxCode: "0109876543",
    receiverAddress: null,
    subtotal: "6500000",
    taxRate: "0.10",
    taxAmount: "650000",
    total: "7150000",
    currency: "VND",
    dueDate: "2026-06-10",
    lineItems: [
      {
        description: "Bảo trì hạ tầng mạng văn phòng TP. Hồ Chí Minh",
        quantity: 1,
        unitPrice: "6500000",
        amount: "6500000"
      }
    ],
    notes: "Kèm biên bản nghiệm thu kỹ thuật ngày 15/05.",
    sourceFileUrl: "/mock-storage/INV-0044.pdf",
    approvedAt: null,
    createdAt: "2026-05-17T08:00:00.000Z",
    updatedAt: "2026-05-17T08:00:00.000Z",
  },
  {
    id: "inv_2026_003",
    organizationId: "org_tokens_taken",
    invoiceNumber: "TXN-0088",
    type: "EXPENSE",
    status: "APPROVED",
    senderName: "Hệ thống Bán lẻ Thế Giới Di Động",
    senderTaxCode: "0303217354",
    senderAddress: null,
    receiverName: "Tokens_taken Finance Ltd",
    receiverTaxCode: "0109876543",
    receiverAddress: null,
    subtotal: "22000000",
    taxRate: "0.10",
    taxAmount: "2200000",
    total: "24200000",
    currency: "VND",
    dueDate: "2026-05-25",
    lineItems: [
      {
        description: "MacBook Air M3 13-inch 16GB/512GB cho Lập trình viên mới",
        quantity: 1,
        unitPrice: "22000000",
        amount: "22000000"
      }
    ],
    notes: "Chi phí mua sắm thiết bị làm việc công nghệ thông tin.",
    sourceFileUrl: "/mock-storage/TXN-0088.pdf",
    approvedAt: "2026-05-16T10:15:00.000Z",
    createdAt: "2026-05-16T08:00:00.000Z",
    updatedAt: "2026-05-16T10:15:00.000Z",
  },
  {
    id: "inv_2026_004",
    organizationId: "org_tokens_taken",
    invoiceNumber: "INV-0043",
    type: "SALE",
    status: "PENDING_APPROVAL",
    senderName: "Công ty TNHH Tư vấn & Dịch vụ Tài chính XYZ",
    senderTaxCode: "0108927453",
    senderAddress: null,
    receiverName: "Tokens_taken Finance Ltd",
    receiverTaxCode: "0109876543",
    receiverAddress: null,
    subtotal: "9800000",
    taxRate: "0.08",
    taxAmount: "784000",
    total: "10584000",
    currency: "VND",
    dueDate: "2026-06-05",
    lineItems: [
      {
        description: "Tư vấn cấu trúc thuế B2B quốc tế năm 2026",
        quantity: 1,
        unitPrice: "9800000",
        amount: "9800000"
      }
    ],
    notes: "Hóa đơn đợt quyết toán thuế đầu năm.",
    sourceFileUrl: "/mock-storage/INV-0043.pdf",
    approvedAt: null,
    createdAt: "2026-05-15T08:00:00.000Z",
    updatedAt: "2026-05-15T08:00:00.000Z",
  },
];

let inMemoryInvoices: Invoice[] = [...INITIAL_INVOICES];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

// ============================================================
// EXPORTED TYPES & HOOKS
// ============================================================

export type UseInvoicesResult = {
  data: Invoice[];
  isLoading: boolean;
  error: Error | null;
};

export type UseInvoiceResult = {
  data: Invoice | null;
  isLoading: boolean;
  error: Error | null;
};

export function useInvoices(organizationId?: string): UseInvoicesResult {
  const [data, setData] = useState<Invoice[]>(inMemoryInvoices);

  useEffect(() => {
    const handleUpdate = () => {
      setData([...inMemoryInvoices]);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const filteredData = useMemo(() => {
    if (!organizationId) return data;
    return data.filter((inv) => inv.organizationId === organizationId);
  }, [data, organizationId]);

  return {
    data: filteredData,
    isLoading: false,
    error: null,
  };
}

export function useInvoice(invoiceId: string): UseInvoiceResult {
  const [data, setData] = useState<Invoice | null>(
    inMemoryInvoices.find((inv) => inv.id === invoiceId) || null
  );

  useEffect(() => {
    const handleUpdate = () => {
      setData(inMemoryInvoices.find((inv) => inv.id === invoiceId) || null);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, [invoiceId]);

  return {
    data,
    isLoading: false,
    error: null,
  };
}

export function useCreateInvoice() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (dto: CreateInvoiceDTO): Promise<Invoice> => {
    setIsPending(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Tự động tính toán các trường liên quan đến tiền tệ từ LineItems
        const subtotalNum = dto.lineItems.reduce((acc, item) => acc + Number(item.amount), 0);
        const taxRateNum = Number(dto.taxRate || "0");
        const taxAmountNum = Math.round(subtotalNum * taxRateNum);
        const totalNum = subtotalNum + taxAmountNum;

        const subtotal = subtotalNum.toString();
        const taxRate = taxRateNum.toString();
        const taxAmount = taxAmountNum.toString();
        const total = totalNum.toString();

        const newInvoice: Invoice = {
          id: "inv_" + Math.random().toString(36).substring(2, 9),
          organizationId: "org_tokens_taken",
          invoiceNumber: "INV-" + (inMemoryInvoices.length + 1045).toString(),
          type: dto.type,
          status: "PENDING_APPROVAL", // Mặc định chuyển duyệt sau khi OCR
          senderName: dto.senderName,
          senderTaxCode: dto.senderTaxCode || null,
          senderAddress: dto.senderAddress || null,
          receiverName: dto.receiverName,
          receiverTaxCode: dto.receiverTaxCode || null,
          receiverAddress: dto.receiverAddress || null,
          subtotal,
          taxRate,
          taxAmount,
          total,
          currency: "VND",
          dueDate: dto.dueDate || null,
          lineItems: dto.lineItems,
          notes: dto.notes || null,
          sourceFileUrl: dto.sourceFileUrl || null,
          approvedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        inMemoryInvoices = [newInvoice, ...inMemoryInvoices];
        notifyListeners();
        setIsPending(false);
        resolve(newInvoice);
      }, 500);
    });
  }, []);

  return { mutate, isPending };
}

export function useApproveInvoice() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (invoiceId: string): Promise<Invoice> => {
    setIsPending(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = inMemoryInvoices.findIndex((inv) => inv.id === invoiceId);
        if (index === -1) {
          setIsPending(false);
          reject(new Error(`Invoice not found: ${invoiceId}`));
          return;
        }

        const invoice = inMemoryInvoices[index];
        if (!invoice) {
          setIsPending(false);
          reject(new Error("Invoice data corrupted"));
          return;
        }

        const updatedInvoice: Invoice = {
          ...invoice,
          status: "APPROVED",
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        inMemoryInvoices = inMemoryInvoices.map((inv) =>
          inv.id === invoiceId ? updatedInvoice : inv
        );
        notifyListeners();
        setIsPending(false);
        resolve(updatedInvoice);
      }, 400);
    });
  }, []);

  return { mutate, isPending };
}

export function useBulkAction() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (bulkDto: BulkInvoiceAction): Promise<Invoice[]> => {
    setIsPending(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextStatus =
          bulkDto.action === "approve"
            ? "APPROVED"
            : bulkDto.action === "reject"
              ? "REJECTED"
              : bulkDto.action === "cancel"
                ? "CANCELLED"
                : "PUBLISHED";

        inMemoryInvoices = inMemoryInvoices.map((inv) => {
          if (bulkDto.invoiceIds.includes(inv.id)) {
            return {
              ...inv,
              status: nextStatus,
              approvedAt: nextStatus === "APPROVED" ? new Date().toISOString() : inv.approvedAt,
              updatedAt: new Date().toISOString(),
            };
          }
          return inv;
        });

        notifyListeners();
        setIsPending(false);
        resolve(inMemoryInvoices.filter((inv) => bulkDto.invoiceIds.includes(inv.id)));
      }, 600);
    });
  }, []);

  return { mutate, isPending };
}

export function useUpdateInvoice() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (id: string, dto: UpdateInvoiceDTO): Promise<Invoice> => {
    setIsPending(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = inMemoryInvoices.findIndex((inv) => inv.id === id);
        if (index === -1) {
          setIsPending(false);
          reject(new Error("Không tìm thấy hóa đơn"));
          return;
        }

        const invoice = inMemoryInvoices[index];
        if (!invoice) {
          setIsPending(false);
          reject(new Error("Dữ liệu hóa đơn bị hỏng"));
          return;
        }

        // Tạo bản sao mới cập nhật
        const updatedInvoice: Invoice = { ...invoice };
        if (dto.senderName) updatedInvoice.senderName = dto.senderName;
        if (dto.senderTaxCode !== undefined) updatedInvoice.senderTaxCode = dto.senderTaxCode;
        if (dto.senderAddress !== undefined) updatedInvoice.senderAddress = dto.senderAddress;
        if (dto.receiverName) updatedInvoice.receiverName = dto.receiverName;
        if (dto.receiverTaxCode !== undefined) updatedInvoice.receiverTaxCode = dto.receiverTaxCode;
        if (dto.receiverAddress !== undefined) updatedInvoice.receiverAddress = dto.receiverAddress;
        if (dto.dueDate) updatedInvoice.dueDate = dto.dueDate;
        if (dto.type) updatedInvoice.type = dto.type;
        if (dto.notes !== undefined) updatedInvoice.notes = dto.notes;

        if (dto.lineItems) {
          const subtotalNum = dto.lineItems.reduce((acc, item) => acc + Number(item.amount), 0);
          const taxRateNum = Number(dto.taxRate || invoice.taxRate);
          const taxAmountNum = Math.round(subtotalNum * taxRateNum);
          const totalNum = subtotalNum + taxAmountNum;

          updatedInvoice.lineItems = dto.lineItems;
          updatedInvoice.subtotal = subtotalNum.toString();
          updatedInvoice.taxAmount = taxAmountNum.toString();
          updatedInvoice.total = totalNum.toString();
        }

        updatedInvoice.updatedAt = new Date().toISOString();

        inMemoryInvoices = inMemoryInvoices.map((inv) =>
          inv.id === id ? updatedInvoice : inv
        );

        notifyListeners();
        setIsPending(false);
        resolve(updatedInvoice);
      }, 300);
    });
  }, []);

  return { mutate, isPending };
}

export function useDeleteInvoice() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (id: string): Promise<void> => {
    setIsPending(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        inMemoryInvoices = inMemoryInvoices.filter((inv) => inv.id !== id);
        notifyListeners();
        setIsPending(false);
        resolve();
      }, 300);
    });
  }, []);

  return { mutate, isPending };
}
