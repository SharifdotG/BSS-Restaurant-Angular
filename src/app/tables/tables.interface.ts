export interface TableListResponse {
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
  data: Table[];
}

export interface Table {
  id: number;
  tableNumber: string;
  numberOfSeats: number;
  isOccupied: boolean;
  image: string;
  employees: TableEmployee[];
}

export interface TableEmployee {
  employeeTableId: number;
  employeeId: string;
  name: string;
}

export interface CreateTableRequest {
  tableNumber: string;
  numberOfSeats: string;
  image?: string;
  base64?: string;
}

export interface UpdateTableRequest extends CreateTableRequest {
  id: number;
}

export interface AvailableEmployee {
  employeeId: string;
  name: string;
}

export interface AssignEmployeeToTableRequest {
  tableId: string;
  employeeId: string;
}
