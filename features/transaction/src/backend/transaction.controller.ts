import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { CreateTransactionDTO } from '@packages/shared-types';
import { TransactionService } from './transaction.service';

@Controller('api/transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post()
    async createTransaction(@Body() data: CreateTransactionDTO, @Req() req: any, @Res() res: any) {
        try {
            // Giả lập lấy user từ token (trong thực tế NestJS sẽ dùng Guard)
            const organizationId = req.user?.organizationId || 'org-demo-123';
            const userId = req.user?.id || 'user-demo-456';

            // Gọi Service để xử lý (Tạo Transaction + Journal Entries)
            const transaction = await this.transactionService.createTransaction(organizationId, userId, data);

            // Trả kết quả về cho Frontend
            return res.status(HttpStatus.CREATED).json({ success: true, data: transaction });
        } catch (error: any) {
            // Bắt lỗi (ví dụ: Tổng nợ khác tổng có)
            return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
        }
    }
}