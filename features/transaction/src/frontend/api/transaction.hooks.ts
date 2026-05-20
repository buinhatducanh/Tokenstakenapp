// features/transaction/src/frontend/api/transaction.hooks.ts
// Dùng React Query theo đúng chuẩn PROJECT_GUIDELINES.md & SYSTEM_ARCHITECTURE.md

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateTransactionDTO } from '@packages/shared-types';

// ========== API functions ==========

async function fetchTransactions() {
    const response = await fetch('/api/transactions');
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
}

async function fetchAccounts() {
    const response = await fetch('/api/accounts');
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
}

async function createTransaction(data: CreateTransactionDTO) {
    const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Đã xảy ra lỗi khi tạo giao dịch');
    return result;
}

// ========== React Query Hooks ==========

/** GET danh sách giao dịch — useQuery */
export function useTransactions() {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: fetchTransactions,
    });
}

/** GET danh sách tài khoản — useQuery */
export function useAccounts() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: fetchAccounts,
    });
}

/** POST tạo giao dịch — useMutation + Optimistic UI */
export function useCreateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTransaction,

        // Optimistic Update: UI cập nhật ngay lập tức, không chờ server
        onMutate: async (newTx) => {
            await queryClient.cancelQueries({ queryKey: ['transactions'] });
            const previous = queryClient.getQueryData(['transactions']);

            // Tạo bản ghi tạm (optimistic) để hiển thị ngay trên bảng
            queryClient.setQueryData(['transactions'], (old: any[] | undefined) => [
                {
                    id: 'temp-' + Date.now(),
                    reference: 'TXN-...',
                    description: newTx.description || '',
                    amount: newTx.amount,
                    date: new Date().toISOString(),
                    status: 'PENDING',
                    type: newTx.type,
                },
                ...(old || []),
            ]);

            return { previous }; // Dùng để rollback nếu lỗi
        },

        // Rollback khi server lỗi
        onError: (_err, _newTx, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['transactions'], context.previous);
            }
        },

        // Sau khi thành công hoặc lỗi → refetch dữ liệu thật từ server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
}