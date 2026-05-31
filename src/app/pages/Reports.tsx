import {
  CashFlowReport,
  BalanceSheetReport,
  PnlReport,
  useBalanceSheetReport,
  useCashFlowReport,
  usePnlReport,
} from "@features/reports";
import { useState } from "react";
import { Calendar, RefreshCw } from "lucide-react";

const ORG_ID = "org_demo_1"; // TODO: replace with auth context
const CURRENCY = "VND";

const toIsoDate = (value: Date) => value.toISOString().slice(0, 10);

const today = new Date();
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const DEFAULT_RANGE = {
  from: toIsoDate(firstOfMonth),
  to: toIsoDate(today),
};

export const Reports = () => {
  const [range, setRange] = useState(DEFAULT_RANGE);

  const updateRange = (field: "from" | "to", value: string) => {
    setRange((current) => ({ ...current, [field]: value }));
  };

  const pnl = usePnlReport({
    orgId: ORG_ID,
    period: "monthly",
    range,
    currency: CURRENCY,
  });
  const cashFlow = useCashFlowReport({
    orgId: ORG_ID,
    period: "monthly",
    range,
    currency: CURRENCY,
  });
  const balanceSheet = useBalanceSheetReport(ORG_ID, range.to, CURRENCY);

  const isLoading = pnl.isLoading || cashFlow.isLoading || balanceSheet.isLoading;
  const isError = pnl.isError || cashFlow.isError || balanceSheet.isError;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between rounded-2xl bg-white p-6 shadow-sm border border-neutral-100">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Financial Reports</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Real-time insights across your Profit & Loss, Cash Flow, and Balance Sheet.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl bg-neutral-50 border border-neutral-200 p-1">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <input
                type="date"
                value={range.from}
                onChange={(event) => updateRange("from", event.target.value)}
                className="bg-transparent text-[13px] font-medium text-neutral-700 outline-none cursor-pointer"
              />
            </div>
            <span className="text-neutral-300">→</span>
            <div className="flex items-center gap-2 px-3 py-1.5">
              <input
                type="date"
                value={range.to}
                onChange={(event) => updateRange("to", event.target.value)}
                className="bg-transparent text-[13px] font-medium text-neutral-700 outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/50 border border-neutral-100 border-dashed">
          <RefreshCw className="w-8 h-8 text-neutral-300 animate-spin mb-4" />
          <p className="text-sm font-medium text-neutral-500">Aggregating ledger data...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 mb-4">
            <span className="text-xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-rose-800">Failed to load reports</h3>
          <p className="mt-1 text-sm text-rose-600">Please check your backend connection and try again.</p>
        </div>
      )}

      {/* Reports Grid */}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {pnl.data && <PnlReport data={pnl.data} />}
            {cashFlow.data && <CashFlowReport data={cashFlow.data} />}
          </div>

          <div>{balanceSheet.data && <BalanceSheetReport data={balanceSheet.data} />}</div>
        </div>
      )}
    </div>
  );
};
