import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

import { FoodItem, ResponseFoodList, CreateFood, UpdateFood } from '../foods/foods.interface';
import { API_BASE_URL } from '../app.config';

function getSanitizedListOfFood(data: ResponseFoodList | null): FoodItem[] {
  return data?.data || [];
}

@Injectable({
  providedIn: 'root',
})
export class FoodsService {
  private readonly http = inject(HttpClient);
  private readonly message = inject(NzMessageService);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly isSendingRequest = signal(false);
  readonly triggerRefresh = signal(false);
  readonly listOfFood = signal<FoodItem[]>([]);
  readonly totalFood = signal(10);
  readonly showAddModal = signal(false);
  readonly selectedFood = signal<FoodItem | null>(null);
  readonly isEditMode = signal(false);

  getListOfFood(sortBy: string, page: string, per_page: string, search: string = ''): void {
    const params = new HttpParams()
      .append('Sort', sortBy)
      .append('Page', page)
      .append('Per_Page', per_page);

    this.isSendingRequest.set(true);

    this.http
      .get<ResponseFoodList>(`${this.baseUrl}/api/Food/datatable/`, { params })
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: (data) => {
          this.listOfFood.set(getSanitizedListOfFood(data));
          this.totalFood.set(data?.totalRecords ?? data?.total ?? data?.data?.length ?? 0);
        },
        error: () => {
          this.message.create('error', 'Error Processing The Request. Please Try Again...');
        },
      });
  }

  addNewFood(postData: CreateFood): void {
    this.isSendingRequest.set(true);

    this.http
      .post(`${this.baseUrl}/api/Food/create`, postData)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: () => {
          this.message.create('success', 'Food Item Added Successfully!');
          this.showAddModal.set(false);
          setTimeout(() => {
            this.triggerRefresh.set(true);
          }, 1000);
        },
        error: () => {
          this.message.create('error', 'Error Processing The Request. Please Try Again...');
        },
      });
  }

  deleteFood(id: number): void {
    this.isSendingRequest.set(true);

    this.http
      .delete(`${this.baseUrl}/api/Food/delete/${id}`)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: () => {
          this.message.create('success', 'Food Item Removed Successfully!');
          this.triggerRefresh.set(true);
        },
        error: () => {
          this.message.create('error', 'Error Processing The Request. Please Try Again...');
        },
      });
  }

  getFoodById(id: number): void {
    this.isSendingRequest.set(true);

    this.http
      .get<FoodItem>(`${this.baseUrl}/api/Food/get/${id}`)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: (data) => {
          this.selectedFood.set(data);
          this.isEditMode.set(true);
          this.showAddModal.set(true);
        },
        error: () => {
          this.message.create('error', 'Error fetching food details');
        },
      });
  }

  updateFood(id: number, updateData: UpdateFood): void {
    this.isSendingRequest.set(true);

    this.http
      .put(`${this.baseUrl}/api/Food/update/${id}`, updateData)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: () => {
          this.message.create('success', 'Food Item Updated Successfully!');
          this.triggerRefresh.set(true);
          this.selectedFood.set(null);
          this.isEditMode.set(false);
        },
        error: () => {
          this.message.create('error', 'Error updating food item');
        },
      });
  }
}
