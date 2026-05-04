import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FoodItem, ResponseFoodList } from '../foods/foods.interface';
import { Table, TableListResponse } from '../tables/tables.interface';
import { CartItem, PostOrder } from '../orders/orders.model';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class NewOrderService {
  private baseUrl = inject(API_BASE_URL);

  private http = inject(HttpClient);
  private message = inject(NzMessageService);

  // Signals for state management
  isSendingRequest = signal(false);
  triggerRefresh = signal(false);
  listOfFood = signal<FoodItem[]>([]);
  totalFood = signal(0);
  totalTable = signal(0);
  cartFood = signal<CartItem[]>([]);
  selectedTableId = signal('');
  listOfTable = signal<Table[]>([]);

  constructor() {
    effect(() => {
      // Can add effects here if needed
    });
  }

  getListOfFoods(
    sortBy: string = '',
    page: string = '1',
    per_page: string = '10',
    search: string = '',
  ) {
    let params = new HttpParams()
      .append('Sort', sortBy)
      .append('Page', page)
      .append('Per_Page', per_page)
      .append('Search', search);

    this.http
      .get<ResponseFoodList>(`${this.baseUrl}/api/Food/datatable/`, {
        observe: 'events',
        params: params,
      })
      .subscribe({
        next: (data) => {
          switch (data.type) {
            case HttpEventType.Response:
              if (data.status === 200) {
                this.listOfFood.set(data.body!.data);
                this.totalFood.set(data.body!.total || data.body!.totalRecords || 0);
                this.isSendingRequest.set(false);
              }
              break;
            case HttpEventType.Sent:
              this.isSendingRequest.set(true);
              break;
          }
        },
        error: (err) => {
          this.isSendingRequest.set(false);
        },
        complete: () => {
          this.isSendingRequest.set(false);
        },
      });
  }

  getListOfTables(
    sortBy: string = '',
    page: string = '1',
    per_page: string = '10',
    search: string = '',
  ) {
    let params = new HttpParams()
      .append('Sort', sortBy)
      .append('Page', page)
      .append('Per_Page', per_page);

    this.http
      .get<TableListResponse>(`${this.baseUrl}/api/Table/datatable`, {
        observe: 'events',
        params: params,
      })
      .subscribe({
        next: (data) => {
          switch (data.type) {
            case HttpEventType.Response:
              if (data.status === 200) {
                this.listOfTable.set(data.body!.data);
                this.totalTable.set(data.body!.total || data.body!.totalRecords || 0);
              }
              break;
            case HttpEventType.Sent:
              this.isSendingRequest.set(true);
              break;
          }
        },
        error: (err) => {
          this.isSendingRequest.set(false);
        },
        complete: () => {
          this.isSendingRequest.set(false);
        },
      });
  }

  createOrder(POST_DATA: PostOrder) {
    this.http
      .post(`${this.baseUrl}/api/Order/create`, POST_DATA, {
        observe: 'events',
      })
      .subscribe({
        next: (data) => {
          switch (data.type) {
            case HttpEventType.Response:
              if (data.status === 200) {
                this.isSendingRequest.set(false);
                this.cartFood.set([]);
                this.message.success('Order Created Successfully!');
              }
              break;
            case HttpEventType.Sent:
              this.isSendingRequest.set(true);
              this.message.info('Order Placed.');
              break;
          }
        },
        error: (err) => {
          this.isSendingRequest.set(false);
          this.message.error('Error Creating Order');
        },
        complete: () => {
          this.isSendingRequest.set(false);
        },
      });
  }

  getFoodImage(image: string): string {
    return `${this.baseUrl}/images/food/${image}`;
  }

  getTableImage(image: string): string {
    return `${this.baseUrl}/images/table/${image}`;
  }
}
