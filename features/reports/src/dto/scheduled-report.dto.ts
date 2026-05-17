/**
 * ============================================================================
 * SCHEDULED REPORT DTOs — Validation cho CRUD operations
 * ============================================================================
 *
 * Scheduled Reports cho phép người dùng lên lịch chạy báo cáo tự động.
 * Backend lưu cấu hình vào DB; một worker (scheduled job) sẽ đọc và xử lý.
 *
 * Tần suất:
 *   daily:   mỗi ngày lúc 00:00
 *   weekly:  mỗi thứ 2 hàng tuần
 *   monthly: ngày 1 mỗi tháng
 *   quarterly: ngày 1 tháng 1/4/7/10
 *
 * ============================================================================
 */

import {
  IsEnum,
  IsString,
  IsArray,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
} from "class-validator";

/** Các giá trị hợp lệ cho loại báo cáo định kỳ. */
const REPORT_TYPE_VALUES = ["PNL", "CASH_FLOW", "BALANCE_SHEET"] as const;

/** Các giá trị hợp lệ cho tần suất chạy. */
const FREQUENCY_VALUES = ["daily", "weekly", "monthly", "quarterly"] as const;

/** Các giá trị hợp lệ cho định dạng xuất. */
const FORMAT_VALUES = ["json", "csv", "pdf"] as const;

/**
 * DTO để tạo một scheduled report mới.
 * Tất cả fields đều bắt buộc khi tạo mới.
 */
export class CreateScheduledReportDto {
  /** Tên hiển thị của scheduled report (VD: "Báo cáo P&L tháng 5"). */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /** Loại báo cáo: PNL, CASH_FLOW, hoặc BALANCE_SHEET. */
  @IsEnum(REPORT_TYPE_VALUES)
  type!: (typeof REPORT_TYPE_VALUES)[number];

  /** Tần suất chạy: daily, weekly, monthly, quarterly. */
  @IsEnum(FREQUENCY_VALUES)
  frequency!: (typeof FREQUENCY_VALUES)[number];

  /**
   * Danh sách email nhận báo cáo.
   * ArrayMinSize(1): ít nhất 1 người nhận.
   * ArrayMaxSize(20): tối đa 20 người nhận.
   * @IsEmail: mỗi phần tử phải là email hợp lệ.
   */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsEmail({}, { each: true })
  recipients!: string[];

  /** Định dạng xuất: json, csv, hoặc pdf. */
  @IsEnum(FORMAT_VALUES)
  format!: (typeof FORMAT_VALUES)[number];
}

/**
 * DTO để cập nhật một scheduled report hiện có.
 * Tất cả fields đều optional — chỉ update những fields được truyền.
 */
export class UpdateScheduledReportDto {
  /** Tên mới (hoặc giữ nguyên nếu không truyền). */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  /** Loại báo cáo mới. */
  @IsOptional()
  @IsEnum(REPORT_TYPE_VALUES)
  type?: (typeof REPORT_TYPE_VALUES)[number];

  /** Tần suất mới. */
  @IsOptional()
  @IsEnum(FREQUENCY_VALUES)
  frequency?: (typeof FREQUENCY_VALUES)[number];

  /** Danh sách email mới. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsEmail({}, { each: true })
  recipients?: string[];

  /** Định dạng xuất mới. */
  @IsOptional()
  @IsEnum(FORMAT_VALUES)
  format?: (typeof FORMAT_VALUES)[number];

  /**
   * Bật/tắt scheduled report.
   * Khi isActive = false, worker sẽ bỏ qua report này.
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
