import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, tap } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { FoodItem, ResponseFoodList } from '../foods/foods.interface';
import { Table, TableListResponse } from '../tables/tables.interface';
import { CartItem, PostOrder } from '../orders/orders.model';
import { OrdersService } from '../orders/orders.service';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class NewOrderService {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly http = inject(HttpClient);
  private readonly message = inject(NzMessageService);
  private readonly ordersService = inject(OrdersService);

  readonly isSendingRequest = signal(false);
  readonly isLoadingTables = signal(false);
  readonly isLoadingFoods = signal(false);
  readonly listOfFood = signal<FoodItem[]>([]);
  readonly totalFood = signal(0);
  readonly totalTable = signal(0);
  readonly cartFood = signal<CartItem[]>([]);
  readonly selectedTableId = signal('');
  readonly listOfTable = signal<Table[]>([]);
  readonly showCart = signal(false);
  readonly cartFlash = signal(false);

  readonly hasCartItems = computed(() => this.cartFood().length > 0);
  readonly cartTableCount = computed(() => new Set(this.cartFood().map((i) => i.tableId)).size);

  private flashTimer?: ReturnType<typeof setTimeout>;

  flashCart(): void {
    this.cartFlash.set(true);
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => this.cartFlash.set(false), 700);
  }

  readonly fallbackImage =
    'data:image/png;base64,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';

  getListOfFoods(sortBy = '', page = '1', perPage = '10', search = ''): void {
    const params = new HttpParams()
      .set('Sort', sortBy)
      .set('Page', page)
      .set('Per_Page', perPage)
      .set('Search', search);

    this.isSendingRequest.set(true);
    this.isLoadingFoods.set(true);

    this.http
      .get<ResponseFoodList>(`${this.baseUrl}/api/Food/datatable/`, { params })
      .pipe(
        finalize(() => {
          this.isSendingRequest.set(false);
          this.isLoadingFoods.set(false);
        }),
      )
      .subscribe({
        next: (data) => {
          this.listOfFood.set(data.data);
          this.totalFood.set(data.total || data.totalRecords || 0);
        },
      });
  }

  getListOfTables(sortBy = '', page = '1', perPage = '10'): void {
    const params = new HttpParams().set('Sort', sortBy).set('Page', page).set('Per_Page', perPage);

    this.isSendingRequest.set(true);
    this.isLoadingTables.set(true);

    this.http
      .get<TableListResponse>(`${this.baseUrl}/api/Table/datatable`, { params })
      .pipe(
        finalize(() => {
          this.isSendingRequest.set(false);
          this.isLoadingTables.set(false);
        }),
      )
      .subscribe({
        next: (data) => {
          this.listOfTable.set(data.data);
          this.totalTable.set(data.total || data.totalRecords || 0);
        },
      });
  }

  createOrder(postData: PostOrder): Observable<unknown> {
    this.isSendingRequest.set(true);

    return this.http
      .post(`${this.baseUrl}/api/Order/create`, postData)
      .pipe(
        tap({
          next: () => {
            this.message.success('Order Created Successfully!');
            // Refresh the orders page so the new order appears there immediately.
            this.ordersService.triggerRefresh.set(true);
          },
          error: () => {
            this.message.error('Error Creating Order');
          },
        }),
        finalize(() => this.isSendingRequest.set(false)),
      );
  }

  getFoodImage(image: string): string {
    return `${this.baseUrl}/images/food/${image}`;
  }

  getTableImage(image: string): string {
    return `${this.baseUrl}/images/table/${image}`;
  }
}
