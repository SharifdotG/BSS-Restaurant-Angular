import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CreateEmployee, Employee, ResponseListOfEmployees } from './employees.interface';
import { NzMessageService } from 'ng-zorro-antd/message';
import { API_BASE_URL } from '../app.config';

function getSanitizedListOfEmployee(data: ResponseListOfEmployees | null): Employee[] {
  return data?.data ?? [];
}

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private baseUrl = inject(API_BASE_URL);
  private httpClient = inject(HttpClient);
  private messageService = inject(NzMessageService);

  isSendingRequest = signal(false);
  triggerRefresh = signal(0);
  listOfEmployees = signal<Employee[]>([]);
  totalEmployees = signal(10);
  showAddModal = signal(false);
  selectedEmployee = signal<Employee | null>(null);
  isEditMode = signal(false);

  getListOfEmployees(sortBy: string, page: string, perPage: string, search: string): void {
    this.isSendingRequest.set(true);

    let params = new HttpParams()
      .append('Sort', sortBy)
      .append('Page', page)
      .append('Per_Page', perPage);

    if (search) {
      params = params.append('Search', search);
    }

    this.httpClient
      .get<ResponseListOfEmployees>(`${this.baseUrl}/api/Employee/datatable/`, { params })
      .subscribe({
        next: (data) => {
          this.listOfEmployees.set(getSanitizedListOfEmployee(data));
          this.totalEmployees.set(data?.totalRecords ?? 0);
        },
        error: () => {
          this.messageService.error('Error Processing The Request. Please Try Again...');
        },
        complete: () => {
          this.isSendingRequest.set(false);
        },
      });
  }

  deleteEmployee(id: string): void {
    this.isSendingRequest.set(true);

    this.httpClient.delete(`${this.baseUrl}/api/Employee/delete/${id}`).subscribe({
      next: () => {
        this.messageService.success('Employee Deleted Successfully');
      },
      error: () => {
        this.messageService.error('Error Processing The Request. Please Try Again...');
      },
      complete: () => {
        this.isSendingRequest.set(false);
        this.triggerRefresh.update((v) => v + 1);
      },
    });
  }

  addNewEmployee(postData: CreateEmployee): void {
    this.isSendingRequest.set(true);

    this.httpClient.post(`${this.baseUrl}/api/Employee/create`, postData).subscribe({
      next: () => {
        this.messageService.success('Employee Added Successfully');
        this.triggerRefresh.update((v) => v + 1);
      },
      error: () => {
        this.messageService.error('Error Processing The Request. Please Try Again...');
      },
      complete: () => {
        this.isSendingRequest.set(false);
      },
    });
  }

  getEmployeeById(id: string): void {
    this.isSendingRequest.set(true);

    this.httpClient.get<Employee>(`${this.baseUrl}/api/Employee/get/${id}`).subscribe({
      next: (data) => {
        this.selectedEmployee.set(data);
        this.isEditMode.set(true);
        this.showAddModal.set(true);
      },
      error: () => {
        this.messageService.error('Error fetching employee details');
      },
      complete: () => {
        this.isSendingRequest.set(false);
      },
    });
  }

  updateEmployee(id: string, updateData: CreateEmployee): void {
    this.isSendingRequest.set(true);

    this.httpClient.put(`${this.baseUrl}/api/Employee/update/${id}`, updateData).subscribe({
      next: () => {
        this.messageService.success('Employee Updated Successfully');
        this.selectedEmployee.set(null);
        this.isEditMode.set(false);
        this.triggerRefresh.update((v) => v + 1);
      },
      error: () => {
        this.messageService.error('Error updating employee');
      },
      complete: () => {
        this.isSendingRequest.set(false);
      },
    });
  }
}
