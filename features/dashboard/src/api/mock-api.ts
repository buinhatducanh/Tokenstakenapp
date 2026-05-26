// features/dashboard/src/api/mock-api.ts
// Mock API for Dashboard testing - Simulates backend responses

export interface MockStatsResponse {
    revenue: number;
    expenses: number;
    pendingCount: number;
    pendingValue: number;
    cashflow: number;
    trends: {
        revenue: number;
        expenses: number;
        cashflow: number;
    };
}

export interface MockTransaction {
    id: string;
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    status: "APPROVED" | "PENDING" | "FAILED";
    date: string;
    counterparty: string;
    invoiceNumber?: string;
}

export interface MockPendingApproval {
    id: string;
    code: string;
    amount: number;
    submitter: string;
    type: "invoice" | "transaction";
    submittedAt: string;
    priority: "high" | "medium" | "low";
}

// Mock data với nhiều kịch bản khác nhau
const mockDataScenarios = {
    // Kịch bản 1: Bình thường
    normal: {
        stats: {
            revenue: 128_400_000,
            expenses: 74_100_000,
            pendingCount: 7,
            pendingValue: 45_200_000,
            cashflow: 54_300_000,
            trends: { revenue: 12.3, expenses: 5.7, cashflow: 8.1 },
        },
        transactions: [
            {
                id: "tx_001",
                description: "Khách hàng Nguyễn Văn A",
                amount: 15_500_000,
                type: "INCOME",
                status: "APPROVED",
                date: new Date().toISOString(),
                counterparty: "Nguyễn Văn A",
            },
            {
                id: "tx_002",
                description: "Chi phí văn phòng phẩm",
                amount: 2_300_000,
                type: "EXPENSE",
                status: "APPROVED",
                date: new Date().toISOString(),
                counterparty: "Văn phòng phẩm Hòa Bình",
            },
            {
                id: "tx_003",
                description: "Hóa đơn #INV-0042",
                amount: 42_000_000,
                type: "INCOME",
                status: "APPROVED",
                date: new Date(Date.now() - 86400000).toISOString(),
                counterparty: "Công ty TNHH ABC",
                invoiceNumber: "INV-0042",
            },
            {
                id: "tx_004",
                description: "Lương tháng 12",
                amount: 50_000_000,
                type: "EXPENSE",
                status: "APPROVED",
                date: new Date(Date.now() - 86400000).toISOString(),
                counterparty: "Nhân viên",
            },
            {
                id: "tx_005",
                description: "Hóa đơn #INV-0041",
                amount: 8_500_000,
                type: "INCOME",
                status: "PENDING",
                date: new Date(Date.now() - 172800000).toISOString(),
                counterparty: "Khách hàng Phạm Thị D",
                invoiceNumber: "INV-0041",
            },
            {
                id: "tx_006",
                description: "Thanh toán đối tác",
                amount: 12_000_000,
                type: "EXPENSE",
                status: "PENDING",
                date: new Date(Date.now() - 172800000).toISOString(),
                counterparty: "Đối tác XYZ",
            },
        ],
        pendingApprovals: [
            {
                id: "app_001",
                code: "INV-0045",
                amount: 14_000_000,
                submitter: "Trần Thị B",
                type: "invoice",
                submittedAt: new Date(Date.now() - 3600000).toISOString(),
                priority: "high",
            },
            {
                id: "app_002",
                code: "INV-0044",
                amount: 6_500_000,
                submitter: "Lê Văn C",
                type: "invoice",
                submittedAt: new Date(Date.now() - 7200000).toISOString(),
                priority: "medium",
            },
            {
                id: "app_003",
                code: "TXN-0088",
                amount: 22_000_000,
                submitter: "Chi phí IT",
                type: "transaction",
                submittedAt: new Date(Date.now() - 86400000).toISOString(),
                priority: "high",
            },
            {
                id: "app_004",
                code: "INV-0043",
                amount: 9_800_000,
                submitter: "Công ty XYZ",
                type: "invoice",
                submittedAt: new Date(Date.now() - 172800000).toISOString(),
                priority: "medium",
            },
        ],
    },

    // Kịch bản 2: Doanh thu cao
    highRevenue: {
        stats: {
            revenue: 450_000_000,
            expenses: 120_000_000,
            pendingCount: 3,
            pendingValue: 28_500_000,
            cashflow: 330_000_000,
            trends: { revenue: 35.2, expenses: 8.1, cashflow: 42.5 },
        },
        transactions: [
            {
                id: "tx_h1",
                description: "Hợp đồng lớn - Công ty A",
                amount: 200_000_000,
                type: "INCOME",
                status: "APPROVED",
                date: new Date().toISOString(),
                counterparty: "Công ty A",
            },
            {
                id: "tx_h2",
                description: "Hợp đồng lớn - Công ty B",
                amount: 150_000_000,
                type: "INCOME",
                status: "APPROVED",
                date: new Date(Date.now() - 86400000).toISOString(),
                counterparty: "Công ty B",
            },
            {
                id: "tx_h3",
                description: "Thanh toán đối tác C",
                amount: 25_000_000,
                type: "EXPENSE",
                status: "APPROVED",
                date: new Date(Date.now() - 172800000).toISOString(),
                counterparty: "Đối tác C",
            },
            {
                id: "tx_h4",
                description: "Chi phí vận hành",
                amount: 18_500_000,
                type: "EXPENSE",
                status: "APPROVED",
                date: new Date(Date.now() - 259200000).toISOString(),
                counterparty: "Vận hành",
            },
            {
                id: "tx_h5",
                description: "Dịch vụ tư vấn",
                amount: 35_000_000,
                type: "EXPENSE",
                status: "PENDING",
                date: new Date(Date.now() - 345600000).toISOString(),
                counterparty: "Công ty Tư vấn XYZ",
            },
        ],
        pendingApprovals: [
            {
                id: "app_h1",
                code: "INV-0100",
                amount: 15_000_000,
                submitter: "Nguyễn Văn A",
                type: "invoice",
                submittedAt: new Date().toISOString(),
                priority: "high",
            },
            {
                id: "app_h2",
                code: "INV-0101",
                amount: 8_500_000,
                submitter: "Trần Thị B",
                type: "invoice",
                submittedAt: new Date(Date.now() - 86400000).toISOString(),
                priority: "medium",
            },
            {
                id: "app_h3",
                code: "TXN-0090",
                amount: 5_000_000,
                submitter: "Lê Văn C",
                type: "transaction",
                submittedAt: new Date(Date.now() - 172800000).toISOString(),
                priority: "low",
            },
        ],
    },

    // Kịch bản 3: Nhiều giao dịch chờ duyệt
    manyPending: {
        stats: {
            revenue: 95_000_000,
            expenses: 110_000_000,
            pendingCount: 15,
            pendingValue: 98_500_000,
            cashflow: -15_000_000,
            trends: { revenue: -5.2, expenses: 15.3, cashflow: -25.8 },
        },
        transactions: [
            {
                id: "tx_p1",
                description: "Giao dịch chờ duyệt #1",
                amount: 25_000_000,
                type: "EXPENSE",
                status: "PENDING",
                date: new Date().toISOString(),
                counterparty: "Nhà cung cấp A",
            },
            {
                id: "tx_p2",
                description: "Giao dịch chờ duyệt #2",
                amount: 18_500_000,
                type: "EXPENSE",
                status: "PENDING",
                date: new Date().toISOString(),
                counterparty: "Nhà cung cấp B",
            },
            {
                id: "tx_p3",
                description: "Thu tiền khách hàng C",
                amount: 32_000_000,
                type: "INCOME",
                status: "APPROVED",
                date: new Date(Date.now() - 86400000).toISOString(),
                counterparty: "Khách hàng C",
            },
            {
                id: "tx_p4",
                description: "Chi phí marketing",
                amount: 12_000_000,
                type: "EXPENSE",
                status: "PENDING",
                date: new Date(Date.now() - 86400000).toISOString(),
                counterparty: "Agency Marketing",
            },
            {
                id: "tx_p5",
                description: "Giao dịch chờ duyệt #3",
                amount: 45_000_000,
                type: "EXPENSE",
                status: "PENDING",
                date: new Date(Date.now() - 172800000).toISOString(),
                counterparty: "Nhà cung cấp C",
            },
            {
                id: "tx_p6",
                description: "Thu tiền bán hàng",
                amount: 28_500_000,
                type: "INCOME",
                status: "APPROVED",
                date: new Date(Date.now() - 259200000).toISOString(),
                counterparty: "Khách hàng D",
            },
        ],
        pendingApprovals: Array.from({ length: 15 }, (_, i) => ({
            id: `app_p${i}`,
            code: i % 3 === 0 ? `TXN-${2000 + i}` : `INV-${2000 + i}`,
            amount: 3_000_000 + i * 2_500_000,
            submitter: `Người gửi ${String.fromCharCode(65 + (i % 26))}`,
            type: i % 3 === 0 ? "transaction" : "invoice",
            submittedAt: new Date(Date.now() - i * 3600000).toISOString(),
            priority: i < 5 ? "high" : i < 10 ? "medium" : "low",
        })),
    },

    // Kịch bản 4: Không có dữ liệu
    empty: {
        stats: {
            revenue: 0,
            expenses: 0,
            pendingCount: 0,
            pendingValue: 0,
            cashflow: 0,
            trends: { revenue: 0, expenses: 0, cashflow: 0 },
        },
        transactions: [],
        pendingApprovals: [],
    },

    // Kịch bản 5: Lỗi (để test error handling)
    error: {
        stats: {
            revenue: 0,
            expenses: 0,
            pendingCount: 0,
            pendingValue: 0,
            cashflow: 0,
            trends: { revenue: 0, expenses: 0, cashflow: 0 },
        },
        transactions: [],
        pendingApprovals: [],
    },
};

