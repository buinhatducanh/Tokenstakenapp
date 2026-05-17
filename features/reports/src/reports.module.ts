/**
 * ============================================================================
 * REPORTS MODULE — NestJS Dependency Injection configuration
 * ============================================================================
 *
 * Task 6: Reports Feature
 *
 * NestJS Module structure:
 *   ReportsModule
 *   ├── ReportService      (providers: business logic)
 *   └── ReportsController  (controllers: REST endpoints)
 *
 * imports: [] — hiện tại module không phụ thuộc module khác
 * exports: [ReportService] — cho phép các module khác inject ReportService
 *
 * ============================================================================
 */

import { Module } from "@nestjs/common";

// Service và Controller — được inject vào module
import { ReportService } from "./reports.service";
import { ReportsController } from "./reports.controller";

@Module({
  /**
   * Controllers: đăng ký REST endpoints.
   * NestJS tự tạo dependency graph và inject ReportService vào controller.
   */
  controllers: [ReportsController],

  /**
   * Providers: đăng ký services/components có thể inject.
   * ReportService được tạo với `new ReportService(prisma)`.
   * NestJS quản lý lifecycle (singleton theo mặc định).
   */
  providers: [ReportService],

  /**
   * Exports: cho phép các module khác import ReportService.
   * Dùng khi apps/backend muốn inject ReportService vào module khác.
   */
  exports: [ReportService],
})
export class ReportsModule {}
