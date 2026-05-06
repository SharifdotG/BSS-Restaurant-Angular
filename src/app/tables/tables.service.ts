import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

import {
  AssignEmployeeToTableRequest,
  AvailableEmployee,
  CreateTableRequest,
  TableListResponse,
  Table,
  UpdateTableRequest,
} from './tables.interface';
import { Employee } from '../employees/employees.interface';
import { API_BASE_URL } from '../app.config';

function mapAvailableEmployees(
  availableData: AvailableEmployee[] | null,
  allEmployees: Employee[],
): Employee[] {
  if (!availableData) return [];
  const availableIds = new Set(availableData.map((item) => item.employeeId));
  return allEmployees.filter((employee) => availableIds.has(employee.id));
}

@Injectable({ providedIn: 'root' })
export class TablesService {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly httpClient = inject(HttpClient);
  private readonly messageService = inject(NzMessageService);

  readonly listOfTables = signal<Table[]>([]);
  readonly listOfEmployees = signal<Employee[]>([]);
  readonly listOfAvailableEmployees = signal<Employee[]>([]);
  readonly totalTables = signal(10);

  readonly isSendingRequest = signal(false);
  readonly isLoadingTables = signal(false);
  readonly isLoadingEmployees = signal(false);
  readonly triggerRefresh = signal(false);

  readonly showAddModal = signal(false);
  readonly showAssignModal = signal(false);
  readonly selectedTable = signal<Table | null>(null);
  readonly isEditMode = signal(false);

  readonly assignTableId = signal('');
  readonly assignTableName = signal('');
  readonly assignTableImage = signal('');
  readonly assignTableSeats = signal(0);

  readonly isAnyLoading = computed(() => this.isLoadingTables() || this.isLoadingEmployees());

  getListOfTables(sortBy: string, page: string, perPage: string, search: string): void {
    this.isLoadingTables.set(true);

    let params = new HttpParams()
      .append('Sort', sortBy)
      .append('Page', page)
      .append('Per_Page', perPage);

    if (search) {
      params = params.append('Search', search);
    }

    this.httpClient
      .get<TableListResponse>(`${this.baseUrl}/api/Table/datatable`, { params })
      .pipe(finalize(() => this.isLoadingTables.set(false)))
      .subscribe({
        next: (data) => {
          this.listOfTables.set(data?.data ?? []);
          this.totalTables.set(data?.totalRecords ?? data?.total ?? data?.data?.length ?? 0);
        },
        error: () => {
          this.messageService.error('Error Processing The Request. Please Try Again...');
        },
      });
  }

  addNewTable(postData: CreateTableRequest): void {
    this.isSendingRequest.set(true);

    this.httpClient
      .post(`${this.baseUrl}/api/Table/create`, postData)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: () => {
          this.messageService.success('Table Added Successfully!');
          this.triggerRefresh.set(true);
          this.closeAddModal();
        },
        error: () => {
          this.messageService.error('Error Processing The Request. Please Try Again...');
        },
      });
  }

  updateTable(id: number, updateData: UpdateTableRequest): void {
    this.isSendingRequest.set(true);

    this.httpClient
      .put(`${this.baseUrl}/api/Table/update/${id}`, updateData)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: () => {
          this.messageService.success('Table Updated Successfully!');
          this.triggerRefresh.set(true);
          this.closeAddModal();
        },
        error: () => {
          this.messageService.error('Error updating table');
        },
      });
  }

  deleteTable(id: number): void {
    this.isSendingRequest.set(true);

    this.httpClient
      .delete(`${this.baseUrl}/api/Table/delete/${id}`)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: () => {
          this.messageService.success('Table Removed Successfully!');
          this.triggerRefresh.set(true);
        },
        error: () => {
          this.messageService.error('Error Processing The Request. Please Try Again...');
        },
      });
  }

  getTableById(id: number): void {
    this.isSendingRequest.set(true);

    this.httpClient
      .get<Table>(`${this.baseUrl}/api/Table/get/${id}`)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: (data) => {
          this.selectedTable.set(data);
          this.isEditMode.set(true);
          this.showAddModal.set(true);
        },
        error: () => {
          this.messageService.error('Error fetching table details');
        },
      });
  }

  loadFullListOfEmployees(): void {
    if (this.listOfEmployees().length > 0) return;

    this.isLoadingEmployees.set(true);

    const params = new HttpParams()
      .append('Sort', '')
      .append('Page', '1')
      .append('Per_Page', '10000');

    this.httpClient
      .get<TableListResponse>(`${this.baseUrl}/api/Employee/datatable/`, {
        params,
      })
      .pipe(finalize(() => this.isLoadingEmployees.set(false)))
      .subscribe({
        next: (data) => {
          this.listOfEmployees.set(data.data as unknown as Employee[]);
        },
        error: () => {
          this.messageService.error('Error Processing The Request. Please Try Again...');
        },
      });
  }

  loadListOfAvailableEmployees(tableId: string): void {
    this.httpClient
      .get<AvailableEmployee[]>(`${this.baseUrl}/api/Employee/non-assigned-employees/${tableId}`)
      .subscribe({
        next: (data) => {
          this.listOfAvailableEmployees.set(mapAvailableEmployees(data, this.listOfEmployees()));
        },
        error: () => {
          this.messageService.error('Error Processing The Request. Please Try Again...');
        },
      });
  }

  removeEmployeeFromTable(employeeTableId: string): void {
    this.isSendingRequest.set(true);

    this.httpClient
      .delete(`${this.baseUrl}/api/EmployeeTable/delete/${employeeTableId}`)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: () => {
          this.messageService.success('Employee Removed Successfully!');
          this.triggerRefresh.set(true);
        },
        error: () => {
          this.messageService.error('Error Processing The Request. Please Try Again...');
        },
      });
  }

  assignEmployeeToTable(selectedEmployees: Employee[], tableId: string): void {
    this.isSendingRequest.set(true);

    const requests: AssignEmployeeToTableRequest[] = selectedEmployees.map((emp) => ({
      employeeId: emp.id,
      tableId,
    }));

    this.httpClient
      .post(`${this.baseUrl}/api/EmployeeTable/create-range`, requests)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: () => {
          this.messageService.success('Employees Assigned Successfully!');
          this.triggerRefresh.set(true);
          this.closeAssignModal();
        },
        error: () => {
          this.messageService.error('Error Processing The Request. Please Try Again...');
        },
      });
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.selectedTable.set(null);
    this.isEditMode.set(false);
  }

  closeAssignModal(): void {
    this.showAssignModal.set(false);
  }
}
