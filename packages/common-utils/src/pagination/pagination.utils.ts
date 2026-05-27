// Pagination utilities

export type PaginationOptions = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; pagination: PaginationOptions } {
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);
  return {
    items: paged,
    pagination: {
      page,
      pageSize,
      total: items.length,
      totalPages: Math.ceil(items.length / pageSize),
    },
  };
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
) {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
