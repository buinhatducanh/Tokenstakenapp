import { useState } from "react";
import { Plus, MoreHorizontal, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTransactions, useCreateTransaction, useApproveTransaction, useLedgerBalances } from "../../../features/transaction/src/api/transaction.hooks";

type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER" | "ADJUSTMENT" | "JOURNAL";

interface JournalEntry {
  id: string;
  account: string;
  debit: number;
  credit: number;
}

interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  status: TransactionStatus;
  entries?: JournalEntry[];
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "1", reference: "TXN-2026-000001", type: "INCOME", amount: 15000000, date: "2026-05-10", description: "Thu tiền bán hàng — HĐ ABC-001", status: "APPROVED", entries: [{ id: "e1", account: "111 - Tiền mặt", debit: 15000000, credit: 0 }, { id: "e2", account: "511 - Doanh thu", debit: 0, credit: 15000000 }] },
  { id: "2", reference: "TXN-2026-000002", type: "EXPENSE", amount: 8500000, date: "2026-05-11", description: "Mua nguyên vật liệu — NCC Beta", status: "APPROVED", entries: [{ id: "e3", account: "152 - Nguyên vật liệu", debit: 8500000, credit: 0 }, { id: "e4", account: "111 - Tiền mặt", debit: 0, credit: 8500000 }] },
  { id: "3", reference: "TXN-2026-000003", type: "TRANSFER", amount: 5000000, date: "2026-05-12", description: "Nộp tiền mặt vào ngân hàng", status: "APPROVED", entries: [{ id: "e5", account: "112 - Tiền gửi NH", debit: 5000000, credit: 0 }, { id: "e6", account: "111 - Tiền mặt", debit: 0, credit: 5000000 }] },
  { id: "4", reference: "TXN-2026-000004", type: "INCOME", amount: 20000000, date: "2026-05-13", description: "DT tư vấn — Dự án Gamma-X", status: "PENDING", entries: [{ id: "e7", account: "131 - Phải thu KH", debit: 20000000, credit: 0 }, { id: "e8", account: "511 - Doanh thu", debit: 0, credit: 20000000 }] },
  { id: "5", reference: "TXN-2026-000005", type: "EXPENSE", amount: 3200000, date: "2026-05-14", description: "Chi phí quảng cáo Facebook Ads", status: "PENDING", entries: [{ id: "e9", account: "641 - Chi phí bán hàng", debit: 3200000, credit: 0 }, { id: "e10", account: "112 - Tiền gửi Ngân hàng", debit: 0, credit: 3200000 }] },
];

const MOCK_ACCOUNTS = [
  { code: "1000", name: "Tiền mặt", type: "ASSET" },
  { code: "1100", name: "Ngân hàng", type: "ASSET" },
  { code: "1200", name: "Phải thu khách hàng", type: "ASSET" },
  { code: "2000", name: "Phải trả người bán", type: "LIABILITY" },
  { code: "2100", name: "Vay ngắn hạn", type: "LIABILITY" },
  { code: "3000", name: "Vốn chủ sở hữu", type: "EQUITY" },
  { code: "4000", name: "Doanh thu bán hàng", type: "INCOME" },
  { code: "4100", name: "Doanh thu dịch vụ", type: "INCOME" },
  { code: "5000", name: "Giá vốn hàng bán", type: "EXPENSE" },
  { code: "5100", name: "Chi phí bán hàng", type: "EXPENSE" },
  { code: "5200", name: "Chi phí quản lý", type: "EXPENSE" },
];

