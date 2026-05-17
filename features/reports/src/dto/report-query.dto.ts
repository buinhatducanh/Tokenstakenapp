/**
 * ============================================================================
 * REPORT QUERY DTOs — Validation cho query parameters của báo cáo
 * ============================================================================
 *
 * Dùng class-validator decorators để validate request params.
 * Luôn dùng IsOptional() trước các decorators khác để cho phép
 * partial queries (ví dụ: chỉ truyền dateFrom mà không có dateTo).
 *
 * Transform: @Type(() => Boolean) chuyển string "true"/"false" → boolean
 *            vì query params luôn là string khi gửi qua URL.
 *
 * ============================================================================
 */

import { Type } from "class-transformer";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
} from "class-validator";

// Các giá trị hợp lệ cho ReportPeriod — liệt kê rõ ràng thay vì dùng enum type
// (tránh lỗi TS1240 khi dùng type trong @IsEnum decorator).
const REPORT_PERIOD_VALUES = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom",
] as const;

/**
 * Base DTO cho tất cả report queries.
 * Chứa các fields chung: dateFrom, dateTo, currency, compareWithPrevious.
 */
export class ReportQueryDto {
  /**
   * Chu kỳ báo cáo (daily/weekly/monthly/quarterly/yearly/custom).
   * VD: "monthly" → tự động tính dateFrom/dateTo = tháng hiện tại.
   */
  @IsOptional()
  @IsEnum(REPORT_PERIOD_VALUES)
  period?: (typeof REPORT_PERIOD_VALUES)[number];

  /** Ngày bắt đầu (ISO 8601, VD: "2026-01-01"). */
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  /** Ngày kết thúc (ISO 8601, VD: "2026-01-31"). */
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  /** Mã tiền tệ (VD: "VND", "USD"). Mặc định: "VND". */
  @IsOptional()
  @IsString()
  currency?: string;

  /**
   * So sánh với kỳ trước hay không.
   * @Type(Boolean) transform string "true"/"false" từ query param → boolean.
   */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  compareWithPrevious?: boolean;

  /**
   * Lọc theo account cụ thể (tùy chọn).
   * Khi có accountId, chỉ hiển thị dòng của account đó.
   */
  @IsOptional()
  @IsString()
  accountId?: string;
}

/**
 * DTO cho P&L report query.
 * Thêm filter theo accountType (REVENUE hoặc EXPENSE).
 */
export class PnlQueryDto extends ReportQueryDto {
  /**
   * Lọc chỉ hiển thị REVENUE accounts hoặc EXPENSE accounts.
   * Bỏ trống = hiển thị tất cả.
   */
  @IsOptional()
  @IsString()
  accountType?: "REVENUE" | "EXPENSE";
}

/**
 * DTO cho Cash Flow report query.
 * Cash Flow không có accountType filter — luôn show tất cả categories.
 */
export class CashFlowQueryDto extends ReportQueryDto {
  // Kế thừa toàn bộ fields từ ReportQueryDto.
  // Cash Flow report không cần thêm fields riêng.
}

/**
 * DTO cho Balance Sheet report query.
 * Khác với P&L và Cash Flow: dùng asOfDate thay vì dateFrom/dateTo.
 */
export class BalanceSheetQueryDto {
  /**
   * Ngày đối soát — tất cả approved transactions
   * có date <= asOfDate được tính vào Balance Sheet.
   */
  @IsOptional()
  @IsDateString()
  asOfDate?: string;

  /** Mã tiền tệ. Mặc định: "VND". */
  @IsOptional()
  @IsString()
  currency?: string;

  /** So sánh với cùng kỳ năm trước. */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  compareWithPrevious?: boolean;
}
