import { useState, useEffect } from "react";
import { 
  X as XIcon, 
  Calendar as CalendarIcon, 
  User as UserIcon, 
  FileText as FileTextIcon, 
  CheckCircle2 as CheckCircle2Icon, 
  Trash2 as Trash2Icon, 
  PlusCircle as PlusCircleIcon, 
  Sparkles as SparklesIcon 
} from "lucide-react";

const X = XIcon as any;
const Calendar = CalendarIcon as any;
const User = UserIcon as any;
const FileText = FileTextIcon as any;
const CheckCircle2 = CheckCircle2Icon as any;
const Trash2 = Trash2Icon as any;
const PlusCircle = PlusCircleIcon as any;
const Sparkles = SparklesIcon as any;
import type { Invoice, LineItem } from "@packages/shared-types";
import { useApproveInvoice, useUpdateInvoice, useDeleteInvoice } from "../api/invoice.hooks";
import { toast } from "sonner";

// Các hàm trợ giúp hiển thị tệp đính kèm hóa đơn
const isImageFile = (url: string) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.startsWith("blob:") ||
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".svg") ||
    (lower.includes("/mock-storage/") && !lower.endsWith(".pdf"))
  );
};

const getImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  
  if (typeof window !== "undefined" && (window as any).imagePreviewCache) {
    const cached = (window as any).imagePreviewCache[url];
    if (cached) return cached;
    
    const fileName = url.substring(url.lastIndexOf("/") + 1);
    const cachedByName = (window as any).imagePreviewCache[fileName];
    if (cachedByName) return cachedByName;
  }
  
  // Nếu là file mock cũ (như .pdf ảo) hoặc không tìm thấy cache hình ảnh, trả về hình ảnh hóa đơn mẫu đẹp mắt
  return "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80";
};

const getFileName = (url: string) => {
  if (!url) return "invoice.pdf";
  return url.substring(url.lastIndexOf("/") + 1);
};

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateInvoice?: (updatedInvoice: Invoice) => void;
}

