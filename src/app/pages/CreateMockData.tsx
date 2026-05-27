import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { mockDashboardAPI } from "@features/dashboard";
import { toast } from "sonner";

export function CreateMockData() {
  const navigate = useNavigate();
  const location = useLocation();
  const isInvoice = location.pathname.includes("/invoices/new");
  
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setIsSubmitting(true);
    try {
      await mockDashboardAPI.createPendingItem(
        isInvoice ? "income" : "expense", 
        Number(amount)
      );
      toast.success(`Đã tạo ${isInvoice ? "hóa đơn" : "giao dịch"} thành công!`);
      navigate("/"); // Redirect to dashboard to see pending items
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-900">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
        <h2 className="text-xl font-medium mb-6">
          Tạo {isInvoice ? "Hóa đơn thu mới" : "Giao dịch chi mới"}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Số tiền (VNĐ)
            </label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="VD: 50000000"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 py-2 px-4 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${
                isInvoice ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
              } disabled:opacity-50`}
            >
              {isSubmitting ? "Đang tạo..." : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
