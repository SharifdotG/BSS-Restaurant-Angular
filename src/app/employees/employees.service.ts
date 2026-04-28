import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { CreateEmployee, Employee, ResponseListOfEmployees } from './employees.interface';
import { NzMessageService } from 'ng-zorro-antd/message';
import { API_BASE_URL } from '../app.config';

function getSanitizedListOfEmployee(data: ResponseListOfEmployees | null) {
  let ListOfEmployees: Employee[] = [];
  return data!.data;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private baseUrl = inject(API_BASE_URL);

  private httpClient = inject(HttpClient);
  private messageService = inject(NzMessageService);

  // State signals
  isSendingRequest = signal(false);
  triggerRefresh = signal(false);
  listOfEmployees = signal<Employee[]>([]);
  totalEmployees = signal(10);
  showAddModal = signal(false);
  selectedEmployee = signal<Employee | null>(null);
  isEditMode = signal(false);

  constructor() {
    effect(() => {
      // Any side effects can be handled here
    });
  }

  getListOfEmployees(sortBy: string, page: string, per_page: string, search: string) {
    let params = new HttpParams()
      .append('Sort', sortBy)
      .append('Page', page)
      .append('Per_Page', per_page);

    this.httpClient
      .get<ResponseListOfEmployees>(`${this.baseUrl}/api/Employee/datatable/`, {
        observe: 'events',
        params: params,
      })
      .pipe()
      .subscribe({
        next: (data) => {
          switch (data.type) {
            case HttpEventType.Response:
              if (data.status === 200) {
                this.listOfEmployees.set(getSanitizedListOfEmployee(data.body));
                this.totalEmployees.set(data.body!.totalRecords);
                this.isSendingRequest.set(false);
              }
              break;
            case HttpEventType.Sent:
              this.isSendingRequest.set(true);
              break;
          }
        },
        error: (err) => {
          this.messageService.error('Error Processing The Request. Please Try Again...');
          this.isSendingRequest.set(false);
        },
        complete: () => {},
      });
  }

  deleteEmployee(id: string) {
    this.httpClient
      .delete(`${this.baseUrl}/api/Employee/delete/${id}`, { observe: 'events' })
      .pipe()
      .subscribe({
        next: (data) => {
          switch (data.type) {
            case HttpEventType.Response:
              if (data.status === 204) {
                this.isSendingRequest.set(false);
                this.messageService.success('Employee Deleted Successfully');
              }
              break;
            case HttpEventType.Sent:
              this.isSendingRequest.set(true);
              break;
          }
        },
        error: (err) => {
          this.messageService.error('Error Processing The Request. Please Try Again...');
          this.isSendingRequest.set(false);
        },
        complete: () => {
          this.triggerRefresh.set(true);
        },
      });
  }

  addNewEmployee(postData: CreateEmployee) {
    this.httpClient
      .post(`${this.baseUrl}/api/Employee/create`, postData, { observe: 'events' })
      .pipe()
      .subscribe({
        next: (data) => {
          switch (data.type) {
            case HttpEventType.Response:
              if (data.status === 200) {
                this.isSendingRequest.set(false);
                this.triggerRefresh.set(true);
                this.messageService.success('Employee Added Successfully');
              }
              break;
            case HttpEventType.Sent:
              this.isSendingRequest.set(true);
              break;
          }
        },
        error: (err) => {
          this.isSendingRequest.set(false);
          this.messageService.error('Error Processing The Request. Please Try Again...');
        },
        complete: () => {
          this.isSendingRequest.set(false);
        },
      });
  }

  getEmployeeById(id: string) {
    this.httpClient
      .get<Employee>(`${this.baseUrl}/api/Employee/get/${id}`, { observe: 'events' })
      .pipe()
      .subscribe({
        next: (data) => {
          switch (data.type) {
            case HttpEventType.Response:
              if (data.status === 200) {
                this.selectedEmployee.set(data.body);
                this.isEditMode.set(true);
                this.showAddModal.set(true);
                this.isSendingRequest.set(false);
              }
              break;
            case HttpEventType.Sent:
              this.isSendingRequest.set(true);
              break;
          }
        },
        error: (err) => {
          this.messageService.error('Error fetching employee details');
          this.isSendingRequest.set(false);
        },
      });
  }

  updateEmployee(id: string, updateData: CreateEmployee) {
    this.httpClient
      .put(`${this.baseUrl}/api/Employee/update/${id}`, updateData, { observe: 'events' })
      .pipe()
      .subscribe({
        next: (data) => {
          switch (data.type) {
            case HttpEventType.Response:
              if (data.status === 200) {
                this.isSendingRequest.set(false);
                this.triggerRefresh.set(true);
                this.messageService.success('Employee Updated Successfully');
                this.selectedEmployee.set(null);
                this.isEditMode.set(false);
              }
              break;
            case HttpEventType.Sent:
              this.isSendingRequest.set(true);
              break;
          }
        },
        error: (err) => {
          this.isSendingRequest.set(false);
          this.messageService.error('Error updating employee');
        },
        complete: () => {
          this.isSendingRequest.set(false);
        },
      });
  }
}
