// packages/db/prisma/seed.ts
// Seed data cho development và test
// Chạy: pnpm db:seed

import { PrismaClient, Plan, OrgRole, AccountType, InvoiceType, InvoiceStatus, TransactionType, TransactionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Tạo Organization mặc định
  const org = await prisma.organization.upsert({
    where: { slug: "demo-company" },
    update: {},
    create: {
      name: "Demo Company",
      slug: "demo-company",
      plan: Plan.FREE,
      settings: { timezone: "Asia/Ho_Chi_Minh", currency: "VND" },
    },
  });
  console.log(`✅ Organization: ${org.name}`);

  // 2. Tạo User mặc định
  const user = await prisma.user.upsert({
    where: { email: "demo@tokens-taken.com" },
    update: {},
    create: {
      email: "demo@tokens-taken.com",
      displayName: "Demo User",
      locale: "vi",
      timezone: "Asia/Ho_Chi_Minh",
    },
  });
  console.log(`✅ User: ${user.email}`);

  // 3. Thêm user vào organization
  await prisma.organizationMember.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      role: OrgRole.OWNER,
      joinedAt: new Date(),
    },
  });

  // 4. Tạo Chart of Accounts mặc định
  const defaultAccounts = [
    { code: "1000", name: "Tiền mặt",        type: AccountType.ASSET,    isSystem: true },
    { code: "1100", name: "Ngân hàng",        type: AccountType.ASSET,    isSystem: true },
    { code: "1200", name: "Phải thu khách hàng", type: AccountType.ASSET, isSystem: true },
    { code: "2000", name: "Phải trả người bán", type: AccountType.LIABILITY, isSystem: true },
    { code: "2100", name: "Vay ngắn hạn",     type: AccountType.LIABILITY, isSystem: true },
    { code: "3000", name: "Vốn chủ sở hữu",   type: AccountType.EQUITY,   isSystem: true },
    { code: "4000", name: "Doanh thu bán hàng", type: AccountType.REVENUE, isSystem: true },
    { code: "4100", name: "Doanh thu dịch vụ", type: AccountType.REVENUE,  isSystem: true },
    { code: "5000", name: "Giá vốn hàng bán", type: AccountType.EXPENSE,  isSystem: true },
    { code: "5100", name: "Chi phí bán hàng", type: AccountType.EXPENSE,   isSystem: true },
    { code: "5200", name: "Chi phí quản lý", type: AccountType.EXPENSE,   isSystem: true },
  ];

  for (const acc of defaultAccounts) {
    await prisma.account.upsert({
      where: { organizationId_code: { organizationId: org.id, code: acc.code } },
      update: {},
      create: { ...acc, organizationId: org.id },
    });
  }
  console.log(`✅ ${defaultAccounts.length} default accounts created`);

  // 5. Tạo sample invoice
  const invoice = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      invoiceNumber: "INV-2026-000001",
      type: InvoiceType.SALE,
      status: InvoiceStatus.PENDING_APPROVAL,
      senderName: "Demo Company",
      senderTaxCode: "0123456789",
      receiverName: "Acme Corp",
      receiverTaxCode: "9876543210",
      subtotal: "10000000.0000",
      taxRate: "0.1000",
      taxAmount: "1000000.0000",
      total: "11000000.0000",
      currency: "VND",
      lineItems: [
        { description: "Dịch vụ tư vấn tài chính", quantity: 10, unitPrice: "1000000.00", amount: "10000000.00" },
      ],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`✅ Sample invoice: ${invoice.invoiceNumber}`);

  console.log("\n🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
