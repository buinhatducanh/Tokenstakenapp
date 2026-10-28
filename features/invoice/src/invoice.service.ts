import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import type { CreateInvoiceDTO, UpdateInvoiceDTO, BulkInvoiceAction } from "@packages/shared-types";
import { Prisma } from "@prisma/client";

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  // Helper tự động phân giải hoặc khởi tạo Organization & User mặc định để tránh lỗi khóa ngoại
  private async getOrCreateDefaultOrgAndUser() {
    // 1. Lấy hoặc tạo Organization
    let org = await this.prisma.organization.findFirst({
      where: { slug: "demo-company" },
    });
    
    if (!org) {
      org = await this.prisma.organization.findFirst();
    }

    if (!org) {
      org = await this.prisma.organization.create({
        data: {
          name: "Demo Company",
          slug: "demo-company",
          plan: "FREE",
          settings: { timezone: "Asia/Ho_Chi_Minh", currency: "VND" } as any,
        },
      });
    }

    // 2. Lấy hoặc tạo User
    let user = await this.prisma.user.findFirst({
      where: { email: "demo@tokens-taken.com" },
    });

    if (!user) {
      user = await this.prisma.user.findFirst();
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: "demo@tokens-taken.com",
          displayName: "Demo User",
          locale: "vi",
          timezone: "Asia/Ho_Chi_Minh",
        },
      });

      // Thêm user vào org
      await this.prisma.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: "OWNER",
          joinedAt: new Date(),
        },
      });
    }

    return { orgId: org.id, userId: user.id };
  }

  // 1. Lấy danh sách hóa đơn từ Database thật
  async findAll(organizationId?: string) {
    const { orgId } = await this.getOrCreateDefaultOrgAndUser();
    const queryOrgId = organizationId || orgId;

    return this.prisma.invoice.findMany({
      where: { organizationId: queryOrgId },
      orderBy: { createdAt: "desc" },
    });
  }

  // 2. Lấy chi tiết 1 hóa đơn
  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        attachments: true,
      },
    });
    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn có ID: ${id}`);
    }
    return invoice;
  }

  // 3. Tạo hóa đơn thật trong Postgres
  async create(dto: CreateInvoiceDTO) {
    const { orgId } = await this.getOrCreateDefaultOrgAndUser();

    // Tính toán số tiền tài chính chính xác tuyệt đối
    const subtotalNum = dto.lineItems.reduce((acc, item) => acc + Number(item.amount), 0);
    const taxRateNum = Number(dto.taxRate || "0");
    const taxAmountNum = Math.round(subtotalNum * taxRateNum);
    const totalNum = subtotalNum + taxAmountNum;

    // Chuyển sang dạng Prisma.Decimal để ghi xuống Postgres
    const subtotal = new Prisma.Decimal(subtotalNum);
    const taxRate = new Prisma.Decimal(taxRateNum);
    const taxAmount = new Prisma.Decimal(taxAmountNum);
    const total = new Prisma.Decimal(totalNum);

    const invoiceNumber = dto.senderName.substring(0, 3).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000);

    return this.prisma.invoice.create({
      data: {
        organizationId: orgId,
        invoiceNumber: invoiceNumber,
        type: dto.type,
        status: "PENDING_APPROVAL", // Trực tiếp chuyển chờ duyệt
        senderName: dto.senderName,
        senderTaxCode: dto.senderTaxCode || null,
        senderAddress: dto.senderAddress || null,
        receiverName: dto.receiverName,
        receiverTaxCode: dto.receiverTaxCode || null,
        receiverAddress: dto.receiverAddress || null,
        subtotal,
        taxRate,
        taxAmount,
        total,
        currency: "VND",
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        lineItems: dto.lineItems as any,
        notes: dto.notes || null,
        sourceFileUrl: dto.sourceFileUrl || null,
      },
    });
  }

  // 4. Cập nhật hóa đơn và tính toán lại số tiền tự động
  async update(id: string, dto: UpdateInvoiceDTO) {
    const invoice = await this.findOne(id);

    const updateData: Prisma.InvoiceUpdateInput = {};

    if (dto.senderName) updateData.senderName = dto.senderName;
    if (dto.senderTaxCode !== undefined) updateData.senderTaxCode = dto.senderTaxCode;
    if (dto.senderAddress !== undefined) updateData.senderAddress = dto.senderAddress;
    if (dto.receiverName) updateData.receiverName = dto.receiverName;
    if (dto.receiverTaxCode !== undefined) updateData.receiverTaxCode = dto.receiverTaxCode;
    if (dto.receiverAddress !== undefined) updateData.receiverAddress = dto.receiverAddress;
    if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate);
    if (dto.type) updateData.type = dto.type;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    // Nếu cập nhật dòng hàng -> tự tính toán lại tiền
    if (dto.lineItems) {
      const subtotalNum = dto.lineItems.reduce((acc, item) => acc + Number(item.amount), 0);
      const taxRateNum = Number(dto.taxRate || invoice.taxRate.toString());
      const taxAmountNum = Math.round(subtotalNum * taxRateNum);
      const totalNum = subtotalNum + taxAmountNum;

      updateData.lineItems = dto.lineItems as any;
      updateData.subtotal = new Prisma.Decimal(subtotalNum);
      updateData.taxRate = new Prisma.Decimal(taxRateNum);
      updateData.taxAmount = new Prisma.Decimal(taxAmountNum);
      updateData.total = new Prisma.Decimal(totalNum);
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
    });
  }

  // 5. Phê duyệt hóa đơn thật với Transaction Safety Pattern & Audit Log
  async approve(id: string, userIdInput?: string) {
    const { userId } = await this.getOrCreateDefaultOrgAndUser();
    const finalUserId = userIdInput || userId;

    return this.prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findUnique({
          where: { id },
        });

        if (!invoice) {
          throw new NotFoundException(`Không tìm thấy hóa đơn: ${id}`);
        }

        // 1. Cập nhật trạng thái hóa đơn
        const updatedInvoice = await tx.invoice.update({
          where: { id },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
            approvedById: finalUserId,
          },
        });

        // 2. Ghi Audit Log vào database
        await tx.auditLog.create({
          data: {
            organizationId: invoice.organizationId,
            userId: finalUserId,
            action: "invoice.approve",
            entityType: "Invoice",
            entityId: id,
            changes: {
              status: { from: invoice.status, to: "APPROVED" },
            } as any,
          },
        });

        return updatedInvoice;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000,
      }
    );
  }

  // 6. Xử lý tác vụ hàng loạt trên Postgres thật
  async bulkAction(dto: BulkInvoiceAction) {
    const { userId } = await this.getOrCreateDefaultOrgAndUser();
    const nextStatus =
      dto.action === "approve"
        ? "APPROVED"
        : dto.action === "reject"
        ? "REJECTED"
        : dto.action === "cancel"
        ? "CANCELLED"
        : "PUBLISHED";

    return this.prisma.$transaction(async (tx) => {
      const updatedInvoices = [];

      for (const id of dto.invoiceIds) {
        const invoice = await tx.invoice.findUnique({ where: { id } });
        if (!invoice) continue;

        const updated = await tx.invoice.update({
          where: { id },
          data: {
            status: nextStatus as any,
            approvedAt: nextStatus === "APPROVED" ? new Date() : invoice.approvedAt,
            approvedById: nextStatus === "APPROVED" ? userId : invoice.approvedById,
          },
        });

        // Ghi Audit Log cho từng hóa đơn được duyệt hàng loạt
        await tx.auditLog.create({
          data: {
            organizationId: invoice.organizationId,
            userId: userId,
            action: `invoice.bulk_${dto.action}`,
            entityType: "Invoice",
            entityId: id,
            changes: { status: { from: invoice.status, to: nextStatus } } as any,
          },
        });

        updatedInvoices.push(updated);
      }

      return updatedInvoices;
    });
  }

  // 7. Xóa hóa đơn thật khỏi Postgres
  async delete(id: string) {
    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}
