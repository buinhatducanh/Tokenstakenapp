import { useState, useMemo } from "react";
import { 
  Search as SearchIcon, 
  Filter as FilterIcon, 
  Sparkles as SparklesIcon, 
  AlertCircle as AlertCircleIcon, 
  FileText as FileTextIcon, 
  CheckCircle2 as CheckCircle2Icon, 
  ChevronRight as ChevronRightIcon,
  DollarSign as DollarSignIcon,
  Clock as ClockIcon,
  Layers as LayersIcon,
  Car as CarIcon,
  Cloud as CloudIcon,
  Laptop as LaptopIcon,
  XCircle as XCircleIcon
} from "lucide-react";

const Search = SearchIcon as any;
const Filter = FilterIcon as any;
const Sparkles = SparklesIcon as any;
const AlertCircle = AlertCircleIcon as any;
const FileText = FileTextIcon as any;
const CheckCircle2 = CheckCircle2Icon as any;
const ChevronRight = ChevronRightIcon as any;
const DollarSign = DollarSignIcon as any;
const Clock = ClockIcon as any;
const Layers = LayersIcon as any;
const Car = CarIcon as any;
const Cloud = CloudIcon as any;
const Laptop = LaptopIcon as any;
const XCircle = XCircleIcon as any;
import type { Invoice, InvoiceStatus } from "@packages/shared-types";
import {
  useInvoices,
  DragDropZone,
  InvoiceDetailsModal,
  BulkActionBanner,
  CreateInvoiceModal
} from "@features/invoice";

