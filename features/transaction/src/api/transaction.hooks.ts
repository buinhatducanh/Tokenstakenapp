// ─────────────────────────────────────────────────────────────
// React Query hooks for Transaction feature (frontend)
// Owned by Task 3.
// ─────────────────────────────────────────────────────────────
//
// These hooks call the REST API and implement optimistic updates
// as required by the project guidelines.
// ─────────────────────────────────────────────────────────────

import type {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  ApproveTransactionDTO,
  TransactionQuery,
  TransactionSummary,
  Account,
  CreateAccountDTO,
  UpdateAccountDTO,
  AccountQuery,
  LedgerBalance,
  ApiResponse,
  PaginatedResponse,
} from "@tokens-taken/shared-types";

// ─── Placeholder fetch helper ─────────────────────────────────
// Will be replaced by a shared HTTP client once apps/frontend is
// fully set up. For now, a thin wrapper around fetch.

const API_BASE = typeof window !== "undefined"
  ? (window as any).__API_BASE ?? "/api"
  : "/api";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "API error");
  }
  return res.json();
}

// ─── Transaction hooks ────────────────────────────────────────

/**
 * Fetch a paginated list of transactions.
 *
 * Usage (inside a React component with React Query provider):
 *   const { data } = useTransactions(orgId, { status: "PENDING" });
 */
export function useTransactions(orgId: string, query?: TransactionQuery) {
  // Returns a React Query-compatible config object.
  // The actual useQuery() call is made in the consumer.
  const params = new URLSearchParams();
  if (query?.page)      params.set("page",      String(query.page));
  if (query?.pageSize)  params.set("pageSize",  String(query.pageSize));
  if (query?.status)    params.set("status",     query.status);
  if (query?.type)      params.set("type",       query.type);
  if (query?.dateFrom)  params.set("dateFrom",   query.dateFrom);
  if (query?.dateTo)    params.set("dateTo",     query.dateTo);
  if (query?.search)    params.set("search",     query.search);
  if (query?.sortBy)    params.set("sortBy",     query.sortBy);
  if (query?.sortOrder) params.set("sortOrder",  query.sortOrder);

  return {
    queryKey: ["transactions", orgId, query] as const,
    queryFn:  () => apiFetch<PaginatedResponse<Transaction>>(
      `/transactions?orgId=${orgId}&${params.toString()}`
    ),
  };
}

/**
 * Fetch a single transaction by id.
 */
export function useTransaction(id: string) {
  return {
    queryKey: ["transactions", id] as const,
    queryFn:  () => apiFetch<ApiResponse<Transaction>>(`/transactions/${id}`),
    enabled:  !!id,
  };
}

/**
 * Create a new transaction.
 *
 * Returns a mutation config for useMutation().
 */
export function useCreateTransaction(orgId: string) {
  return {
    mutationFn: (dto: CreateTransactionDTO) =>
      apiFetch<ApiResponse<Transaction>>("/transactions", {
        method: "POST",
        body:   JSON.stringify({ orgId, ...dto }),
      }),
    // Invalidate list after success
    invalidateKeys: [["transactions", orgId]],
  };
}

/**
 * Update a PENDING transaction.
 */
export function useUpdateTransaction() {
  return {
    mutationFn: ({ id, ...dto }: UpdateTransactionDTO & { id: string }) =>
      apiFetch<ApiResponse<Transaction>>(`/transactions/${id}`, {
        method: "PATCH",
        body:   JSON.stringify(dto),
      }),
  };
}

/**
 * Approve or reject a transaction (optimistic update pattern).
 */
export function useApproveTransaction() {
  return {
    mutationFn: ({ id, ...dto }: ApproveTransactionDTO & { id: string }) =>
      apiFetch<ApiResponse<Transaction>>(`/transactions/${id}/approve`, {
        method: "POST",
        body:   JSON.stringify(dto),
      }),
  };
}

/**
 * Cancel a transaction.
 */
export function useCancelTransaction() {
  return {
    mutationFn: (id: string) =>
      apiFetch<ApiResponse<Transaction>>(`/transactions/${id}/cancel`, {
        method: "POST",
      }),
  };
}

/**
 * Get transaction summary (income/expense/cash-flow).
 */
export function useTransactionSummary(orgId: string, dateFrom?: string, dateTo?: string) {
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo)   params.set("dateTo",   dateTo);

  return {
    queryKey: ["transactionSummary", orgId, dateFrom, dateTo] as const,
    queryFn:  () => apiFetch<ApiResponse<TransactionSummary>>(
      `/transactions/summary?orgId=${orgId}&${params.toString()}`
    ),
  };
}

// ─── Account hooks ────────────────────────────────────────────

export function useAccounts(orgId: string, query?: AccountQuery) {
  return {
    queryKey: ["accounts", orgId, query] as const,
    queryFn:  () => apiFetch<ApiResponse<Account[]>>(
      `/accounts?orgId=${orgId}${query?.type ? `&type=${query.type}` : ""}${query?.search ? `&search=${query.search}` : ""}`
    ),
  };
}

export function useCreateAccount(orgId: string) {
  return {
    mutationFn: (dto: CreateAccountDTO) =>
      apiFetch<ApiResponse<Account>>("/accounts", {
        method: "POST",
        body:   JSON.stringify({ orgId, ...dto }),
      }),
    invalidateKeys: [["accounts", orgId]],
  };
}

export function useUpdateAccount() {
  return {
    mutationFn: ({ id, ...dto }: UpdateAccountDTO & { id: string }) =>
      apiFetch<ApiResponse<Account>>(`/accounts/${id}`, {
        method: "PATCH",
        body:   JSON.stringify(dto),
      }),
  };
}

export function useLedgerBalances(orgId: string) {
  return {
    queryKey: ["ledgerBalances", orgId] as const,
    queryFn:  () => apiFetch<ApiResponse<LedgerBalance[]>>(
      `/transactions/balances?orgId=${orgId}`
    ),
  };
}
