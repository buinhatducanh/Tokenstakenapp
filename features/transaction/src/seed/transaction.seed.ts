// ─────────────────────────────────────────────────────────────
// Seed data cho Task 3 — Transaction, JournalEntry, TransactionApproval
// Chạy sau khi seed chính đã tạo Organization, User, Account
// ─────────────────────────────────────────────────────────────

import {
  PrismaClient,
  TransactionType,
  TransactionStatus,
  ApprovalAction,
} from "@prisma/client";

const prisma = new PrismaClient();

async function seedTransactions() {
  console.log("🌱 Seeding transaction data (Task 3)...\n");

  // ── Lấy org + user + accounts đã có sẵn ────────────────────
  const org = await prisma.organization.findUnique({ where: { slug: "demo-company" } });
  if (!org) {
    console.error("❌ Organization 'demo-company' not found. Run main seed first.");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: "demo@tokens-taken.com" } });
  if (!user) {
    console.error("❌ User 'demo@tokens-taken.com' not found. Run main seed first.");
    return;
  }

  const accounts = await prisma.account.findMany({
    where: { organizationId: org.id },
    orderBy: { code: "asc" },
  });

  const findAccount = (code: string) => {
    const acc = accounts.find((a) => a.code === code);
    if (!acc) throw new Error(`Account ${code} not found`);
    return acc;
  };

  const cashAccount    = findAccount("1000"); // Tiền mặt (ASSET)
  const bankAccount    = findAccount("1100"); // Ngân hàng (ASSET)
  const arAccount      = findAccount("1200"); // Phải thu khách hàng (ASSET)
  const apAccount      = findAccount("2000"); // Phải trả người bán (LIABILITY)
  const revenueAccount = findAccount("4000"); // Doanh thu bán hàng (REVENUE)
  const serviceRevenue = findAccount("4100"); // Doanh thu dịch vụ (REVENUE)
  const cogsAccount    = findAccount("5000"); // Giá vốn hàng bán (EXPENSE)
  const sellingExp     = findAccount("5100"); // Chi phí bán hàng (EXPENSE)

  // ── Xóa dữ liệu cũ (chỉ trong development) ────────────────
  await prisma.transactionApproval.deleteMany({});
  await prisma.journalEntry.deleteMany({});
  await prisma.transaction.deleteMany({ where: { organizationId: org.id } });
  // Reset account balances
  await prisma.account.updateMany({
    where: { organizationId: org.id },
    data: { balance: 0 },
  });
  console.log("🧹 Cleaned existing transaction data.\n");

  // ═══════════════════════════════════════════════════════════
  // TRANSACTION 1: Thu tiền bán hàng (INCOME - APPROVED)
  // Ghi nhận doanh thu 15.000.000₫, khách trả tiền mặt
  // Nợ: 1000 Tiền mặt    15.000.000
  // Có: 4000 Doanh thu    15.000.000
  // ═══════════════════════════════════════════════════════════
  const txn1 = await prisma.transaction.create({
    data: {
      organizationId: org.id,
      reference:      "TXN-2026-000001",
      type:           TransactionType.INCOME,
      status:         TransactionStatus.APPROVED,
      description:    "Thu tiền bán hàng — Hợp đồng ABC-001",
      date:           new Date("2026-05-01T10:00:00Z"),
      amount:         "15000000.0000",
      currency:       "VND",
      approvedAt:     new Date("2026-05-01T14:00:00Z"),
      approvedById:   user.id,
      metadata:       { contract: "ABC-001", customer: "Công ty TNHH Alpha" },
    },
  });
  await prisma.journalEntry.createMany({
    data: [
      { transactionId: txn1.id, accountId: cashAccount.id,    debit: "15000000.0000", credit: "0.0000", description: "Nhận tiền mặt từ khách hàng" },
      { transactionId: txn1.id, accountId: revenueAccount.id, debit: "0.0000",        credit: "15000000.0000", description: "Ghi nhận doanh thu bán hàng" },
    ],
  });
  await prisma.transactionApproval.create({
    data: { transactionId: txn1.id, userId: user.id, action: ApprovalAction.APPROVE, comment: "Đã xác minh hóa đơn" },
  });
  // Update balances
  await prisma.account.update({ where: { id: cashAccount.id },    data: { balance: { increment: 15000000 } } });
  await prisma.account.update({ where: { id: revenueAccount.id }, data: { balance: { increment: 15000000 } } });
  console.log(`✅ TXN-1: Thu tiền bán hàng 15.000.000₫ (APPROVED)`);

  // ═══════════════════════════════════════════════════════════
  // TRANSACTION 2: Chi tiền mua hàng (EXPENSE - APPROVED)
  // Mua nguyên vật liệu 8.500.000₫, trả qua ngân hàng
  // Nợ: 5000 Giá vốn      8.500.000
  // Có: 1100 Ngân hàng     8.500.000
  // ═══════════════════════════════════════════════════════════
  const txn2 = await prisma.transaction.create({
    data: {
      organizationId: org.id,
      reference:      "TXN-2026-000002",
      type:           TransactionType.EXPENSE,
      status:         TransactionStatus.APPROVED,
      description:    "Mua nguyên vật liệu — NCC Beta",
      date:           new Date("2026-05-05T09:30:00Z"),
      amount:         "8500000.0000",
      currency:       "VND",
      approvedAt:     new Date("2026-05-05T11:00:00Z"),
      approvedById:   user.id,
      metadata:       { supplier: "Công ty Beta", poNumber: "PO-2026-042" },
    },
  });
  await prisma.journalEntry.createMany({
    data: [
      { transactionId: txn2.id, accountId: cogsAccount.id, debit: "8500000.0000", credit: "0.0000", description: "Giá vốn nguyên vật liệu" },
      { transactionId: txn2.id, accountId: bankAccount.id, debit: "0.0000",       credit: "8500000.0000", description: "Thanh toán qua ngân hàng" },
    ],
  });
  await prisma.transactionApproval.create({
    data: { transactionId: txn2.id, userId: user.id, action: ApprovalAction.APPROVE, comment: "Đã đối chiếu PO" },
  });
  await prisma.account.update({ where: { id: cogsAccount.id }, data: { balance: { increment: 8500000 } } });
  await prisma.account.update({ where: { id: bankAccount.id }, data: { balance: { decrement: 8500000 } } });
  console.log(`✅ TXN-2: Chi mua hàng 8.500.000₫ (APPROVED)`);

  // ═══════════════════════════════════════════════════════════
  // TRANSACTION 3: Chuyển khoản nội bộ (TRANSFER - APPROVED)
  // Chuyển 5.000.000₫ từ tiền mặt sang ngân hàng
  // Nợ: 1100 Ngân hàng     5.000.000
  // Có: 1000 Tiền mặt      5.000.000
  // ═══════════════════════════════════════════════════════════
  const txn3 = await prisma.transaction.create({
    data: {
      organizationId: org.id,
      reference:      "TXN-2026-000003",
      type:           TransactionType.TRANSFER,
      status:         TransactionStatus.APPROVED,
      description:    "Nộp tiền mặt vào ngân hàng",
      date:           new Date("2026-05-10T08:00:00Z"),
      amount:         "5000000.0000",
      currency:       "VND",
      approvedAt:     new Date("2026-05-10T08:30:00Z"),
      approvedById:   user.id,
    },
  });
  await prisma.journalEntry.createMany({
    data: [
      { transactionId: txn3.id, accountId: bankAccount.id, debit: "5000000.0000", credit: "0.0000", description: "Nhận tiền từ quỹ tiền mặt" },
      { transactionId: txn3.id, accountId: cashAccount.id, debit: "0.0000",       credit: "5000000.0000", description: "Xuất tiền mặt nộp ngân hàng" },
    ],
  });
  await prisma.transactionApproval.create({
    data: { transactionId: txn3.id, userId: user.id, action: ApprovalAction.APPROVE },
  });
  await prisma.account.update({ where: { id: bankAccount.id }, data: { balance: { increment: 5000000 } } });
  await prisma.account.update({ where: { id: cashAccount.id }, data: { balance: { decrement: 5000000 } } });
  console.log(`✅ TXN-3: Chuyển khoản nội bộ 5.000.000₫ (APPROVED)`);

  // ═══════════════════════════════════════════════════════════
  // TRANSACTION 4: Thu tiền dịch vụ tư vấn (INCOME - PENDING)
  // Đang chờ duyệt
  // Nợ: 1200 Phải thu KH   20.000.000
  // Có: 4100 DT dịch vụ    20.000.000
  // ═══════════════════════════════════════════════════════════
  const txn4 = await prisma.transaction.create({
    data: {
      organizationId: org.id,
      reference:      "TXN-2026-000004",
      type:           TransactionType.INCOME,
      status:         TransactionStatus.PENDING,
      description:    "Doanh thu tư vấn — Dự án Gamma-X",
      date:           new Date("2026-05-20T14:00:00Z"),
      amount:         "20000000.0000",
      currency:       "VND",
      metadata:       { project: "Gamma-X", client: "Công ty CP Delta" },
    },
  });
  await prisma.journalEntry.createMany({
    data: [
      { transactionId: txn4.id, accountId: arAccount.id,      debit: "20000000.0000", credit: "0.0000", description: "Ghi nhận công nợ phải thu" },
      { transactionId: txn4.id, accountId: serviceRevenue.id, debit: "0.0000",        credit: "20000000.0000", description: "Doanh thu dịch vụ tư vấn" },
    ],
  });
  await prisma.account.update({ where: { id: arAccount.id },      data: { balance: { increment: 20000000 } } });
  await prisma.account.update({ where: { id: serviceRevenue.id }, data: { balance: { increment: 20000000 } } });
  console.log(`✅ TXN-4: Thu tiền dịch vụ 20.000.000₫ (PENDING — chờ duyệt)`);

  // ═══════════════════════════════════════════════════════════
  // TRANSACTION 5: Chi phí bán hàng (EXPENSE - PENDING)
  // Nợ: 5100 Chi phí bán hàng  3.200.000
  // Có: 1000 Tiền mặt          3.200.000
  // ═══════════════════════════════════════════════════════════
  const txn5 = await prisma.transaction.create({
    data: {
      organizationId: org.id,
      reference:      "TXN-2026-000005",
      type:           TransactionType.EXPENSE,
      status:         TransactionStatus.PENDING,
      description:    "Chi phí quảng cáo Facebook Ads tháng 5",
      date:           new Date("2026-05-22T16:00:00Z"),
      amount:         "3200000.0000",
      currency:       "VND",
    },
  });
  await prisma.journalEntry.createMany({
    data: [
      { transactionId: txn5.id, accountId: sellingExp.id,  debit: "3200000.0000", credit: "0.0000", description: "Chi phí quảng cáo" },
      { transactionId: txn5.id, accountId: cashAccount.id, debit: "0.0000",       credit: "3200000.0000", description: "Chi tiền mặt" },
    ],
  });
  await prisma.account.update({ where: { id: sellingExp.id },  data: { balance: { increment: 3200000 } } });
  await prisma.account.update({ where: { id: cashAccount.id }, data: { balance: { decrement: 3200000 } } });
  console.log(`✅ TXN-5: Chi phí quảng cáo 3.200.000₫ (PENDING — chờ duyệt)`);

  // ═══════════════════════════════════════════════════════════
  // Ghi Audit Log cho tất cả transactions
  // ═══════════════════════════════════════════════════════════
  for (const txn of [txn1, txn2, txn3, txn4, txn5]) {
    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId:         user.id,
        action:         "transaction.create",
        entityType:     "Transaction",
        entityId:       txn.id,
        changes:        { after: { reference: txn.reference, type: txn.type, amount: txn.amount.toString(), status: txn.status } },
      },
    });
  }
  // Audit logs for approvals
  for (const txn of [txn1, txn2, txn3]) {
    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId:         user.id,
        action:         "transaction.approve",
        entityType:     "Transaction",
        entityId:       txn.id,
        changes:        { before: { status: "PENDING" }, after: { status: "APPROVED" } },
      },
    });
  }
  console.log(`✅ Audit logs created for all transactions.\n`);

  // ═══════════════════════════════════════════════════════════
  // Tóm tắt số dư tài khoản sau seed
  // ═══════════════════════════════════════════════════════════
  const finalAccounts = await prisma.account.findMany({
    where: { organizationId: org.id },
    orderBy: { code: "asc" },
  });
  console.log("📊 Số dư tài khoản sau khi seed:");
  console.log("─".repeat(55));
  for (const acc of finalAccounts) {
    const bal = parseFloat(acc.balance.toString());
    if (bal !== 0) {
      console.log(`   ${acc.code} ${acc.name.padEnd(25)} ${bal.toLocaleString("vi-VN").padStart(15)}₫`);
    }
  }
  console.log("─".repeat(55));

  console.log("\n🎉 Transaction seed completed!");
}

seedTransactions()
  .catch((e) => {
    console.error("❌ Transaction seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
