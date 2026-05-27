// ─────────────────────────────────────────────────────────────
// AccountService — CRUD + hierarchy for Chart of Accounts
// Owned by Task 3.  Do NOT import from other feature packages.
// ─────────────────────────────────────────────────────────────

import { PrismaClient, Prisma, AccountType } from "@prisma/client";
import type {
  CreateAccountDTO,
  UpdateAccountDTO,
  AccountQuery,
  Account as AccountView,
} from "@tokens-taken/shared-types";

// ─── helpers ──────────────────────────────────────────────────

function toView(row: any): AccountView {
  return {
    id:             row.id,
    organizationId: row.organizationId,
    code:           row.code,
    name:           row.name,
    type:           row.type,
    currency:       row.currency,
    balance:        row.balance.toString(),
    isActive:       row.isActive,
    isSystem:       row.isSystem,
    parentId:       row.parentId,
    createdAt:      row.createdAt?.toISOString?.() ?? row.createdAt,
    updatedAt:      row.updatedAt?.toISOString?.() ?? row.updatedAt,
  };
}

// ─── service class ────────────────────────────────────────────

export class AccountService {
  constructor(private prisma: PrismaClient) {}

  // ── List / query ────────────────────────────────────────────
  async list(organizationId: string, query?: AccountQuery): Promise<AccountView[]> {
    const where: Prisma.AccountWhereInput = { organizationId };

    if (query?.type) where.type = query.type as AccountType;
    if (query?.isActive !== undefined) where.isActive = query.isActive;
    if (query?.search) {
      where.OR = [
        { code: { contains: query.search, mode: "insensitive" } },
        { name: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const rows = await this.prisma.account.findMany({
      where,
      orderBy: { code: "asc" },
    });

    return rows.map(toView);
  }

  // ── Get single ──────────────────────────────────────────────
  async getById(id: string): Promise<AccountView | null> {
    const row = await this.prisma.account.findUnique({ where: { id } });
    return row ? toView(row) : null;
  }

  // ── Get by code (within org) ────────────────────────────────
  async getByCode(organizationId: string, code: string): Promise<AccountView | null> {
    const row = await this.prisma.account.findUnique({
      where: { organizationId_code: { organizationId, code } },
    });
    return row ? toView(row) : null;
  }

  // ── Create ──────────────────────────────────────────────────
  async create(organizationId: string, dto: CreateAccountDTO): Promise<AccountView> {
    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.prisma.account.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new Error(`Parent account not found: ${dto.parentId}`);
      if (parent.organizationId !== organizationId) {
        throw new Error("Parent account belongs to a different organization");
      }
    }

    // Check code uniqueness (Prisma @@unique will also enforce this)
    const existing = await this.prisma.account.findUnique({
      where: { organizationId_code: { organizationId, code: dto.code } },
    });
    if (existing) throw new Error(`Account code already exists: ${dto.code}`);

    const row = await this.prisma.account.create({
      data: {
        organizationId,
        code:     dto.code,
        name:     dto.name,
        type:     dto.type as AccountType,
        currency: dto.currency ?? "VND",
        parentId: dto.parentId ?? null,
        isSystem: dto.isSystem ?? false,
      },
    });

    return toView(row);
  }

  // ── Update ──────────────────────────────────────────────────
  async update(id: string, dto: UpdateAccountDTO): Promise<AccountView> {
    const existing = await this.prisma.account.findUnique({ where: { id } });
    if (!existing) throw new Error(`Account not found: ${id}`);

    // System accounts can only update name
    if (existing.isSystem && (dto.isActive === false)) {
      throw new Error("Cannot deactivate a system account");
    }

    const row = await this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.name     !== undefined ? { name:     dto.name }     : {}),
        ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    return toView(row);
  }

  // ── Get hierarchy (tree) ────────────────────────────────────
  async getTree(organizationId: string): Promise<AccountView[]> {
    const rows = await this.prisma.account.findMany({
      where: { organizationId, isActive: true },
      orderBy: { code: "asc" },
      include: { children: true },
    });
    return rows.map(toView);
  }

  // ── Get balance for a single account ────────────────────────
  async getBalance(id: string): Promise<string> {
    const row = await this.prisma.account.findUnique({
      where: { id },
      select: { balance: true },
    });
    if (!row) throw new Error(`Account not found: ${id}`);
    return row.balance.toString();
  }
}
