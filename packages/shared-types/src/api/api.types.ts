// Generic API types

export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ApiError = {
  code: string;
  message: string;
  statusCode: number;
  metadata?: Record<string, unknown>;
};

export type PaginationQuery = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type FilterQuery = {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};
