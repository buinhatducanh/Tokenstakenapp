/**
 * ============================================================================
 * REPORTS CONTROLLER — REST API Endpoints cho báo cáo tài chính
 * ============================================================================
 *
 * Task 6: Reports & Export
 *
 * Endpoints:
 *   GET  /reports/pnl             → P&L report
 *   GET  /reports/cash-flow       → Cash Flow report
 *   GET  /reports/balance-sheet   → Balance Sheet report
 *   GET  /reports/export/:type    → Export P&L/CF/BS ra CSV/PDF/JSON
 *   GET  /reports/scheduled       → List scheduled reports
 *   POST /reports/scheduled       → Create scheduled report
 *   PATCH /reports/scheduled/:id  → Update scheduled report
 *   DELETE /reports/scheduled/:id → Delete scheduled report
 *
 * Validation: Dùng class-validator qua ValidationPipe của NestJS.
 * Auth: Lấy organizationId từ JWT token (decorator @CurrentUser).
 *
 * ============================================================================
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  Res,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { Response } from "express";

// Import service — được inject qua module
import { ReportService } from "./reports.service";

// Import DTOs — dùng cho validation
import {
  PnlQueryDto,
  CashFlowQueryDto,
  BalanceSheetQueryDto,
} from "./dto/report-query.dto";
import {
  CreateScheduledReportDto,
  UpdateScheduledReportDto,
} from "./dto/scheduled-report.dto";

// Import types — compile-time only (không bundle runtime)
import type {
  PnlReport,
  CashFlowReport,
  BalanceSheetReport,
  ReportFormat,
} from "./types/report.types";

/**
 * Helper: parse date string thành Date object.
 * Throw BadRequestException nếu date string không hợp lệ.
 */
function parseDate(value: string | undefined, name: string): Date {
  if (!value) {
    throw new Error(`${name} is required (ISO 8601 format: YYYY-MM-DD)`);
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`${name} is not a valid date`);
  }
  return date;
}

/**
 * Helper: lấy organizationId từ request context.
 * Hiện tại dùng hardcoded orgId — sau này lấy từ JWT @CurrentUser decorator.
 *
 * TODO (Task 1 auth hoàn thành): Thay bằng:
 *   @CurrentUser('organizationId') organizationId: string
 */
function getOrganizationId(_request: unknown): string {
  // TODO: lấy từ JWT token sau khi Task 1 auth xong
  return "org_default";
}

@Controller("reports")
export class ReportsController {
  /**
   * Constructor — NestJS DI tự inject ReportService.
   * Sử dụng `private readonly` để đảm bảo service không bị ghi đè.
   */
  constructor(private readonly reportService: ReportService) {}

