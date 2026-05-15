// Task 2: Invoice Feature — CRUD, Drag-Drop Upload, OCR, Bulk Approve
// Public API surface.

export { InvoiceService } from "./invoice.service";
export { InvoiceController } from "./invoice.controller";
export { OcrService } from "./ocr.service";
export { useInvoices, useInvoice, useCreateInvoice, useApproveInvoice, useBulkAction } from "./api/invoice.hooks";
export type { InvoiceModuleConfig } from "./invoice.types";
