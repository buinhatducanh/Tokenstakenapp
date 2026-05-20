// features/transaction/src/frontend/components/CreateTransactionForm.tsx
import React, { useState, useEffect } from 'react';
// Tái sử dụng các UI components của dự án
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { CreateTransactionDTO } from '@packages/shared-types';
import { useAccounts } from '../api/transaction.hooks';

interface Props {
    onSubmit: (data: CreateTransactionDTO) => void;
}

export function CreateTransactionForm({ onSubmit }: Props) {
    const [description, setDescription] = useState('');
    const [txType, setTxType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT' | 'JOURNAL'>('JOURNAL');

    // Khởi tạo sẵn 2 dòng bút toán trống (vì kế toán kép cần ít nhất 2 dòng)
    const [entries, setEntries] = useState([
        { accountId: '', debit: '0', credit: '0' },
        { accountId: '', debit: '0', credit: '0' }
    ]);
    const { data: accounts = [] } = useAccounts();
    // Tự động tính amount từ tổng Nợ
    const totalDebit = entries.reduce((sum, e) => sum + Number(e.debit || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + Number(e.credit || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isBalanced) {
            alert(`Kế toán kép không cân bằng! Tổng Nợ: ${totalDebit.toLocaleString()} ≠ Tổng Có: ${totalCredit.toLocaleString()}`);
            return;
        }

        // Gói dữ liệu theo đúng DTO đã định nghĩa
        const data: CreateTransactionDTO = {
            type: txType,
            date: new Date().toISOString(),
            amount: String(totalDebit), // Tự động lấy từ tổng Nợ
            description,
            entries
        };

        // Đẩy dữ liệu ra ngoài cho lớp Cha gọi API
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-xl border">
            <div>
                <h2 className="text-xl font-semibold mb-1">Tạo Giao Dịch Mới</h2>
                <p className="text-sm text-gray-500">Nhập thông tin giao dịch và bút toán liên quan.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="desc">Mô tả giao dịch</Label>
                    <Input
                        id="desc"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                        placeholder="VD: Thu tiền khách hàng tháng 5"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="txType">Loại giao dịch</Label>
                    <select
                        id="txType"
                        value={txType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTxType(e.target.value as any)}
                        className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950"
                    >
                        <option value="INCOME">Thu nhập (Income)</option>
                        <option value="EXPENSE">Chi phí (Expense)</option>
                        <option value="TRANSFER">Chuyển khoản (Transfer)</option>
                        <option value="ADJUSTMENT">Điều chỉnh (Adjustment)</option>
                        <option value="JOURNAL">Bút toán (Journal)</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Chi tiết bút toán (Journal Entries)</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => setEntries([...entries, { accountId: '', debit: '0', credit: '0' }])}>
                        + Thêm dòng
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-1">
                        <div className="col-span-4">TÀI KHOẢN</div>
                        <div className="col-span-3 text-right">NỢ (DEBIT)</div>
                        <div className="col-span-3 text-right">CÓ (CREDIT)</div>
                        <div className="col-span-2 text-center">XÓA</div>
                    </div>
                    {entries.map((entry, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-4">
                                <select
                                    value={entry.accountId}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                        const newEntries = [...entries];
                                        newEntries[index].accountId = e.target.value;
                                        setEntries(newEntries);
                                    }}
                                    className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="" disabled>Chọn TK...</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.code} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-3">
                                <Input
                                    type="number"
                                    min="0"
                                    value={entry.debit}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newEntries = [...entries];
                                        newEntries[index].debit = e.target.value || '0';
                                        setEntries(newEntries);
                                    }}
                                    className="text-right"
                                    required
                                />
                            </div>
                            <div className="col-span-3">
                                <Input
                                    type="number"
                                    min="0"
                                    value={entry.credit}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newEntries = [...entries];
                                        newEntries[index].credit = e.target.value || '0';
                                        setEntries(newEntries);
                                    }}
                                    className="text-right"
                                    required
                                />
                            </div>
                            <div className="col-span-2 text-center">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        if (entries.length <= 2) return alert('Cần ít nhất 2 bút toán!');
                                        setEntries(entries.filter((_, i) => i !== index));
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`flex justify-end gap-6 text-sm font-semibold p-2 rounded-md ${isBalanced ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    <div>Tổng Nợ: {totalDebit.toLocaleString('vi-VN')}</div>
                    <div>Tổng Có: {totalCredit.toLocaleString('vi-VN')}</div>
                    {!isBalanced && <div className="font-bold">⚠ Không cân bằng!</div>}
                    {isBalanced && <div>✓ Cân bằng</div>}
                </div>
            </div>

            <Button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white">
                Tạo Giao Dịch
            </Button>
        </form>
    );
}