  // ════════════════════════════════════════════════════════════════════════════
  // P&L REPORT
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * GET /reports/pnl
   *
   * Trả về P&L report cho khoảng thời gian được chỉ định.
   *
   * Query params:
   *   dateFrom             - Ngày bắt đầu (YYYY-MM-DD)
   *   dateTo               - Ngày kết thúc (YYYY-MM-DD)
   *   currency             - Mã tiền tệ (default: VND)
   *   compareWithPrevious  - So sánh với kỳ trước (default: false)
   *
   * Response: { data: PnlReport, success: true }
   *
   * Ví dụ:
   *   GET /reports/pnl?dateFrom=2026-01-01&dateTo=2026-01-31&currency=VND
   */
  @Get("pnl")
  async getPnlReport(
    @Query() query: PnlQueryDto,
    @Res({ passthrough: true }) _res: Response
  ): Promise<{ data: PnlReport; success: true }> {
    const orgId = getOrganizationId(null);

    // Parse và validate dates
    const dateFrom = parseDate(query.dateFrom, "dateFrom");
    const dateTo = parseDate(query.dateTo, "dateTo");

    // Validate: dateFrom phải trước dateTo
    if (dateFrom > dateTo) {
      throw new Error("dateFrom must be before dateTo");
    }

    const report = await this.reportService.getPnlReport(
      orgId,
      dateFrom,
      dateTo,
      query.currency ?? "VND",
      query.compareWithPrevious ?? false
    );

    return { data: report, success: true };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CASH FLOW REPORT
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * GET /reports/cash-flow
   *
   * Trả về Cash Flow report cho khoảng thời gian được chỉ định.
   *
   * Query params:
   *   dateFrom             - Ngày bắt đầu (YYYY-MM-DD)
   *   dateTo               - Ngày kết thúc (YYYY-MM-DD)
   *   currency             - Mã tiền tệ (default: VND)
   *   compareWithPrevious  - So sánh với kỳ trước (default: false)
   *
   * Response: { data: CashFlowReport, success: true }
   */
  @Get("cash-flow")
  async getCashFlowReport(
    @Query() query: CashFlowQueryDto,
    @Res({ passthrough: true }) _res: Response
  ): Promise<{ data: CashFlowReport; success: true }> {
    const orgId = getOrganizationId(null);

    const dateFrom = parseDate(query.dateFrom, "dateFrom");
    const dateTo = parseDate(query.dateTo, "dateTo");

    if (dateFrom > dateTo) {
      throw new Error("dateFrom must be before dateTo");
    }

    const report = await this.reportService.getCashFlowReport(
      orgId,
      dateFrom,
      dateTo,
      query.currency ?? "VND",
      query.compareWithPrevious ?? false
    );

    return { data: report, success: true };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BALANCE SHEET
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * GET /reports/balance-sheet
   *
   * Trả về Balance Sheet report tại một thời điểm.
   *
   * Query params:
   *   asOfDate             - Ngày đối soát (YYYY-MM-DD, default: hôm nay)
   *   currency             - Mã tiền tệ (default: VND)
   *   compareWithPrevious  - So sánh với cùng kỳ năm trước (default: false)
   *
   * Response: { data: BalanceSheetReport, success: true }
   */
  @Get("balance-sheet")
  async getBalanceSheetReport(
    @Query() query: BalanceSheetQueryDto,
    @Res({ passthrough: true }) _res: Response
  ): Promise<{ data: BalanceSheetReport; success: true }> {
    const orgId = getOrganizationId(null);

    // asOfDate mặc định = hôm nay nếu không truyền
    const asOfDate = query.asOfDate
      ? parseDate(query.asOfDate, "asOfDate")
      : new Date();

    const report = await this.reportService.getBalanceSheetReport(
      orgId,
      asOfDate,
      query.currency ?? "VND",
      query.compareWithPrevious ?? false
    );

    return { data: report, success: true };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EXPORT
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * GET /reports/export/:type
   *
   * Xuất báo cáo ra định dạng CSV, PDF, hoặc JSON.
   *
   * Params:
   *   type - "pnl" | "cash-flow" | "balance-sheet"
   *
   * Query params:
   *   dateFrom / asOfDate  - Thời gian báo cáo
   *   format               - "csv" | "pdf" | "json" (default: csv)
   *   currency             - Mã tiền tệ
   *
   * Response:
   *   CSV/PDF: Content-Disposition attachment → browser download
   *   JSON:   Content-Type application/json → API response
   *
   * Cách xử lý:
   *   CSV/PDF: Gọi report API, convert sang format, set headers, stream về client
   *   JSON:    Trả trực tiếp JSON response
   */
  @Get("export/:type")
  async exportReport(
    @Param("type") type: "pnl" | "cash-flow" | "balance-sheet",
    @Query("format") format: ReportFormat = "csv",
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("asOfDate") asOfDate?: string,
    @Query("currency") currency?: string,
    @Res({ passthrough: true }) res?: Response
  ): Promise<void> {
    const orgId = getOrganizationId(null);

    /**
     * Bước 1: Lấy report data dựa trên type.
     */
    let reportData: PnlReport | CashFlowReport | BalanceSheetReport;

    if (type === "pnl") {
      const from = parseDate(dateFrom, "dateFrom");
      const to = parseDate(dateTo, "dateTo");
      const report = await this.reportService.getPnlReport(
        orgId,
        from,
        to,
        currency ?? "VND",
        false
      );
      reportData = report;
    } else if (type === "cash-flow") {
      const from = parseDate(dateFrom, "dateFrom");
      const to = parseDate(dateTo, "dateTo");
      const report = await this.reportService.getCashFlowReport(
        orgId,
        from,
        to,
        currency ?? "VND",
        false
      );
      reportData = report;
    } else {
      const asOf = asOfDate ? parseDate(asOfDate, "asOfDate") : new Date();
      const report = await this.reportService.getBalanceSheetReport(
        orgId,
        asOf,
        currency ?? "VND",
        false
      );
      reportData = report;
    }

    /**
     * Bước 2: Format response theo format type.
     */
    if (format === "json") {
      // JSON: trả trực tiếp
      res!.setHeader("Content-Type", "application/json");
      res!.setHeader(
        "Content-Disposition",
        `attachment; filename="${type}-report.json"`
      );
      res!.json(reportData);
      return;
    }

    if (format === "csv") {
      // CSV: generate CSV string và stream về client
      const csv = this.generateCsv(reportData, type);
      res!.setHeader("Content-Type", "text/csv");
      res!.setHeader(
        "Content-Disposition",
        `attachment; filename="${type}-report.csv"`
      );
      res!.send(csv);
      return;
    }

    if (format === "pdf") {
      // PDF: mở cửa sổ print mới (browser print dialog)
      // Backend không generate PDF thực sự — frontend handle bằng window.print()
      res!.setHeader("Content-Type", "text/html");
      res!.send(
        `<html><body><pre>${JSON.stringify(reportData, null, 2)}</pre></body></html>`
      );
      return;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SCHEDULED REPORTS CRUD
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * GET /reports/scheduled
   *
   * Trả về danh sách scheduled reports của tổ chức.
   * Hiện tại: TODO — cần implement ScheduledReport model trong Prisma.
   */
  @Get("scheduled")
  async getScheduledReports(): Promise<{ data: unknown[]; success: true }> {
    const orgId = getOrganizationId(null);
    // TODO: query ScheduledReport model from DB
    void orgId;
    return { data: [], success: true };
  }

  /**
   * POST /reports/scheduled
   *
   * Tạo một scheduled report mới.
   *
   * Body: CreateScheduledReportDto
   * Response: { data: { id: string }, success: true }
   */
  @Post("scheduled")
  @HttpCode(HttpStatus.CREATED)
  async createScheduledReport(
    @Body() dto: CreateScheduledReportDto
  ): Promise<{ data: { id: string }; success: true }> {
    const orgId = getOrganizationId(null);
    void orgId;
    void dto;
    // TODO: insert into ScheduledReport model
    return { data: { id: "scheduled_new_id" }, success: true };
  }

  /**
   * PATCH /reports/scheduled/:id
   *
   * Cập nhật scheduled report.
   *
   * Body: UpdateScheduledReportDto (tất cả fields đều optional)
   * Response: { data: { id: string }, success: true }
   */
  @Patch("scheduled/:id")
  async updateScheduledReport(
    @Param("id") id: string,
    @Body() dto: UpdateScheduledReportDto
  ): Promise<{ data: { id: string }; success: true }> {
    void id;
    void dto;
    // TODO: update ScheduledReport model
    return { data: { id }, success: true };
  }

  /**
   * DELETE /reports/scheduled/:id
   *
   * Xóa scheduled report.
   *
   * Response: { success: true }
   */
  @Delete("scheduled/:id")
  @HttpCode(HttpStatus.OK)
  async deleteScheduledReport(
    @Param("id") id: string
  ): Promise<{ success: true }> {
    void id;
    // TODO: delete from ScheduledReport model (soft delete)
    return { success: true };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS — CSV GENERATION
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Generate CSV string từ report data.
   *
   * @param report - P&L, CashFlow, hoặc BalanceSheet report
   * @param type  - Loại báo cáo để format header phù hợp
   *
   * Quy tắc CSV:
   *   - Escape values chứa dấu phẩy, quotes, hoặc newlines
   *   - Wrap string values trong double quotes
   *   - Phân cách cột bằng dấu phẩy
   */
  private generateCsv(
    report: PnlReport | CashFlowReport | BalanceSheetReport,
    type: "pnl" | "cash-flow" | "balance-sheet"
  ): string {
    const lines: string[] = [];

    if (type === "pnl") {
      const pnl = report as PnlReport;
      lines.push("P&L Report");
      lines.push(`Period,${pnl.period.label}`);
      lines.push(`Currency,${pnl.currency}`);
      lines.push("");
      lines.push("Account Code,Account Name,Section,Amount");

      // Revenue
      for (const item of pnl.revenue) {
        lines.push(
          `${item.accountCode},${item.accountName},${item.section},${item.amount}`
        );
      }

      lines.push("");
      lines.push(
        `Gross Profit,,,${pnl.grossProfit.amount} (${pnl.grossProfit.margin})`
      );

      // Operating Expenses
      for (const item of pnl.operatingExpenses) {
        lines.push(
          `${item.accountCode},${item.accountName},${item.section},${item.amount}`
        );
      }

      lines.push("");
      lines.push(
        `Operating Profit,,,${pnl.operatingProfit.amount} (${pnl.operatingProfit.margin})`
      );
      lines.push(
        `Net Profit,,,${pnl.netProfit.amount} (${pnl.netProfit.margin})`
      );
    } else if (type === "cash-flow") {
      const cf = report as CashFlowReport;
      lines.push("Cash Flow Report");
      lines.push(`Period,${cf.period.label}`);
      lines.push(`Currency,${cf.currency}`);
      lines.push("");
      lines.push(`Opening Balance,,,${cf.openingBalance}`);
      lines.push("");

      lines.push("Operating Activities");
      lines.push("Reference,Description,Inflow,Outflow");
      for (const item of cf.operatingActivities.items) {
        lines.push(
          `${item.reference},${item.description ?? ""},${item.inflow},${item.outflow}`
        );
      }
      lines.push(
        `Total,,,,${cf.operatingActivities.totalInflow},${cf.operatingActivities.totalOutflow}`
      );

      lines.push("");
      lines.push(`Closing Balance,,,${cf.closingBalance}`);
      lines.push(`Net Change,,,${cf.netChange}`);
    } else {
      const bs = report as BalanceSheetReport;
      lines.push("Balance Sheet Report");
      lines.push(`As of,${bs.asOfDate}`);
      lines.push(`Currency,${bs.currency}`);
      lines.push("");
      lines.push("ASSETS");
      lines.push("Account Code,Account Name,Amount");

      for (const item of bs.assets.items) {
        lines.push(`${item.accountCode},${item.accountName},${item.amount}`);
        if (item.children) {
          for (const child of item.children) {
            lines.push(
              `  ${child.accountCode},${child.accountName},${child.amount}`
            );
          }
        }
      }
      lines.push(`Total Assets,,,${bs.assets.total}`);

      lines.push("");
      lines.push("LIABILITIES");
      for (const item of bs.liabilities.items) {
        lines.push(`${item.accountCode},${item.accountName},${item.amount}`);
      }
      lines.push(`Total Liabilities,,,${bs.liabilities.total}`);

      lines.push("");
      lines.push("EQUITY");
      for (const item of bs.equity.items) {
        lines.push(`${item.accountCode},${item.accountName},${item.amount}`);
      }
      lines.push(`Total Equity,,,${bs.equity.total}`);

      lines.push("");
      lines.push(
        `Validation,Balanced=${bs.validation.isBalanced},Difference,${bs.validation.difference}`
      );
    }

    // Escape CSV values: wrap in quotes if contains comma, quote, or newline
    return lines
      .map((line) => {
        const cells = line.split(",");
        return cells
          .map((cell) => {
            if (
              cell.includes(",") ||
              cell.includes('"') ||
              cell.includes("\n")
            ) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(",");
      })
      .join("\n");
  }
}