export function Transactions() {
  const orgId = "org_demo_1"; // Mock Organization ID
  const queryClient = useQueryClient();

  // 1. Nối cáp: Lấy danh sách Transaction từ Backend (Database thật)
  const { data: response, isError } = useQuery(useTransactions(orgId));
  const apiTransactions = response?.data || [];

  // Nếu API lỗi (chưa bật backend) hoặc đang tải, tạm dùng MOCK data để giữ giao diện
  const transactions = apiTransactions.length > 0 ? apiTransactions : (isError ? INITIAL_TRANSACTIONS : []);

  // 2. Nối cáp: Các thao tác Tạo mới, Duyệt, Từ chối
  const createTxnMutation = useMutation(useCreateTransaction(orgId));
  const approveTxnMutation = useMutation(useApproveTransaction());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // 1.5. Nối cáp: Lấy số dư thật từ bảng JournalEntry qua endpoint getLedgerBalances
  const { data: balanceResponse } = useQuery(useLedgerBalances(orgId));
  const ledgerBalances = balanceResponse?.data || [];

  // Tổng Tiền Mặt & Ngân hàng = Số dư của Tài khoản 1000 + Số dư của Tài khoản 1100
  const realAssetBalance = ledgerBalances
    .filter((b: any) => b.accountCode === "1000" || b.accountCode === "1100")
    .reduce((sum: number, b: any) => sum + parseFloat(b.balance as string), 0);

  const totalAssetBalance = balanceResponse?.data ? realAssetBalance : (isError ? 100000000 : 0);

  // Tính tổng tiền PENDING chờ duyệt (Income vs Expense)
  const pendingIncome = transactions
    .filter((t: any) => t.status === "PENDING" && t.type === "INCOME")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);
  const pendingExpense = transactions
    .filter((t: any) => t.status === "PENDING" && t.type === "EXPENSE")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

  // Modal State
  const [newTxn, setNewTxn] = useState({
    description: "",
    type: "JOURNAL" as TransactionType,
    date: new Date().toISOString().slice(0, 16),
    amount: 0,
  });
  const [entries, setEntries] = useState<JournalEntry[]>([
    { id: "1", account: "1000 - Tiền mặt", debit: 0, credit: 0 },
    { id: "2", account: "4000 - Doanh thu bán hàng", debit: 0, credit: 0 },
  ]);

  const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleStatusChange = (id: string, newStatus: string) => {
    let action: "APPROVE" | "REJECT" | "REQUEST_INFO";
    let successMessage = "";
    
    if (newStatus === "APPROVED") {
      action = "APPROVE";
      successMessage = "Duyệt thành công (Đã cập nhật Database)!";
    } else if (newStatus === "REJECTED") {
      action = "REJECT";
      successMessage = "Đã từ chối (Đã hoàn tiền trong Database)!";
    } else if (newStatus === "PENDING") {
      action = "REQUEST_INFO";
      successMessage = "Đã chuyển về trạng thái Chờ duyệt!";
    } else {
      return;
    }

    toast.promise(
      approveTxnMutation.mutateAsync({ id, action }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["ledgerBalances"] });
      }),
      {
        loading: 'Đang cập nhật trạng thái...',
        success: successMessage,
        error: 'Lỗi khi cập nhật trạng thái'
      }
    );
  };

  const handleCreateTransaction = async () => {
    if (!isBalanced) {
      toast.error("Giao dịch chưa cân bằng Nợ/Có!");
      return;
    }
    if (!newTxn.description) {
      toast.error("Vui lòng nhập mô tả giao dịch.");
      return;
    }

    try {
      await createTxnMutation.mutateAsync({
        type: newTxn.type,
        amount: totalDebit.toString(),
        date: newTxn.date,
        description: newTxn.description,
        currency: "VND",
        entries: entries.map(e => ({
          accountId: e.account.split(" - ")[0] || "", // Trích xuất Account Code từ Dropdown (ví dụ: "111")
          debit: e.debit.toString(),
          credit: e.credit.toString()
        }))
      });

      setIsModalOpen(false);

      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["ledgerBalances"] });

      toast.success("Giao dịch đã được lưu vào Database!");

      // Reset form
      setNewTxn({ description: "", type: "JOURNAL", date: new Date().toISOString().slice(0, 16), amount: 0 });
      setEntries([{ id: "1", account: "", debit: 0, credit: 0 }, { id: "2", account: "", debit: 0, credit: 0 }]);
    } catch (err: any) {
      toast.error("Lỗi khi gọi API lưu Database: " + err.message);
    }
  };

  const filteredTransactions = transactions;

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case "APPROVED": return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "PENDING": return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "REJECTED": return "bg-red-50 text-red-700 ring-red-600/20";
      case "CANCELLED": return "bg-neutral-50 text-neutral-600 ring-neutral-500/20";
      default: return "bg-neutral-50 text-neutral-600 ring-neutral-500/20";
    }
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case "INCOME": return <ArrowDownRight className="h-4 w-4 text-emerald-600" />;
      case "EXPENSE": return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case "TRANSFER": return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-neutral-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto relative">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Transactions</h1>
          <p className="text-sm text-neutral-500 mt-1">Quản lý và phê duyệt sổ sách kế toán kép (Double-entry Ledger).</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tạo giao dịch mới
        </button>
      </div>

      {/* Wallet / Balance Overview */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-sm font-medium text-neutral-600">Tổng Tiền Mặt & Ngân Hàng</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAssetBalance)}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-sm font-medium">Doanh thu chờ duyệt</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pendingIncome)}
          </div>
          <p className="text-xs text-emerald-500 mt-1">{transactions.filter((t: any) => t.status === 'PENDING' && t.type === 'INCOME').length} giao dịch đang chờ</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <ArrowDownRight className="h-4 w-4" />
            <span className="text-sm font-medium">Chi phí chờ duyệt</span>
          </div>
          <div className="text-2xl font-bold text-red-700">
            -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pendingExpense)}
          </div>
          <p className="text-xs text-red-500 mt-1">{transactions.filter((t: any) => t.status === 'PENDING' && t.type === 'EXPENSE').length} giao dịch đang chờ</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto mt-4 bg-white rounded-xl border border-neutral-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/50 sticky top-0 backdrop-blur-sm z-10">
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Mã GD</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Loại</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Mô tả</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Ngày</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">Số tiền</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {filteredTransactions.map((txn: any) => (
              <tr key={txn.id} className="hover:bg-neutral-50/80 transition-colors group">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-neutral-900">{txn.reference}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-neutral-100">
                      {getTypeIcon(txn.type)}
                    </div>
                    <span className="text-sm text-neutral-600 capitalize">{txn.type.toLowerCase()}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {txn.description}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500">
                  {new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(txn.createdAt || txn.date))}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                  <span className={txn.type === 'INCOME' ? 'text-emerald-600' : txn.type === 'EXPENSE' ? 'text-red-600' : 'text-neutral-900'}>
                    {txn.type === 'EXPENSE' ? '-' : txn.type === 'INCOME' ? '+' : ''}
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(txn.amount)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <select
                    value={txn.status}
                    onChange={(e) => handleStatusChange(txn.id, e.target.value)}
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ring-1 ring-inset outline-none cursor-pointer appearance-none ${getStatusColor(txn.status)} pr-6`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right .5rem top 50%",
                      backgroundSize: ".65rem auto",
                    }}
                  >
                    <option value="PENDING" className="bg-white text-neutral-900">PENDING</option>
                    <option value="APPROVED" className="bg-white text-neutral-900">APPROVED</option>
                    <option value="REJECTED" className="bg-white text-neutral-900">REJECTED</option>
                  </select>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedTxn(txn)}
                    className="text-neutral-400 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 p-1.5 rounded transition-colors"
                    title="Xem chi tiết"
                  >
                    <MoreHorizontal className="h-5 w-5 ml-auto" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500 text-sm">
                  Không tìm thấy giao dịch nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">Tạo Giao dịch Kế toán (Double-entry)</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Mô tả giao dịch</label>
                  <input
                    type="text"
                    value={newTxn.description}
                    onChange={(e) => setNewTxn({ ...newTxn, description: e.target.value })}
                    placeholder="VD: Chi tiền ăn trưa công ty"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Ngày giờ thực hiện</label>
                  <input
                    type="datetime-local"
                    value={newTxn.date}
                    onChange={(e) => setNewTxn({ ...newTxn, date: e.target.value })}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Loại giao dịch</label>
                  <select
                    value={newTxn.type}
                    onChange={(e) => {
                      const newType = e.target.value as TransactionType;
                      setNewTxn({ ...newTxn, type: newType });
                      if (newType === "EXPENSE") {
                        setEntries([
                          { id: "1", account: "5100 - Chi phí bán hàng", debit: newTxn.amount || 0, credit: 0 },
                          { id: "2", account: "1000 - Tiền mặt", debit: 0, credit: newTxn.amount || 0 },
                        ]);
                      } else if (newType === "INCOME") {
                        setEntries([
                          { id: "1", account: "1000 - Tiền mặt", debit: newTxn.amount || 0, credit: 0 },
                          { id: "2", account: "4000 - Doanh thu bán hàng", debit: 0, credit: newTxn.amount || 0 },
                        ]);
                      }
                    }}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="JOURNAL">Journal (Sổ cái chung)</option>
                    <option value="EXPENSE">Expense (Chi phí)</option>
                    <option value="INCOME">Income (Doanh thu)</option>
                    <option value="TRANSFER">Transfer (Chuyển bộ)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-neutral-900">Chi tiết Bút toán (Journal Entries)</h3>
                  <button
                    onClick={() => {
                      if (newTxn.type === "EXPENSE" && totalDebit > totalAssetBalance) {
                        toast.error(`Số dư không đủ! Cần: ${new Intl.NumberFormat('vi-VN').format(totalDebit)}, Hiện có: ${new Intl.NumberFormat('vi-VN').format(totalAssetBalance)}`);
                        return;
                      }
                      setEntries([...entries, { id: Math.random().toString(), account: "", debit: 0, credit: 0 }]);
                    }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Thêm dòng
                  </button>
                </div>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-neutral-500">
                      <tr>
                        <th className="px-3 py-2 font-medium w-1/2">Tài khoản (Account)</th>
                        <th className="px-3 py-2 font-medium">Nợ (Debit)</th>
                        <th className="px-3 py-2 font-medium">Có (Credit)</th>
                        <th className="px-3 py-2 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {entries.map((entry, idx) => (
                        <tr key={entry.id} className="bg-white">
                          <td className="p-2">
                            <select
                              value={entry.account}
                              onChange={(e) => {
                                const newEntries = [...entries];
                                newEntries[idx]!.account = e.target.value;
                                setEntries(newEntries);
                              }}
                              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none bg-white"
                            >
                              <option value="" disabled>-- Chọn tài khoản --</option>
                              {MOCK_ACCOUNTS.map(acc => (
                                <option key={acc.code} value={`${acc.code} - ${acc.name}`}>
                                  {acc.code} - {acc.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={entry.debit || ''}
                              onChange={(e) => {
                                const newEntries = [...entries];
                                newEntries[idx]!.debit = Number(e.target.value);
                                setEntries(newEntries);
                              }}
                              className="w-full rounded border border-neutral-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={entry.credit || ''}
                              onChange={(e) => {
                                const newEntries = [...entries];
                                newEntries[idx]!.credit = Number(e.target.value);
                                setEntries(newEntries);
                              }}
                              className="w-full rounded border border-neutral-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => {
                                if (entries.length > 2) {
                                  setEntries(entries.filter((_, i) => i !== idx));
                                }
                              }}
                              className={`text-neutral-400 hover:text-red-500 ${entries.length <= 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-neutral-50 font-medium">
                      <tr>
                        <td className="px-3 py-2 text-right">Tổng cộng:</td>
                        <td className={`px-3 py-2 ${isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
                          {new Intl.NumberFormat('vi-VN').format(totalDebit)}
                        </td>
                        <td className={`px-3 py-2 ${isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
                          {new Intl.NumberFormat('vi-VN').format(totalCredit)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {!isBalanced && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Tổng Nợ và Tổng Có phải bằng nhau và lớn hơn 0.
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateTransaction}
                disabled={!isBalanced || !newTxn.description || (newTxn.type === "EXPENSE" && totalDebit > totalAssetBalance)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tạo giao dịch
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-neutral-900">Chi tiết Giao dịch</h2>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${getStatusColor(selectedTxn.status)}`}>
                  {selectedTxn.status}
                </span>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Mã tham chiếu</p>
                  <p className="text-sm font-medium text-neutral-900">{selectedTxn.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Loại giao dịch</p>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedTxn.type)}
                    <span className="text-sm font-medium text-neutral-900 capitalize">{selectedTxn.type.toLowerCase()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Ngày thực hiện</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(selectedTxn.date))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Tổng số tiền</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTxn.amount)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-neutral-500 mb-1">Mô tả</p>
                  <p className="text-sm font-medium text-neutral-900">{selectedTxn.description}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Chi tiết Bút toán (Journal Entries)</h3>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-neutral-500">
                      <tr>
                        <th className="px-4 py-2 font-medium">Tài khoản (Account)</th>
                        <th className="px-4 py-2 font-medium text-right">Nợ (Debit)</th>
                        <th className="px-4 py-2 font-medium text-right">Có (Credit)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedTxn.entries && selectedTxn.entries.map((entry) => (
                        <tr key={entry.id} className="bg-white">
                          <td className="px-4 py-2">{entry.account}</td>
                          <td className="px-4 py-2 text-right">{entry.debit > 0 ? new Intl.NumberFormat('vi-VN').format(entry.debit) : "-"}</td>
                          <td className="px-4 py-2 text-right">{entry.credit > 0 ? new Intl.NumberFormat('vi-VN').format(entry.credit) : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-neutral-50 font-medium">
                      <tr>
                        <td className="px-4 py-2 text-right">Tổng cộng:</td>
                        <td className="px-4 py-2 text-right text-emerald-600">
                          {new Intl.NumberFormat('vi-VN').format(selectedTxn.entries?.reduce((sum, e) => sum + e.debit, 0) || 0)}
                        </td>
                        <td className="px-4 py-2 text-right text-emerald-600">
                          {new Intl.NumberFormat('vi-VN').format(selectedTxn.entries?.reduce((sum, e) => sum + e.credit, 0) || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
