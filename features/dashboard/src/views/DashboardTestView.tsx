// features/dashboard/src/views/DashboardTestView.tsx
"use client";

import { useState } from "react";
import { DashboardView } from "../components/DashboardView";
import { setTestScenario, type Scenario } from "../api/mock-api";

export function DashboardTestView() {
    const [currentScenario, setCurrentScenario] = useState<Scenario>("normal");

    const handleScenarioChange = (scenario: Scenario) => {
        setCurrentScenario(scenario);
        setTestScenario(scenario);
        // Reload page to refresh data
        window.location.reload();
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
                </div>
            )}

            <DashboardView />
        </div>
    );
}