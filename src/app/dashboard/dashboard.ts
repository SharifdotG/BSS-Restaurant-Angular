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

const STATUS_CONFIG: Record<string, { variant: string; label: string }> = {
  Pending: { variant: 'warning', label: 'Pending' },
  Confirmed: { variant: 'success', label: 'Confirmed' },
  Preparing: { variant: 'violet', label: 'Preparing' },
  PreparedToServe: { variant: 'cyan', label: 'Prepared To Serve' },
  Served: { variant: 'success', label: 'Served' },
  Paid: { variant: 'ink', label: 'Paid' },
};

const DEFAULT_STATUS_CONFIG = { variant: 'neutral' };

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

  readonly greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning.';
    if (h < 18) return 'Good afternoon.';
    return 'Good evening.';
  });

  ngOnInit(): void {
    this.dashboardService.getStats();
  }

  onImageError(foodId: number): void {
    this.failedImageIds.update((set) => new Set(set).add(foodId));
  }
}
