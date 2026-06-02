import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import type { CreateInvoiceDTO, UpdateInvoiceDTO, BulkInvoiceAction } from "@packages/shared-types";

@Controller("api/invoices")
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async findAll(@Query("organizationId") organizationId?: string) {
    return this.invoiceService.findAll(organizationId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.invoiceService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateInvoiceDTO) {
    return this.invoiceService.create(dto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateInvoiceDTO) {
    return this.invoiceService.update(id, dto);
  }

  @Post(":id/approve")
  async approve(@Param("id") id: string, @Body("userId") userId?: string) {
    return this.invoiceService.approve(id, userId);
  }

  @Post("bulk-action")
  async bulkAction(@Body() dto: BulkInvoiceAction) {
    return this.invoiceService.bulkAction(dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.invoiceService.delete(id);
  }
}