export type Scenario = "normal" | "highRevenue" | "manyPending" | "empty" | "error";
export type Timeframe = "day" | "week" | "month" | "year";

// Helper to scale stats based on timeframe (giả sử dữ liệu gốc là theo tháng)
function scaleStatsForTimeframe(stats: MockStatsResponse, timeframe: Timeframe): MockStatsResponse {
    const scaleFactor = timeframe === "day" ? 1/30 : timeframe === "week" ? 1/4 : timeframe === "year" ? 12 : 1;
    return {
        ...stats,
        revenue: Math.round(stats.revenue * scaleFactor),
        expenses: Math.round(stats.expenses * scaleFactor),
        cashflow: Math.round(stats.cashflow * scaleFactor),
        // pendingCount và pendingValue là trạng thái hiện tại nên không scale theo thời gian
    };
}

export interface ChartDataPoint {
    period: string;
    revenue: number;
    expenses: number;
    cashflow: number;
    pendingCount: number;
    approvedCount: number;
}

function generateChartData(timeframe: Timeframe, stats: MockStatsResponse): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const baseRevenue = stats.revenue || 0;
    const baseExpenses = stats.expenses || 0;
    const basePending = stats.pendingCount || 0;
    
    let periods: string[] = [];
    let divider = 1;
    
    if (timeframe === "year") {
        periods = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
        divider = 1; 
    } else if (timeframe === "month") {
        periods = ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"];
        divider = 4;
    } else if (timeframe === "week") {
        periods = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        divider = 30; 
    } else if (timeframe === "day") {
        periods = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
        divider = 30 * 6;
    }
    
    for (const period of periods) {
        // Random variance between 0.7 and 1.3
        const varianceR = 0.7 + Math.random() * 0.6;
        const varianceE = 0.7 + Math.random() * 0.6;
        
        const rev = Math.round((baseRevenue / divider) * varianceR);
        const exp = Math.round((baseExpenses / divider) * varianceE);
        
        data.push({
            period,
            revenue: rev,
            expenses: exp,
            cashflow: rev - exp,
            pendingCount: Math.max(0, Math.round((basePending / (periods.length / 2)) * varianceE) + Math.floor(Math.random() * 3 - 1)),
            approvedCount: Math.max(0, Math.round(10 * varianceR)),
        });
    }
    
    return data;
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper để random delay (simulate network fluctuation)
const randomDelay = (baseMs: number) => {
    const randomMs = Math.floor(Math.random() * 300) + baseMs;
    return delay(randomMs);
};

