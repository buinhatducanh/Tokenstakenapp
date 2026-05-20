import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { CreateTransactionForm, useCreateTransaction, useTransactions } from "@features/transaction";
import { CreateTransactionDTO } from "@packages/shared-types";
import { toast } from "sonner";

export function Transactions() {
    const [showForm, setShowForm] = useState(false);

    // React Query hooks — dữ liệu tự động cache, refetch, sync
    const { data: transactions = [], isLoading, isError } = useTransactions();
    const createMutation = useCreateTransaction();

    // Xử lý khi người dùng bấm Lưu Giao Dịch trong Form
    const handleCreateTransaction = async (data: CreateTransactionDTO) => {
        try {
            // Optimistic UI: mutation sẽ tự cập nhật bảng ngay lập tức (onMutate)
            // Nếu lỗi → rollback (onError). Nếu thành công → refetch (onSettled).
            await createMutation.mutateAsync(data);
            toast.success("Tạo giao dịch thành công!");
            setShowForm(false);
        } catch (error: any) {
            toast.error("Tạo thất bại: " + error.message);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Transactions</h1>
                    <p className="text-sm text-neutral-500 mt-1">Quản lý giao dịch và sổ kế toán kép.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors text-sm font-medium"
                >
                    <Plus className="h-4 w-4" /> {showForm ? "Đóng Form" : "Tạo Giao Dịch"}
                </button>
            </div>

            {/* Form Tạo Giao Dịch */}
            {showForm && (
                <div className="mb-6">
                    <CreateTransactionForm onSubmit={handleCreateTransaction} />
                </div>
            )}

            {/* Thanh công cụ bảng */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm giao dịch..."
                        className="h-9 w-64 rounded-md border border-neutral-200 pl-9 pr-3 text-sm outline-none focus:border-neutral-900"
                    />
                </div>
            </div>

            {/* Bảng Danh sách */}
            <div className="flex-1 overflow-auto">
                {isLoading && <p className="p-4 text-sm text-neutral-500">Đang tải dữ liệu...</p>}
                {isError && <p className="p-4 text-sm text-red-500">Lỗi khi tải dữ liệu.</p>}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50/50 sticky top-0">
                            <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Mã GD</th>
                            <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Mô tả</th>
                            <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase text-right">Số tiền</th>
                            <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Ngày</th>
                            <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-white">
                        {transactions.map((tx: any) => (
                            <tr key={tx.id} className="hover:bg-neutral-50/80 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-neutral-900">{tx.reference}</td>
                                <td className="px-4 py-3 text-sm text-neutral-600">{tx.description}</td>
                                <td className="px-4 py-3 text-sm font-medium text-neutral-900 text-right">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount || 0)}
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-500">{new Date(tx.date).toLocaleDateString('vi-VN')}</td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${tx.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20'}`}>
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}