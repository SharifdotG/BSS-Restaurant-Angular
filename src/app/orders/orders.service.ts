import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

import { OrderData, ResponseOrderList, UpdateOrder } from './orders.model';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly http = inject(HttpClient);
  private readonly message = inject(NzMessageService);

  listOfOrder = signal<OrderData[]>([]);
  totalOrder = signal(0);
  isSendingRequest = signal(false);
  triggerRefresh = signal(false);
  selectedOrder = signal<OrderData | null>(null);
  showEditModal = signal(false);

  getOrders(sortBy = '', page = 1, perPage = 10, search = '', status?: number): void {
    let params = new HttpParams()
      .append('Sort', sortBy)
      .append('Page', page)
      .append('Per_Page', perPage)
      .append('Search', search);

    if (status !== undefined && status !== null) {
      params = params.append('Status', status);
    }

    this.isSendingRequest.set(true);

    this.http
      .get<ResponseOrderList>(`${this.baseUrl}/api/Order/datatable`, { params })
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: (data) => {
          this.listOfOrder.set(data.data);
          const total = data.totalRecords || data.total || data.data.length;
          this.totalOrder.set(total);
        },
        error: () => {
          this.message.error('Failed to load orders. Please try again.');
        },
      });
  }

  /**
   * Update an order's status. The backend (ASP.NET) exposes the status as a
   * string-name enum, so we send `{ orderStatus: "Pending" }` and fall back to
   * the numeric body shape and the legacy query-param shape if needed.
   */
  updateOrderStatus(id: string, statusText: string): void {
    this.isSendingRequest.set(true);

    const statusCode = OrdersService.STATUS_TEXT_TO_CODE.get(statusText);
    const endpoint = `${this.baseUrl}/api/Order/update-status/${id}`;

    const tryQueryParam = () => {
      if (statusCode === undefined) {
        this.isSendingRequest.set(false);
        this.message.error('Order status was not updated. Try again later.');
        return;
      }
      const params = new HttpParams().set('status', String(statusCode));
      this.http
        .put(endpoint, null, { params })
        .pipe(finalize(() => this.isSendingRequest.set(false)))
        .subscribe({
          next: () => {
            this.message.success('Order status updated.');
            this.triggerRefresh.set(true);
          },
          error: () => {
            this.message.error('Order status was not updated. Try again later.');
          },
        });
    };

    const tryNumericBody = () => {
      if (statusCode === undefined) {
        tryQueryParam();
        return;
      }
      this.http.put(endpoint, { orderStatus: statusCode }).subscribe({
        next: () => {
          this.isSendingRequest.set(false);
          this.message.success('Order status updated.');
          this.triggerRefresh.set(true);
        },
        error: () => tryQueryParam(),
      });
    };

    // First attempt: text body (string-name enum, the most common ASP.NET shape).
    this.http.put(endpoint, { orderStatus: statusText }).subscribe({
      next: () => {
        this.isSendingRequest.set(false);
        this.message.success('Order status updated.');
        this.triggerRefresh.set(true);
      },
      error: () => tryNumericBody(),
    });
  }

  private static readonly STATUS_TEXT_TO_CODE = new Map<string, number>([
    ['Pending', 0],
    ['Confirmed', 1],
    ['Preparing', 2],
    ['PreparedToServe', 3],
    ['Served', 4],
    ['Paid', 5],
  ]);

  deleteOrder(id: string): void {
    this.isSendingRequest.set(true);

    this.http
      .delete(`${this.baseUrl}/api/Order/delete/${id}`)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Order deleted successfully.');
          this.triggerRefresh.set(true);
        },
        error: () => {
          this.message.error('Order could not be deleted. Try again later.');
        },
      });
  }

  getFoodImage(image: string): string {
    return `${this.baseUrl}/images/food/${image}`;
  }

  updateOrder(id: string, orderData: UpdateOrder): void {
    this.isSendingRequest.set(true);

    this.http
      .put(`${this.baseUrl}/api/Order/update/${id}`, orderData)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Order updated successfully.');
          this.triggerRefresh.set(true);
          this.showEditModal.set(false);
          this.selectedOrder.set(null);
        },
        error: () => {
          this.message.error('Failed to update order. Please try again.');
        },
      });
  }

  getOrderById(id: string): void {
    this.isSendingRequest.set(true);

    this.http
      .get<OrderData>(`${this.baseUrl}/api/Order/get/${id}`)
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: (data) => {
          this.selectedOrder.set(data);
          this.showEditModal.set(true);
        },
        error: () => {
          this.message.error('Failed to load order details. Please try again.');
        },
      });
  }
}
