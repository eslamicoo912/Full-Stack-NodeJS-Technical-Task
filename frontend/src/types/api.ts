// Shared API response shapes (mirror backend shared/utils/api-features.ts)

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Error body returned by the backend global error handler
export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: FieldError[];
}

// Query params accepted by paginated list endpoints
export interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  [key: string]: string | number | undefined;
}
