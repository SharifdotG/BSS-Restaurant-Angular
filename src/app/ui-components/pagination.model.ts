export interface PaginatedResponse<T> {
  pageNumber: number;
  current_page: number;
  per_page: number;
  pageSize: number;
  firstPage: string;
  lastPage: string;
  last_page: number;
  totalPages: number;
  totalRecords: number;
  total: number;
  from: number;
  to: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  data: T[];
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  search?: string;
}