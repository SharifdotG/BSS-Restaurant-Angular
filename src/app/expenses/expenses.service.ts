import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';

import {
  ExpenseItem,
  ResponseExpenseList,
  CreateExpense,
  UpdateExpense,
} from './expenses.interface';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private baseUrl = inject(API_BASE_URL);

  isSendingRequest = signal(false);
  triggerRefresh = signal(false);
  listOfExpenses = signal<ExpenseItem[]>([]);
  totalExpenses = signal(10);
  showAddModal = signal(false);
  selectedExpense = signal<ExpenseItem | null>(null);
  isEditMode = signal(false);
  /** Tells the list to navigate to the page that will contain the new row. */
  gotoLastPage = signal(false);

  getListOfExpenses(sortBy: string, page: string, perPage: string, search = ''): void {
    let params = new HttpParams()
      .append('Sort', sortBy)
      .append('Page', page)
      .append('Per_Page', perPage);

    if (search) {
      params = params.append('Search', search);
    }

    this.isSendingRequest.set(true);

    this.http
      .get<ResponseExpenseList>(`${this.baseUrl}/api/Expense/datatable/`, { params })
      .subscribe({
        next: (response) => {
          this.listOfExpenses.set(response.data ?? []);
          this.totalExpenses.set(response.total ?? response.data?.length ?? 0);
        },
        error: () => {
          this.message.create('error', 'Error Processing The Request. Please Try Again...');
        },
        complete: () => {
          this.isSendingRequest.set(false);
        },
      });
  }

  addNewExpense(postData: CreateExpense): void {
    this.isSendingRequest.set(true);

    this.http.post(`${this.baseUrl}/api/Expense/create`, postData).subscribe({
      next: () => {
        this.message.create('success', 'Expense Added Successfully!');
        this.showAddModal.set(false);
        this.selectedExpense.set(null);
        this.isEditMode.set(false);
        this.gotoLastPage.set(true);
        this.triggerRefresh.set(true);
      },
      error: () => {
        this.message.create('error', 'Error Processing The Request. Please Try Again...');
      },
      complete: () => {
        this.isSendingRequest.set(false);
      },
    });
  }

  deleteExpense(id: number): void {
    this.isSendingRequest.set(true);

    this.http.delete(`${this.baseUrl}/api/Expense/delete/${id}`).subscribe({
      next: () => {
        this.message.create('success', 'Expense Removed Successfully!');
        this.triggerRefresh.set(true);
      },
      error: () => {
        this.message.create('error', 'Error Processing The Request. Please Try Again...');
      },
      complete: () => {
        this.isSendingRequest.set(false);
      },
    });
  }

  getExpenseById(id: number): void {
    this.isSendingRequest.set(true);

    this.http.get<ExpenseItem>(`${this.baseUrl}/api/Expense/get/${id}`).subscribe({
      next: (expense) => {
        this.selectedExpense.set(expense);
        this.isEditMode.set(true);
        this.showAddModal.set(true);
      },
      error: () => {
        this.message.create('error', 'Error fetching expense details');
      },
      complete: () => {
        this.isSendingRequest.set(false);
      },
    });
  }

  updateExpense(id: number, updateData: UpdateExpense): void {
    this.isSendingRequest.set(true);

    this.http.put(`${this.baseUrl}/api/Expense/update/${id}`, updateData).subscribe({
      next: () => {
        this.message.create('success', 'Expense Updated Successfully!');
        this.triggerRefresh.set(true);
        this.showAddModal.set(false);
        this.selectedExpense.set(null);
        this.isEditMode.set(false);
      },
      error: () => {
        this.message.create('error', 'Error updating expense');
      },
      complete: () => {
        this.isSendingRequest.set(false);
      },
    });
  }
}