// Mock API functions
export const mockDashboardAPI = {
    // Get dashboard stats
    async getStats(scenario: Scenario = "normal", timeframe: Timeframe = "month"): Promise<MockStatsResponse> {
        await randomDelay(400);

        // Simulate error for error scenario
        if (scenario === "error") {
            throw new Error("Failed to fetch dashboard stats");
        }

        const data = mockDataScenarios[scenario];
        if (!data) {
            throw new Error(`Scenario "${scenario}" not found`);
        }

        return scaleStatsForTimeframe(data.stats, timeframe);
    },

    // Get recent transactions
    async getRecentTransactions(
        scenario: Scenario = "normal",
        limit: number = 5
    ): Promise<MockTransaction[]> {
        await randomDelay(300);

        if (scenario === "error") {
            throw new Error("Failed to fetch recent transactions");
        }

        const data = mockDataScenarios[scenario];
        if (!data) {
            return [];
        }

        return data.transactions.slice(0, limit);
    },

    // Get pending approvals
    async getPendingApprovals(
        scenario: Scenario = "normal",
        limit: number = 5
    ): Promise<MockPendingApproval[]> {
        await randomDelay(350);

        if (scenario === "error") {
            throw new Error("Failed to fetch pending approvals");
        }

        const data = mockDataScenarios[scenario];
        if (!data) {
            return [];
        }

        return data.pendingApprovals.slice(0, limit);
    },

    // Get full dashboard data
    async getDashboardData(scenario: Scenario = "normal", timeframe: Timeframe = "month"): Promise<{
        stats: MockStatsResponse;
        transactions: MockTransaction[];
        pendingApprovals: MockPendingApproval[];
        chartData: ChartDataPoint[];
    }> {
        await randomDelay(500);

        // Simulate error for error scenario
        if (scenario === "error") {
            throw new Error("Failed to fetch dashboard data. Please try again.");
        }

        const data = mockDataScenarios[scenario];
        if (!data) {
            throw new Error(`Scenario "${scenario}" not found`);
        }

        return {
            stats: scaleStatsForTimeframe(data.stats, timeframe),
            transactions: data.transactions,
            pendingApprovals: data.pendingApprovals,
            chartData: generateChartData(timeframe, data.stats),
        };
    },

    // Create new pending item
    async createPendingItem(type: "income" | "expense", amount: number): Promise<void> {
        await randomDelay(300);
        const data = mockDataScenarios[currentScenario];
        if (!data || currentScenario === "empty" || currentScenario === "error") return;

        const isIncome = type === "income";
        const newId = `app_mock_${Date.now()}`;
        const newCode = isIncome ? `INV-${Math.floor(Math.random() * 10000)}` : `TXN-${Math.floor(Math.random() * 10000)}`;
        
        data.pendingApprovals.unshift({
            id: newId,
            code: newCode,
            amount: amount,
            submitter: "Hệ thống test",
            type: isIncome ? "invoice" : "transaction",
            submittedAt: new Date().toISOString(),
            priority: "medium",
        });
        
        data.stats.pendingCount += 1;
        data.stats.pendingValue += amount;
        
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("dashboard-refresh"));
        }
    },

    // Approve pending item
    async approvePendingItem(id: string): Promise<void> {
        await randomDelay(400);
        const data = mockDataScenarios[currentScenario];
        if (!data) return;

        const index = data.pendingApprovals.findIndex(p => p.id === id);
        if (index === -1) return;

        const pending = data.pendingApprovals[index];
        data.pendingApprovals.splice(index, 1);
        
        data.stats.pendingCount = Math.max(0, data.stats.pendingCount - 1);
        data.stats.pendingValue = Math.max(0, data.stats.pendingValue - pending.amount);

        const isIncome = pending.type === 'invoice';
        
        if (isIncome) {
            data.stats.revenue += pending.amount;
        } else {
            data.stats.expenses += pending.amount;
        }
        data.stats.cashflow = data.stats.revenue - data.stats.expenses;

        data.transactions.unshift({
            id: `tx_mock_${Date.now()}`,
            description: `Đã duyệt: ${pending.code}`,
            amount: pending.amount,
            type: isIncome ? "INCOME" : "EXPENSE",
            status: "APPROVED",
            date: new Date().toISOString(),
            counterparty: pending.submitter,
            invoiceNumber: isIncome ? pending.code : undefined,
        });

        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("dashboard-refresh"));
        }
    },
};

// Helper to change scenario (for testing UI)
let currentScenario: Scenario = "normal";

export function setTestScenario(scenario: Scenario) {
    currentScenario = scenario;
    console.log(`[Mock API] Scenario changed to: ${scenario}`);

    // Optional: Dispatch event để các component có thể react
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("scenario-change", { detail: { scenario } }));
    }
}

export function getCurrentScenario(): Scenario {
    return currentScenario;
}

// Helper để lấy danh sách scenarios (cho UI test)
export function getAvailableScenarios(): { value: Scenario; label: string; description: string }[] {
    return [
        { value: "normal", label: "Bình thường", description: "Dữ liệu dashboard chuẩn" },
        { value: "highRevenue", label: "Doanh thu cao", description: "Doanh thu và dòng tiền lớn" },
        { value: "manyPending", label: "Nhiều chờ duyệt", description: "Nhiều giao dịch cần duyệt, dòng tiền âm" },
        { value: "empty", label: "Không dữ liệu", description: "Dashboard trống" },
        { value: "error", label: "Lỗi", description: "Test trường hợp lỗi API" },
    ];
}