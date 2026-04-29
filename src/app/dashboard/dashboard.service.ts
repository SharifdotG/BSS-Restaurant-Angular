import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';

import { API_BASE_URL } from '../app.config';
import { DashboardStats } from './dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = inject(API_BASE_URL);
  private http = inject(HttpClient);
  private message = inject(NzMessageService);

  readonly dashboardStats = signal<DashboardStats | null>(null);
  readonly isSendingRequest = signal(false);

  getStats(month?: number, year?: number): void {
    let params = new HttpParams();
    if (month != null) params = params.append('Month', month.toString());
    if (year != null) params = params.append('Year', year.toString());

    this.isSendingRequest.set(true);
    this.http
      .get<DashboardStats>(`${this.baseUrl}/api/Dashboard/stats`, { params })
      .pipe(finalize(() => this.isSendingRequest.set(false)))
      .subscribe({
        next: (data) => {
          this.dashboardStats.set(data);
        },
        error: () => {
          this.message.error('Failed to load dashboard stats.');
        },
      });
  }

  getFoodImage(image: string): string {
    return `${this.baseUrl}/images/food/${image}`;
  }
}
