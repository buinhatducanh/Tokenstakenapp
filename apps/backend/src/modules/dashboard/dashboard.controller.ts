// apps/backend/src/modules/dashboard/dashboard.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('api/dashboard')
export class DashboardController {
    @Get('stats')
    @ApiQuery({ name: 'scenario', required: false, enum: ['normal', 'highRevenue', 'manyPending', 'empty'] })
    async getStats(@Query('scenario') scenario: string = 'normal') {
        const mockData = {
            normal: {
                revenue: 128400000,
                expenses: 74100000,
                pendingCount: 7,
                cashflow: 54300000,
                trends: { revenue: 12.3, expenses: 5.7, cashflow: 8.1 }
            },
            highRevenue: {
                revenue: 450000000,
                expenses: 120000000,
                pendingCount: 3,
                cashflow: 330000000,
                trends: { revenue: 35.2, expenses: 8.1, cashflow: 42.5 }
            },
            manyPending: {
                revenue: 95000000,
                expenses: 110000000,
                pendingCount: 15,
                cashflow: -15000000,
                trends: { revenue: -5.2, expenses: 15.3, cashflow: -25.8 }
            },
            empty: {
                revenue: 0,
                expenses: 0,
                pendingCount: 0,
                cashflow: 0,
                trends: { revenue: 0, expenses: 0, cashflow: 0 }
            }
        };

        return {
            success: true,
            data: mockData[scenario as keyof typeof mockData] || mockData.normal
        };
    }

    @Get('transactions/recent')
    async getRecentTransactions(@Query('limit') limit: number = 5) {
        // Similar mock data
        return { success: true, data: [] };
    }

    @Get('approvals/pending')
    async getPendingApprovals(@Query('limit') limit: number = 5) {
        return { success: true, data: [] };
    }
}