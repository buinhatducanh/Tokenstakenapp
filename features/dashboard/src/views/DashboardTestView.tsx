// features/dashboard/src/views/DashboardTestView.tsx
"use client";

import { useState } from "react";
import { DashboardView } from "../components/DashboardView";
import { setTestScenario, mockDashboardAPI, type Scenario } from "../api/mock-api";

export function DashboardTestView() {
    const [currentScenario, setCurrentScenario] = useState<Scenario>("normal");
    const [isCreating, setIsCreating] = useState(false);

    const handleScenarioChange = (scenario: Scenario) => {
        setCurrentScenario(scenario);
        setTestScenario(scenario);
        // Reload page to refresh data
        window.location.reload();
    };

    const handleCreateIncome = async () => {
        setIsCreating(true);
        await mockDashboardAPI.createPendingItem("income", Math.floor(Math.random() * 50000000) + 10000000);
        setIsCreating(false);
    };

    const handleCreateExpense = async () => {
        setIsCreating(true);
        await mockDashboardAPI.createPendingItem("expense", Math.floor(Math.random() * 20000000) + 5000000);
        setIsCreating(false);
    };

    return (
        <div>
            {/* Test Controls - Only visible in development */}
            {process.env.NODE_ENV === "development" && (
                <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                    <div className="text-xs font-medium text-gray-500 mb-2">🧪 Test Scenarios</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleScenarioChange("normal")}
                            className={`px-3 py-1 text-xs rounded-md ${currentScenario === "normal"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Normal
                        </button>
                        <button
                            onClick={() => handleScenarioChange("highRevenue")}
                            className={`px-3 py-1 text-xs rounded-md ${currentScenario === "highRevenue"
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            High Revenue
                        </button>
                        <button
                            onClick={() => handleScenarioChange("manyPending")}
                            className={`px-3 py-1 text-xs rounded-md ${currentScenario === "manyPending"
                                    ? "bg-yellow-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Many Pending
                        </button>
                        <button
                            onClick={() => handleScenarioChange("empty")}
                            className={`px-3 py-1 text-xs rounded-md ${currentScenario === "empty"
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Empty
                        </button>
                    </div>
                    
                    <div className="pt-2 mt-2 border-t border-gray-100">
                        <div className="text-xs font-medium text-gray-500 mb-2">➕ Tạo Mock Data (Test Flow)</div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreateIncome}
                                disabled={isCreating}
                                className="px-3 py-1 text-xs rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50 transition-colors"
                            >
                                + Hóa đơn thu
                            </button>
                            <button
                                onClick={handleCreateExpense}
                                disabled={isCreating}
                                className="px-3 py-1 text-xs rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 transition-colors"
                            >
                                + Giao dịch chi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DashboardView />
        </div>
    );
}