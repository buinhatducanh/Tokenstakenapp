import { useState, useEffect } from "react";
import { 
  X as XIcon, 
  Calendar as CalendarIcon, 
  FileText as FileTextIcon, 
  PlusCircle as PlusCircleIcon, 
  Trash2 as Trash2Icon,
  Paperclip as PaperclipIcon,
  Check as CheckIcon,
  Loader2 as Loader2Icon
} from "lucide-react";

const X = XIcon as any;
const Calendar = CalendarIcon as any;
const FileText = FileTextIcon as any;
const PlusCircle = PlusCircleIcon as any;
const Trash2 = Trash2Icon as any;
const Paperclip = PaperclipIcon as any;
const Check = CheckIcon as any;
const Loader2 = Loader2Icon as any;

import type { CreateInvoiceDTO, LineItem, InvoiceType } from "@packages/shared-types";
import { useCreateInvoice } from "../api/invoice.hooks";
import { toast } from "sonner";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachedFile: { name: string; size: number; previewUrl?: string; type?: string } | null;
  onClearAttachedFile?: () => void;
  onSuccess?: () => void;
}

export function CreateInvoiceModal({ 
  isOpen, 
  onClose, 
  attachedFile, 
  onClearAttachedFile,
  onSuccess 
}: CreateInvoiceModalProps) {
  const { mutate: createInvoice, isPending } = useCreateInvoice();

  // Khởi tạo các trạng thái Form
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [type, setType] = useState<InvoiceType>("EXPENSE");
  const [senderName, setSenderName] = useState("");
  const [senderTaxCode, setSenderTaxCode] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  
  // Điền sẵn thông tin bên nhận mặc định để tối ưu hóa UX nhập liệu
  const [receiverName, setReceiverName] = useState("Tokens_taken Finance Ltd");
  const [receiverTaxCode, setReceiverTaxCode] = useState("0109876543");
  const [receiverAddress, setReceiverAddress] = useState("Tòa nhà Loops, Phố Duy Tân, Cầu Giấy, Hà Nội");
  
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState("0.08"); // 8% mặc định
  
  // Dòng hàng mặc định ban đầu
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      description: "Dịch vụ / Sản phẩm chi tiết",
      quantity: 1,
      unitPrice: "0",
      amount: "0"
    }
  ]);

  // File đính kèm cục bộ (nếu người dùng upload trực tiếp tại Modal)
  const [localFile, setLocalFile] = useState<{ name: string; size: number; previewUrl?: string; type?: string } | null>(null);

  // Đồng bộ hóa khi nhận tệp đính kèm từ DragDropZone
  useEffect(() => {
    if (isOpen) {
      if (attachedFile) {
        setLocalFile(attachedFile);
      }
      
      // Tạo mã hóa đơn ngẫu nhiên gợi ý
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setInvoiceNumber(`INV-2026-${randomNum}`);
      
      // Mặc định ngày hết hạn là 14 ngày sau
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      setDueDate(futureDate.toISOString().split("T")[0] ?? "");
    } else {
      // Reset form khi đóng modal
      setInvoiceNumber("");
      setType("EXPENSE");
      setSenderName("");
      setSenderTaxCode("");
      setSenderAddress("");
      setReceiverName("Tokens_taken Finance Ltd");
      setReceiverTaxCode("0109876543");
      setReceiverAddress("Tòa nhà Loops, Phố Duy Tân, Cầu Giấy, Hà Nội");
      setDueDate("");
      setNotes("");
      setTaxRate("0.08");
      setLineItems([
        {
          description: "Dịch vụ / Sản phẩm chi tiết",
          quantity: 1,
          unitPrice: "0",
          amount: "0"
        }
      ]);
      setLocalFile(null);
    }
  }, [isOpen, attachedFile]);

  if (!isOpen) return null;

  // Xử lý thêm dòng hàng
  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        description: "",
        quantity: 1,
        unitPrice: "0",
        amount: "0"
      }
    ]);
  };

  // Xử lý xóa dòng hàng
  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) {
      toast.error("Phải có ít nhất 1 dòng hàng trong hóa đơn.");
      return;
    }
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Xử lý thay đổi dòng hàng
  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] } as LineItem;
      
      if (field === "quantity") {
        item.quantity = Math.max(1, Number(value) || 1);
        item.amount = (item.quantity * (Number(item.unitPrice) || 0)).toString();
      } else if (field === "unitPrice") {
        item.unitPrice = value;
        item.amount = ((item.quantity || 1) * (Number(value) || 0)).toString();
      } else {
        (item as any)[field] = value;
      }
      
      updated[index] = item;
      return updated;
    });
  };

  // Upload file cục bộ
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        
        if (previewUrl && typeof window !== "undefined") {
          if (!(window as any).imagePreviewCache) {
            (window as any).imagePreviewCache = {};
          }
          (window as any).imagePreviewCache[file.name] = previewUrl;
          (window as any).imagePreviewCache[`/mock-storage/${file.name}`] = previewUrl;
        }
        
        setLocalFile({
          name: file.name,
          size: file.size,
          previewUrl,
          type: file.type
        });
        toast.success(`Đã đính kèm tệp tin: ${file.name}`);
      }
    }
  };

  // Loại bỏ file đính kèm
  const handleRemoveFile = () => {
    setLocalFile(null);
    if (onClearAttachedFile) {
      onClearAttachedFile();
    }
  };

  // Tính toán số liệu tài chính tổng
  const subtotal = lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const taxAmount = Math.round(subtotal * Number(taxRate));
  const total = subtotal + taxAmount;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // Gửi Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderName.trim()) {
      toast.error("Vui lòng điền tên Bên phát hành hóa đơn.");
      return;
    }

    if (lineItems.some(item => !item.description.trim())) {
      toast.error("Vui lòng nhập đầy đủ mô tả cho các dòng hàng.");
      return;
    }

    try {
      const dto: CreateInvoiceDTO = {
        type,
        senderName,
        senderTaxCode: senderTaxCode || undefined,
        senderAddress: senderAddress || undefined,
        receiverName,
        receiverTaxCode: receiverTaxCode || undefined,
        receiverAddress: receiverAddress || undefined,
        lineItems,
        taxRate,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        sourceFileUrl: localFile ? `/mock-storage/${localFile.name}` : undefined
      };

      await createInvoice(dto);
      toast.success("Tạo hóa đơn thành công!");
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi tạo hóa đơn.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md text-left shadow-2xl transition-all w-full max-w-3xl border border-neutral-200/50 flex flex-col my-8">
          
          {/* Header */}
          <div className="px-6 py-5 bg-neutral-50/50 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Tạo Hóa Đơn Mới
              </span>
              <h2 className="text-lg font-bold text-neutral-900 mt-2">
                Nhập liệu hóa đơn thủ công
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Row 1: Số hóa đơn & Loại hóa đơn & Ngày hết hạn */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  Số hóa đơn
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: INV-2026-001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  Loại hóa đơn
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as InvoiceType)}
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="EXPENSE">EXPENSE (Chi phí)</option>
                  <option value="SALE">SALE (Bán ra)</option>
                  <option value="PURCHASE">PURCHASE (Mua vào)</option>
                  <option value="CREDIT">CREDIT (Ghi có)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  Ngày Đến Hạn (Due Date)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Bên Phát Hành & Bên Nhận */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Bên phát hành */}
              <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-150 space-y-3">
                <h3 className="text-xs font-black text-neutral-700 uppercase tracking-widest pb-1 border-b border-neutral-200">
                  Bên Phát Hành (Sender)
                </h3>
                
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                    Tên Đơn Vị Phát Hành *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên công ty, nhà bán hàng..."
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                    Mã Số Thuế Bên Bán
                  </label>
                  <input
                    type="text"
                    placeholder="Mã số thuế bên bán..."
                    value={senderTaxCode}
                    onChange={(e) => setSenderTaxCode(e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                    Địa Chỉ Bên Bán
                  </label>
                  <input
                    type="text"
                    placeholder="Địa chỉ trụ sở bên bán..."
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Bên Nhận */}
              <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-150 space-y-3">
                <h3 className="text-xs font-black text-neutral-700 uppercase tracking-widest pb-1 border-b border-neutral-200">
                  Bên Nhận (Receiver)
                </h3>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                    Tên Đơn Vị Nhận *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên công ty..."
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                    Mã Số Thuế Bên Mua
                  </label>
                  <input
                    type="text"
                    placeholder="Mã số thuế bên mua..."
                    value={receiverTaxCode}
                    onChange={(e) => setReceiverTaxCode(e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                    Địa Chỉ Bên Mua
                  </label>
                  <input
                    type="text"
                    placeholder="Địa chỉ trụ sở bên mua..."
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
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

              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200">
                      <th className="px-3 py-2">Mô tả *</th>
                      <th className="px-3 py-2 w-20 text-center">SL</th>
                      <th className="px-3 py-2 w-32 text-right">Đơn giá (VND)</th>
                      <th className="px-3 py-2 w-32 text-right">Thành tiền</th>
                      <th className="px-2 py-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150 text-sm bg-white">
                    {lineItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/30">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            required
                            placeholder="Mô tả sản phẩm, dịch vụ..."
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
                            onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
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
                          {formatCurrency(Number(item.amount) || 0)}
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
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 4: File đính kèm & Chọn thuế suất VAT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* File đính kèm */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  Tệp đính kèm hóa đơn
                </label>
                {localFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl">
                      <div className="flex items-center space-x-2.5 truncate">
                        {localFile.previewUrl ? (
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-indigo-200 flex-shrink-0 group cursor-pointer">
                            <img 
                              src={localFile.previewUrl} 
                              alt="Preview" 
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                              onClick={() => window.open(localFile.previewUrl, '_blank')}
                            />
                          </div>
                        ) : (
                          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 flex-shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs font-bold text-neutral-800 truncate">{localFile.name}</p>
                          <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
                            {(localFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-xs font-bold text-red-500 hover:text-red-700 bg-white border border-neutral-200 px-2.5 py-1 rounded-lg transition-colors shadow-sm"
                      >
                        Loại bỏ
                      </button>
                    </div>

                    {/* Hiển thị ảnh phóng to cực kỳ trực quan và đẹp mắt */}
                    {localFile.previewUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 p-2 flex justify-center group shadow-inner">
                        <img 
                          src={localFile.previewUrl} 
                          alt="Hóa đơn xem trước" 
                          className="max-h-48 rounded-lg object-contain shadow-sm border border-neutral-100/50 bg-white transition-all duration-300 group-hover:shadow-md"
                        />
                        <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <a 
                            href={localFile.previewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-white/90 text-neutral-800 text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-white transition-all shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-200"
                          >
                            Xem ảnh lớn
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-neutral-300 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer bg-white">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleLocalFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Paperclip className="h-5 w-5 text-neutral-400" />
                      <p className="text-xs font-bold text-neutral-700">Đính kèm hóa đơn (PDF, Hình ảnh)</p>
                      <p className="text-[10px] text-neutral-400">Hỗ trợ tệp tin tối đa 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thuế VAT */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  Thuế suất VAT (%)
                </label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="0">Không thuế (0%)</option>
                  <option value="0.05">Thuế VAT 5%</option>
                  <option value="0.08">Thuế VAT 8%</option>
                  <option value="0.10">Thuế VAT 10%</option>
                </select>
                <p className="text-[10px] text-neutral-400 mt-1.5">
                  Tiền thuế sẽ được tự động cộng dồn vào tổng thanh toán bên dưới.
                </p>
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                Ghi chú nội bộ
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú nghiệp vụ, lý do chi tiêu, người yêu cầu thanh toán..."
                rows={2}
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 bg-white"
              />
            </div>
          </form>

          {/* Footer - Cột tổng số tiền và nút hành động */}
          <div className="px-6 py-5 bg-neutral-50 border-t border-neutral-200 space-y-4">
            
            {/* Bảng tổng tiền */}
            <div className="flex flex-col space-y-1.5 text-sm max-w-xs ml-auto">
              <div className="flex justify-between text-neutral-600">
                <span>Chưa thuế (Subtotal):</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 items-center">
                <span>VAT ({(Number(taxRate) * 100).toFixed(0)}%):</span>
                <span className="font-semibold">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-neutral-900 border-t border-neutral-200 pt-2 text-base font-bold">
                <span>Tổng cộng (Total):</span>
                <span className="text-indigo-600 font-mono">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors bg-white"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Tạo Hóa Đơn
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