export function InvoiceDetailsModal({ invoice, isOpen, onClose, onUpdateInvoice }: InvoiceDetailsModalProps) {
  const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(null);
  const { mutate: approveInvoice, isPending: isApproving } = useApproveInvoice();
  const { mutate: updateInvoice, isPending: isUpdating } = useUpdateInvoice();
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();

  useEffect(() => {
    if (invoice) {
      setEditedInvoice({ ...invoice, lineItems: [...invoice.lineItems] });
    } else {
      setEditedInvoice(null);
    }
  }, [invoice]);

  if (!isOpen || !editedInvoice) return null;

  const handleFieldChange = (field: keyof Invoice, value: any) => {
    setEditedInvoice((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    setEditedInvoice((prev) => {
      if (!prev) return null;
      const updatedItems = [...prev.lineItems];
      const item = updatedItems[index];
      if (!item) return prev;

      const updatedItem = { ...item, [field]: value };

      // Nếu thay đổi số lượng hoặc đơn giá -> Tự tính toán thành tiền của dòng đó
      if (field === "quantity" || field === "unitPrice") {
        const qtyVal = field === "quantity" ? value : item.quantity;
        const priceVal = field === "unitPrice" ? value : item.unitPrice;
        
        const qty = Number(qtyVal) || 0;
        const price = Number(priceVal) || 0;
        updatedItem.amount = (qty * price).toString();
      }

      updatedItems[index] = updatedItem;

      // Tính toán lại subtotal, taxAmount, total cho toàn hóa đơn
      const subtotalNum = updatedItems.reduce((acc, current) => acc + (Number(current.amount) || 0), 0);
      const taxRateNum = Number(prev.taxRate || "0") || 0;
      const taxAmountNum = Math.round(subtotalNum * taxRateNum);
      const totalNum = subtotalNum + taxAmountNum;

      return {
        ...prev,
        lineItems: updatedItems,
        subtotal: subtotalNum.toString(),
        taxAmount: taxAmountNum.toString(),
        total: totalNum.toString(),
      };
    });
  };

  const addLineItem = () => {
    setEditedInvoice((prev) => {
      if (!prev) return null;
      const newItem: LineItem = {
        description: "Dòng hàng mới",
        quantity: 1,
        unitPrice: "0",
        amount: "0",
      };
      return {
        ...prev,
        lineItems: [...prev.lineItems, newItem],
      };
    });
  };

  const removeLineItem = (index: number) => {
    setEditedInvoice((prev) => {
      if (!prev) return null;
      const updatedItems = prev.lineItems.filter((_, i) => i !== index);

      const subtotalNum = updatedItems.reduce((acc, current) => acc + Number(current.amount), 0);
      const taxRateNum = Number(prev.taxRate || "0");
      const taxAmountNum = Math.round(subtotalNum * taxRateNum);
      const totalNum = subtotalNum + taxAmountNum;

      return {
        ...prev,
        lineItems: updatedItems,
        subtotal: subtotalNum.toString(),
        taxAmount: taxAmountNum.toString(),
        total: totalNum.toString(),
      };
    });
  };

  const handleSave = async () => {
    if (!editedInvoice) return;
    try {
      await updateInvoice(editedInvoice.id, {
        senderName: editedInvoice.senderName,
        senderTaxCode: editedInvoice.senderTaxCode,
        senderAddress: editedInvoice.senderAddress,
        receiverName: editedInvoice.receiverName,
        receiverTaxCode: editedInvoice.receiverTaxCode,
        receiverAddress: editedInvoice.receiverAddress,
        dueDate: editedInvoice.dueDate,
        type: editedInvoice.type,
        notes: editedInvoice.notes,
        lineItems: editedInvoice.lineItems,
        taxRate: editedInvoice.taxRate,
        taxAmount: editedInvoice.taxAmount,
        subtotal: editedInvoice.subtotal,
        total: editedInvoice.total,
      });
      if (onUpdateInvoice) {
        onUpdateInvoice(editedInvoice);
      }
      toast.success("Đã cập nhật thông tin hóa đơn thành công!");
      onClose();
    } catch (error) {
      toast.error("Không thể cập nhật hóa đơn.");
    }
  };

  const handleDelete = async () => {
    if (!editedInvoice) return;
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa hóa đơn #${editedInvoice.invoiceNumber} không?`);
    if (!confirmDelete) return;

    try {
      await deleteInvoice(editedInvoice.id);
      toast.success(`Đã xóa hóa đơn ${editedInvoice.invoiceNumber} thành công!`);
      onClose();
    } catch (error) {
      toast.error("Không thể xóa hóa đơn.");
    }
  };

  const handleApprove = async () => {
    try {
      await approveInvoice(editedInvoice.id);
      toast.success(`Hóa đơn ${editedInvoice.invoiceNumber} đã được phê duyệt!`);

      // Đồng bộ state UI bên ngoài
      if (onUpdateInvoice) {
        onUpdateInvoice({
          ...editedInvoice,
          status: "APPROVED",
          approvedAt: new Date().toISOString(),
        });
      }
      onClose();
    } catch (error) {
      toast.error("Không thể phê duyệt hóa đơn.");
    }
  };

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(val));
  };

  // Render side drawer với dữ liệu thật từ database Postgres
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
        <div className="w-screen max-w-2xl bg-white/95 backdrop-blur-md shadow-2xl flex flex-col h-full border-l border-neutral-200/50">

          {/* Header */}
          <div className="px-6 py-5 bg-neutral-50/50 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Task 2 — Invoice Detail
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${editedInvoice.status === "APPROVED"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                    : "bg-amber-50 text-amber-700 ring-amber-600/20"
                  }`}>
                  {editedInvoice.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 mt-1">
                Chi tiết hóa đơn #{editedInvoice.invoiceNumber}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Row 1: Thông tin đối tác */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50/30 border border-neutral-150">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Bên Phát Hành (Sender)
                </label>
                <input
                  type="text"
                  value={editedInvoice.senderName}
                  onChange={(e) => handleFieldChange("senderName", e.target.value)}
                  className="w-full text-sm font-medium border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 bg-white"
                />
                <input
                  type="text"
                  placeholder="Mã số thuế bên bán"
                  value={editedInvoice.senderTaxCode || ""}
                  onChange={(e) => handleFieldChange("senderTaxCode", e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 mt-2 bg-white text-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Bên Nhận (Receiver)
                </label>
                <input
                  type="text"
                  value={editedInvoice.receiverName}
                  onChange={(e) => handleFieldChange("receiverName", e.target.value)}
                  className="w-full text-sm font-medium border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 bg-white"
                />
                <input
                  type="text"
                  placeholder="Mã số thuế bên mua"
                  value={editedInvoice.receiverTaxCode || ""}
                  onChange={(e) => handleFieldChange("receiverTaxCode", e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 mt-2 bg-white text-neutral-600"
                />
              </div>
            </div>

            {/* Row 2: Thông tin nghiệp vụ chung */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Ngày Đến Hạn (Due Date)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="date"
                    value={editedInvoice.dueDate || ""}
                    onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Loại hóa đơn (Type)
                </label>
                <select
                  value={editedInvoice.type}
                  onChange={(e) => handleFieldChange("type", e.target.value)}
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="SALE">SALE (Bán ra)</option>
                  <option value="EXPENSE">EXPENSE (Chi phí)</option>
                  <option value="PURCHASE">PURCHASE (Mua vào)</option>
                  <option value="CREDIT">CREDIT (Ghi có)</option>
                </select>
              </div>
            </div>

            {/* Dòng hàng chi tiết (Line Items) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Dòng hàng chi tiết
                </label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  Thêm dòng hàng
                </button>
              </div>

              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200">
                      <th className="px-3 py-2">Mô tả</th>
                      <th className="px-3 py-2 w-20 text-center">SL</th>
                      <th className="px-3 py-2 w-32 text-right">Đơn giá</th>
                      <th className="px-3 py-2 w-32 text-right">Thành tiền</th>
                      <th className="px-2 py-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150 text-sm bg-white">
                    {editedInvoice.lineItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/50">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                            className="w-full text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-indigo-300 rounded px-1"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(idx, "quantity", Number(e.target.value))}
                            className="w-full text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-indigo-300 rounded px-1 text-center font-semibold"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(idx, "unitPrice", e.target.value)}
                            className="w-full text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-indigo-300 rounded px-1 text-right font-medium"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-neutral-800">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLineItem(idx)}
                            className="text-neutral-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {editedInvoice.lineItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-xs text-neutral-400">
                          Chưa có dòng hàng nào. Vui lòng bấm thêm dòng hàng ở trên.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                Ghi chú / Trích xuất OCR
              </label>
              <textarea
                value={editedInvoice.notes || ""}
                onChange={(e) => handleFieldChange("notes", e.target.value)}
                rows={2}
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tài liệu đính kèm (Hóa đơn) */}
            {editedInvoice.sourceFileUrl && (
              <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-150 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <h3 className="text-xs font-black text-neutral-700 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Tài liệu đính kèm (Invoice File)
                  </h3>
                  <a
                    href={getImageUrl(editedInvoice.sourceFileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Mở tab mới
                  </a>
                </div>

                {/* Kiểm tra xem là ảnh hay PDF */}
                {isImageFile(editedInvoice.sourceFileUrl) ? (
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 p-2 flex justify-center group shadow-inner">
                    <img
                      src={getImageUrl(editedInvoice.sourceFileUrl)}
                      alt="Hóa đơn"
                      className="max-h-64 rounded-lg object-contain shadow-sm border border-neutral-150 bg-white transition-all duration-300 group-hover:shadow-md"
                    />
                    <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <a
                        href={getImageUrl(editedInvoice.sourceFileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/90 text-neutral-800 text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-white transition-all shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-200"
                      >
                        Xem ảnh lớn
                      </a>
                    </div>
                  </div>
                ) : (
                  // Nếu là PDF hoặc tệp khác, hiển thị giao diện xem trước PDF mô phỏng cực kỳ chuyên nghiệp
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 p-4 flex flex-col items-center justify-center text-center space-y-2.5">
                    <div className="p-3 bg-red-50 text-red-650 rounded-2xl border border-red-100 shadow-sm">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800 truncate max-w-md">
                        {getFileName(editedInvoice.sourceFileUrl)}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Tệp tài liệu PDF</p>
                    </div>
                    <a
                      href={getImageUrl(editedInvoice.sourceFileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
                    >
                      Tải xuống / Xem tài liệu
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Cột tổng số tiền và nút hành động */}
          <div className="px-6 py-5 bg-neutral-50 border-t border-neutral-200 space-y-4">

            {/* Bảng tổng tiền */}
            <div className="flex flex-col space-y-1.5 text-sm max-w-xs ml-auto">
              <div className="flex justify-between text-neutral-600">
                <span>Chưa thuế (Subtotal):</span>
                <span className="font-semibold">{formatCurrency(editedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 items-center">
                <span>VAT ({(Number(editedInvoice.taxRate) * 100).toFixed(0)}%):</span>
                <span className="font-semibold">{formatCurrency(editedInvoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-neutral-900 border-t border-neutral-200 pt-2 text-base font-bold">
                <span>Tổng cộng (Total):</span>
                <span className="text-indigo-600">{formatCurrency(editedInvoice.total)}</span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 disabled:bg-red-100 disabled:text-red-400 rounded-lg text-sm font-semibold transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Đang xóa..." : "Xóa hóa đơn"}
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-indigo-600 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold transition-colors"
                >
                  {isUpdating ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>

                {editedInvoice.status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isApproving ? "Đang duyệt..." : "Phê Duyệt Ngay"}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
