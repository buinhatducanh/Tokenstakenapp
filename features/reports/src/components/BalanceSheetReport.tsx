import type { BalanceSheetReportData } from "../report.types";
import { Scale, Landmark, CreditCard, PiggyBank } from "lucide-react";

const formatMoney = (amount: string, currency: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount));

export const BalanceSheetReport = ({ data }: { data: BalanceSheetReportData }) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500" />
      
      <div className="relative z-10 flex items-center justify-between pb-6 border-b border-neutral-100">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
            <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
              <Scale className="w-4 h-4" />
            </div>
            Balance Sheet
          </h2>
          <span className="text-[13px] text-neutral-500 mt-1 block">
            As of {data.asOf}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-600">
          <span>Assets = Liab. + Equity</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3 relative z-10">
        {/* Assets Column */}
        <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-violet-600 flex items-center gap-2">
              <Landmark className="w-3.5 h-3.5" />
              Assets
            </h3>
          </div>
          <ul className="space-y-3 mb-6 min-h-[120px]">
            {data.assets.length > 0 ? data.assets.map((line) => (
              <li key={`${line.accountCode ?? line.label}`} className="flex items-center justify-between text-[13px] group">
                <span className="text-neutral-600 font-medium group-hover:text-violet-600 transition-colors line-clamp-1 pr-2">{line.label}</span>
                <span className="font-semibold text-neutral-900 shrink-0">{formatMoney(line.total.amount, line.total.currency)}</span>
              </li>
            )) : <li className="text-[13px] text-neutral-400 italic">No assets</li>}
          </ul>
          <div className="pt-4 border-t border-neutral-200/60 flex items-center justify-between">
            <span className="text-[12px] font-medium text-neutral-500 uppercase tracking-wide">Total Assets</span>
            <span className="font-bold text-violet-700 text-base">{formatMoney(data.totals.totalAssets.amount, data.totals.totalAssets.currency)}</span>
          </div>
        </div>

        {/* Liabilities Column */}
        <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" />
              Liabilities
            </h3>
          </div>
          <ul className="space-y-3 mb-6 min-h-[120px]">
            {data.liabilities.length > 0 ? data.liabilities.map((line) => (
              <li key={`${line.accountCode ?? line.label}`} className="flex items-center justify-between text-[13px] group">
                <span className="text-neutral-600 font-medium group-hover:text-orange-600 transition-colors line-clamp-1 pr-2">{line.label}</span>
                <span className="font-semibold text-neutral-900 shrink-0">{formatMoney(line.total.amount, line.total.currency)}</span>
              </li>
            )) : <li className="text-[13px] text-neutral-400 italic">No liabilities</li>}
          </ul>
          <div className="pt-4 border-t border-neutral-200/60 flex items-center justify-between">
            <span className="text-[12px] font-medium text-neutral-500 uppercase tracking-wide">Total Liab.</span>
            <span className="font-bold text-orange-700 text-base">{formatMoney(data.totals.totalLiabilities.amount, data.totals.totalLiabilities.currency)}</span>
          </div>
        </div>

        {/* Equity Column */}
        <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-fuchsia-600 flex items-center gap-2">
              <PiggyBank className="w-3.5 h-3.5" />
              Equity
            </h3>
          </div>
          <ul className="space-y-3 mb-6 min-h-[120px]">
            {data.equity.length > 0 ? data.equity.map((line) => (
              <li key={`${line.accountCode ?? line.label}`} className="flex items-center justify-between text-[13px] group">
                <span className="text-neutral-600 font-medium group-hover:text-fuchsia-600 transition-colors line-clamp-1 pr-2">{line.label}</span>
                <span className="font-semibold text-neutral-900 shrink-0">{formatMoney(line.total.amount, line.total.currency)}</span>
              </li>
            )) : <li className="text-[13px] text-neutral-400 italic">No equity</li>}
          </ul>
          <div className="pt-4 border-t border-neutral-200/60 flex items-center justify-between">
            <span className="text-[12px] font-medium text-neutral-500 uppercase tracking-wide">Total Equity</span>
            <span className="font-bold text-fuchsia-700 text-base">{formatMoney(data.totals.totalEquity.amount, data.totals.totalEquity.currency)}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
