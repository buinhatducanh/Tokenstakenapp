export type ScheduledReportJob = {
  id: string;
  orgId: string;
  reportType: "pnl" | "cashflow" | "balance-sheet";
  cron: string;
  emailTo: string[];
  enabled: boolean;
};

export const scheduleReport = async (_job: ScheduledReportJob) => {
  return { ok: true };
};

