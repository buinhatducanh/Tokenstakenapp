import React from "react";
import { Check, X, ShieldAlert, Sparkles, CheckSquare } from "lucide-react";
import { useBulkAction } from "../api/invoice.hooks";
import { toast } from "sonner";

interface BulkActionBannerProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onSuccess?: () => void;
}

export function BulkActionBanner({ selectedIds, onClearSelection, onSuccess }: BulkActionBannerProps) {
  const { mutate: runBulkAction, isPending } = useBulkAction();

  if (selectedIds.length === 0) return null;

  const handleBulkAction = async (action: "approve" | "reject" | "cancel") => {
    const actionLabel =
      action === "approve"
        ? "Phê duyệt"
        : action === "reject"
        ? "Từ chối"
        : "Hủy bỏ";

    const toastId = toast.loading(`Đang xử lý ${actionLabel} ${selectedIds.length} hóa đơn...`);

    try {
      await runBulkAction({
        invoiceIds: selectedIds,
        action: action === "approve" ? "approve" : action === "reject" ? "reject" : "cancel",
      });

      toast.success(`Đã ${actionLabel.toLowerCase()} thành công ${selectedIds.length} hóa đơn!`, {
        id: toastId,
        icon: <Sparkles className="h-4 w-4 text-emerald-500 animate-bounce" />,
      });
      
      onClearSelection();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(`Xử lý hàng loạt thất bại: ${error instanceof Error ? error.message : "Lỗi"}`, {
        id: toastId,
      });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-neutral-900 text-white rounded-2xl px-6 py-4 shadow-2xl flex items-center justify-between gap-4 border border-neutral-800">
        
        {/* Thông tin số lượng đang chọn */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white animate-pulse">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide">
              Đã chọn {selectedIds.length} hóa đơn
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Chọn thao tác xử lý nhanh hàng loạt
            </p>
          </div>
        </div>

        {/* Nút thao tác */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleBulkAction("approve")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-800 text-white text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-emerald-900/20"
          >
            <Check className="h-3.5 w-3.5" />
            Duyệt
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleBulkAction("reject")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-800 text-white text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-amber-900/20"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Từ chối
          </button>

          <div className="h-6 w-[1px] bg-neutral-850 mx-1" />

          <button
            type="button"
            onClick={onClearSelection}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Hủy chọn tất cả"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
