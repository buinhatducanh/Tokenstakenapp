import { PrismaClient, Prisma } from '@tokens-taken/db';
import { CreateTransactionDTO } from '@packages/shared-types';
import { isBalanced } from '@tokens-taken/common-utils';

const prisma = new PrismaClient();

// Typed Error theo chuẩn PROJECT_GUIDELINES.md
class ValidationError extends Error {
    public code = 'VALIDATION_ERROR';
    public statusCode = 400;
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class TransactionService {
    async createTransaction(organizationId: string, userId: string | null, data: CreateTransactionDTO) {
        // 1. Kiểm tra nguyên tắc Kế toán Kép — dùng isBalanced từ common-utils
        if (!isBalanced(data.entries)) {
            const totalDebit = data.entries.reduce((sum, e) => sum + parseFloat(e.debit), 0);
            const totalCredit = data.entries.reduce((sum, e) => sum + parseFloat(e.credit), 0);
            throw new ValidationError(
                `Kế toán kép không cân bằng: Tổng Nợ (${totalDebit}) khác Tổng Có (${totalCredit})`
            );
        }

        const totalDebit = data.entries.reduce((sum, e) => sum + parseFloat(e.debit), 0);

        // 2. Sử dụng Prisma $transaction (ACID) với Serializable isolation
        return await prisma.$transaction(
            async (tx) => {
                // a. Tạo Transaction gốc
                const transaction = await tx.transaction.create({
                    data: {
                        organizationId,
                        date: data.date ? new Date(data.date) : new Date(),
                        description: data.description || '',
                        amount: String(totalDebit),
                        type: data.type,
                        status: 'PENDING',
                        currency: data.currency || 'VND',
                        reference: 'TXN-' + Date.now(),
                        exchangeRate: '1',
                        journalEntries: {
                            // b. Tạo luôn các bút toán (Journal Entries)
                            create: data.entries.map(entry => ({
                                account: { connect: { id: entry.accountId } },
                                debit: entry.debit,
                                credit: entry.credit,
                                description: entry.description ?? null
                            }))
                        }
                    }
                });

                // c. Ghi Audit Log (userId nullable — null khi chưa có auth context thật)
                await tx.auditLog.create({
                    data: {
                        organizationId,
                        userId: userId || null,
                        action: 'transaction.create',
                        entityType: 'Transaction',
                        entityId: transaction.id,
                        changes: JSON.stringify({
                            type: data.type,
                            amount: String(totalDebit),
                            entriesCount: data.entries.length,
                        }),
                    }
                });

                return transaction;
            },
            // {
            //     isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            //     timeout: 10_000,
            // }
        );
    }
}