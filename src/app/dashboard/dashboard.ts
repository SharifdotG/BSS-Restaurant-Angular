import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { DashboardService } from './dashboard.service';
import { ReportAndAnalytics } from '../dashboard/report-and-analytics/report-and-analytics';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  Pending: { bg: '#f59e0b', label: 'Pending' },
  Confirmed: { bg: '#3b82f6', label: 'Confirmed' },
  Preparing: { bg: '#8b5cf6', label: 'Preparing' },
  PreparedToServe: { bg: '#06b6d4', label: 'Prepared To Serve' },
  Served: { bg: '#10b981', label: 'Served' },
  Paid: { bg: '#66bb6a', label: 'Paid' },
};

const DEFAULT_STATUS_CONFIG = { bg: '#6b7280' };

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    DecimalPipe,
    NzSkeletonModule,
    NzIconModule,
    NzTableModule,
    NzEmptyModule,
    NzTabsModule,
    ReportAndAnalytics,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  readonly dashboardService = inject(DashboardService);
  readonly statusConfig = STATUS_CONFIG;
  readonly defaultStatusConfig = DEFAULT_STATUS_CONFIG;

  private failedImageIds = signal<Set<number>>(new Set());
  readonly failedImages = this.failedImageIds.asReadonly();

  readonly availableTables = computed(() => {
    const stats = this.dashboardService.dashboardStats();
    return stats ? stats.totalTables - stats.occupiedTables : 0;
  });

  ngOnInit(): void {
    this.dashboardService.getStats();
  }

  onImageError(foodId: number): void {
    this.failedImageIds.update((set) => new Set(set).add(foodId));
  }
}