export function Invoices() {
  const { data: invoices } = useInvoices();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; previewUrl?: string; type?: string } | null>(null);
  
  // Thống kê số liệu hóa đơn động
  const stats = useMemo(() => {
    const totalCount = invoices.length;
    const pendingCount = invoices.filter((i) => i.status === "PENDING_APPROVAL").length;
    const approvedCount = invoices.filter((i) => i.status === "APPROVED").length;
    
    const totalValue = invoices.reduce((acc, i) => acc + (Number(i.total) || 0), 0);
    const approvedValue = invoices
      .filter((i) => i.status === "APPROVED")
      .reduce((acc, i) => acc + (Number(i.total) || 0), 0);

    return { totalCount, pendingCount, approvedCount, totalValue, approvedValue };
  }, [invoices]);

  // 1. Lọc và Tìm kiếm hóa đơn động
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.senderName.toLowerCase().includes(search.toLowerCase()) ||
        (inv.receiverName && inv.receiverName.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === "ALL" ? true : inv.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  // 2. Quản lý việc tích chọn nhiều dòng
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredInvoices.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // 3. Quản lý xem chi tiết / chỉnh sửa
  const handleRowClick = (invoice: Invoice) => {
    setActiveInvoice(invoice);
    setIsDetailsOpen(true);
  };

  // Hàm định dạng tiền tệ chuyên nghiệp
  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(val));
  };

  // Thiết kế màu sắc nhãn trạng thái (Status Badge Color System)
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "PENDING_APPROVAL":
        return "bg-amber-50 text-amber-700 ring-amber-600/20 animate-pulse";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 ring-rose-600/20";
      case "CANCELLED":
        return "bg-neutral-100 text-neutral-600 ring-neutral-500/20";
      default:
        return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
    }
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return "Chờ phê duyệt";
      case "APPROVED":
        return "Đã phê duyệt";
      case "REJECTED":
        return "Từ chối";
      case "CANCELLED":
        return "Đã hủy";
      case "DRAFT":
        return "Bản nháp";
      default:
        return status;
    }
  };

  // Render bảng điều khiển quản lý hóa đơn kết nối database Postgres Neon thật
  return (
    <div className="flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Header trang trí hiện đại */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              Quản lý Hóa Đơn
            </h1>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Đính kèm file hóa đơn hoặc nhập tay thông tin trực tiếp, phê duyệt dễ dàng và minh bạch.
          </p>
        </div>
        
        {/* Nút bấm Tạo hóa đơn thủ công */}
        <div>
          <button
            onClick={() => {
              setAttachedFile(null);
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-all"
          >
            <SparklesIcon className="h-4 w-4" />
            Tạo hóa đơn mới
          </button>
        </div>
      </div>

      {/* Thống kê KPI tài chính dạng Glassmorphism đẹp mắt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Thẻ 1: Tổng hóa đơn */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tổng hóa đơn</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-650 group-hover:text-white transition-colors duration-300">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-neutral-900">{stats.totalCount}</h3>
            <p className="text-[10px] text-neutral-400 mt-0.5 font-medium">Tệp tin hóa đơn đã tải lên</p>
          </div>
        </div>

        {/* Thẻ 2: Đang chờ duyệt */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Chờ phê duyệt</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-650 group-hover:text-white transition-colors duration-300 relative">
              {stats.pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-neutral-900">{stats.pendingCount}</h3>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Yêu cầu cần xử lý ngay</p>
          </div>
        </div>

        {/* Thẻ 3: Tổng ngân sách */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tổng ngân sách</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-650 group-hover:text-white transition-colors duration-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-black text-indigo-650 truncate">{formatCurrency(stats.totalValue.toString())}</h3>
            <p className="text-[10px] text-neutral-400 mt-0.5 font-medium">Toàn bộ giá trị tài chính</p>
          </div>
        </div>

        {/* Thẻ 4: Đã thanh toán / ghi sổ */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Đã phê duyệt</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-655 group-hover:text-white transition-colors duration-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-black text-emerald-650 truncate">{formatCurrency(stats.approvedValue.toString())}</h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Đã ghi chép sổ kép</p>
          </div>
        </div>
      </div>

      {/* 1. Drag & Drop Zone Component từ `@features/invoice` */}
      <div className="mb-6">
        <DragDropZone 
          onFileUploaded={(file) => {
            setAttachedFile(file);
            setIsCreateOpen(true);
          }} 
        />
      </div>

      {/* 2. Thanh lọc và tìm kiếm thông minh */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-4 border-b border-neutral-200 bg-white sticky top-0 z-20">
        
        {/* Hộp tìm kiếm Fuzzy Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm theo số hóa đơn, đối tác..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-neutral-200 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-neutral-50/50"
          />
        </div>

        {/* Tabs lọc trạng thái nhanh - UX siêu thuận tiện */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="h-3.5 w-3.5 text-neutral-500 mr-1 flex-shrink-0" />
          
          {[
            { value: "ALL", label: "Tất cả", count: stats.totalCount },
            { value: "PENDING_APPROVAL", label: "Chờ duyệt", count: stats.pendingCount, badge: "bg-amber-100 text-amber-800" },
            { value: "APPROVED", label: "Đã duyệt", count: stats.approvedCount, badge: "bg-emerald-100 text-emerald-800" },
            { value: "REJECTED", label: "Từ chối", count: invoices.filter(i => i.status === "REJECTED").length },
            { value: "CANCELLED", label: "Đã hủy", count: invoices.filter(i => i.status === "CANCELLED").length }
          ].map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/10"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : tab.badge || "bg-neutral-200 text-neutral-700"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Bảng dữ liệu chính */}
      <div className="overflow-x-auto border border-neutral-200 rounded-2xl shadow-sm bg-white mt-4">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/75 sticky top-0 backdrop-blur-md z-10">
              <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider w-10 text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={filteredInvoices.length > 0 && selectedIds.length === filteredInvoices.length}
                  className="rounded border-neutral-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Mã Hóa Đơn
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Đối tác phát hành
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Hạn thanh toán
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                Số Tiền (VND)
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center">
                Trạng thái
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-150 bg-white">
            {filteredInvoices.map((invoice) => {
              const isChecked = selectedIds.includes(invoice.id);
              return (
                <tr
                  key={invoice.id}
                  className={`hover:bg-neutral-50/60 transition-all duration-150 group cursor-pointer ${isChecked ? "bg-indigo-50/20" : ""
                    }`}
                >
                  {/* Checkbox dòng */}
                  <td
                    className="px-4 py-3.5 whitespace-nowrap text-center"
                    onClick={(e) => e.stopPropagation()} // Tránh kích hoạt Drawer mở chi tiết
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleSelectRow(invoice.id, e.target.checked)}
                      className="rounded border-neutral-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                  </td>

                  {/* Số hóa đơn & Loại */}
                  <td
                    className="px-4 py-3.5 whitespace-nowrap font-medium text-neutral-900"
                    onClick={() => handleRowClick(invoice)}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Icon chuyên nghiệp đại diện dịch vụ hóa đơn */}
                      <div className={`p-2 rounded-xl flex-shrink-0 ${
                        invoice.senderName.toLowerCase().includes("grab")
                          ? "bg-emerald-50 text-emerald-600"
                          : invoice.senderName.toLowerCase().includes("amazon") || invoice.senderName.toLowerCase().includes("aws")
                          ? "bg-orange-50 text-orange-600"
                          : "bg-indigo-50 text-indigo-600"
                      }`}>
                        {invoice.senderName.toLowerCase().includes("grab") ? (
                          <Car className="h-4 w-4" />
                        ) : invoice.senderName.toLowerCase().includes("amazon") || invoice.senderName.toLowerCase().includes("aws") ? (
                          <Cloud className="h-4 w-4" />
                        ) : (
                          <Laptop className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-800 hover:text-indigo-600 transition-colors">
                          {invoice.invoiceNumber}
                        </span>
                        <span className="text-[10px] text-neutral-450 font-bold tracking-wider uppercase mt-0.5">
                          {invoice.type}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Đối tác gửi */}
                  <td
                    className="px-4 py-3.5 whitespace-nowrap text-sm text-neutral-700"
                    onClick={() => handleRowClick(invoice)}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-700">{invoice.senderName}</span>
                      {invoice.senderTaxCode && (
                        <span className="text-xs text-neutral-400 mt-0.5">MST: {invoice.senderTaxCode}</span>
                      )}
                    </div>
                  </td>

                  {/* Hạn thanh toán */}
                  <td
                    className="px-4 py-3.5 whitespace-nowrap text-sm text-neutral-600"
                    onClick={() => handleRowClick(invoice)}
                  >
                    {invoice.dueDate
                      ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(invoice.dueDate))
                      : <span className="text-xs text-neutral-400 italic">Không có</span>
                    }
                  </td>

                  {/* Tổng tiền */}
                  <td
                    className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-neutral-900 text-right font-mono"
                    onClick={() => handleRowClick(invoice)}
                  >
                    {formatCurrency(invoice.total)}
                  </td>

                  {/* Badge trạng thái */}
                  <td
                    className="px-4 py-3.5 whitespace-nowrap text-center"
                    onClick={() => handleRowClick(invoice)}
                  >
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>

                  {/* Icon xem chi tiết */}
                  <td
                    className="px-4 py-3.5 whitespace-nowrap text-center text-neutral-400 group-hover:text-indigo-600 transition-colors"
                    onClick={() => handleRowClick(invoice)}
                  >
                    <ChevronRight className="h-5 w-5 transform translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </td>
                </tr>
              );
            })}

            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-10 w-10 text-neutral-350 animate-bounce" />
                    <p className="text-sm font-medium">Không tìm thấy bất kỳ hóa đơn nào.</p>
                    <p className="text-xs text-neutral-400">
                      Vui lòng thay đổi từ khóa, chọn bộ lọc khác hoặc tải lên hóa đơn mới ở trên.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Side Drawer Chi tiết hóa đơn */}
      <InvoiceDetailsModal
        invoice={activeInvoice}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setActiveInvoice(null);
        }}
        onUpdateInvoice={(updated) => {
          // Callback cập nhật state khi có chỉnh sửa dòng hàng
          setActiveInvoice(updated);
        }}
      />

      {/* Form Tạo Hóa Đơn Mới (Nhập tay / Đính kèm file) */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setAttachedFile(null);
        }}
        attachedFile={attachedFile}
        onClearAttachedFile={() => setAttachedFile(null)}
        onSuccess={handleClearSelection}
      />

      {/* 5. Floating Action Banner xử lý hàng loạt */}
      <BulkActionBanner
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
      />

    </div>
  );
}
