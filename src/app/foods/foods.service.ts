import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpEventType } from '@angular/common/http';
import { FoodItem, ResponseFoodList, CreateFood, UpdateFood } from '../foods/foods.interface';
import { NzMessageService } from 'ng-zorro-antd/message';
import { API_BASE_URL } from '../app.config';

function getSanitizedListOfFood(data: ResponseFoodList | null): FoodItem[] {
  return data?.data || [];
}

@Injectable({
  providedIn: 'root',
})
export class FoodsService {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private baseUrl = inject(API_BASE_URL);


  // State management with signals
  isSendingRequest = signal(false);
  triggerRefresh = signal(false);
  listOfFood = signal<FoodItem[]>([]);
  totalFood = signal(10);
  showAddModal = signal(false);
  selectedFood = signal<FoodItem | null>(null);
  isEditMode = signal(false);

  getListOfFood(sortBy: string, page: string, per_page: string, search: string = '') {
    const params = new HttpParams()
      .append('Sort', sortBy)
      .append('Page', page)
      .append('Per_Page', per_page);

    this.http.get<ResponseFoodList>(`${this.baseUrl}/api/Food/datatable/`, {
      params,
      observe: 'events'
    }).subscribe({
      next: (data) => {
        switch (data.type) {
          case HttpEventType.Sent:
            this.isSendingRequest.set(true);
            break;
          case HttpEventType.Response:
            if (data.status === 200) {
              this.listOfFood.set(getSanitizedListOfFood(data.body));
              this.totalFood.set(data.body?.totalRecords || data.body?.total || 10);
              this.isSendingRequest.set(false);
            }
            break;
        }
      },
      error: (error) => {
        this.isSendingRequest.set(false);
        this.message.create('error', 'Error Processing The Request. Please Try Again...');
      }
    });
  }

  addNewFood(postData: CreateFood) {
    this.http.post(`${this.baseUrl}/api/Food/create`, postData, {
      observe: 'events'
    }).subscribe({
      next: (data) => {
        switch (data.type) {
          case HttpEventType.Sent:
            this.isSendingRequest.set(true);
            break;
          case HttpEventType.Response:
            if (data.status == 200) {
              this.message.create('success', 'Food Item Added Successfully!');
              this.showAddModal.set(false);
              // Delay refresh by 1 second like demo app
              setTimeout(() => {
                this.triggerRefresh.set(true);
              }, 1000);
            }
            this.isSendingRequest.set(false);
            break;
        }
      },
      error: (error) => {
        this.isSendingRequest.set(false);
        this.message.create('error', 'Error Processing The Request. Please Try Again...');
      }
    });
  }

  deleteFood(id: number) {
    this.isSendingRequest.set(true);
    this.http.delete(`${this.baseUrl}/api/Food/delete/${id}`, {
      observe: 'events'
    }).subscribe({
      next: (data) => {
        switch (data.type) {
          case HttpEventType.Response:
            if (data.status === 200) {
              this.message.create('success', 'Food Item Removed Successfully!');
              this.triggerRefresh.set(true);
            }
            this.isSendingRequest.set(false);
            break;
        }
      },
      error: (error) => {
        this.isSendingRequest.set(false);
        this.message.create('error', 'Error Processing The Request. Please Try Again...');
      }
    });
  }

  getFoodById(id: number) {
    this.http.get<FoodItem>(`${this.baseUrl}/api/Food/get/${id}`, {
      observe: 'events'
    }).subscribe({
      next: (data) => {
        switch (data.type) {
          case HttpEventType.Sent:
            this.isSendingRequest.set(true);
            break;
          case HttpEventType.Response:
            if (data.status === 200) {
              this.selectedFood.set(data.body);
              this.isEditMode.set(true);
              this.showAddModal.set(true);
              this.isSendingRequest.set(false);
            }
            break;
        }
      },
      error: (error) => {
        this.message.create('error', 'Error fetching food details');
        this.isSendingRequest.set(false);
      }
    });
  }

  updateFood(id: number, updateData: UpdateFood) {
    this.http.put(`${this.baseUrl}/api/Food/update/${id}`, updateData, {
      observe: 'events'
    }).subscribe({
      next: (data) => {
        switch (data.type) {
          case HttpEventType.Sent:
            this.isSendingRequest.set(true);
            break;
          case HttpEventType.Response:
            if (data.status === 200) {
              this.message.create('success', 'Food Item Updated Successfully!');
              this.isSendingRequest.set(false);
              this.triggerRefresh.set(true);
              this.selectedFood.set(null);
              this.isEditMode.set(false);
            }
            break;
        }
      },
      error: (error) => {
        this.message.create('error', 'Error updating food item');
        this.isSendingRequest.set(false);
      },
      complete: () => {
        this.isSendingRequest.set(false);
      }
    });
  }
}
