import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgxChartsModule, LegendPosition, Color, ScaleType } from '@swimlane/ngx-charts';

import { DashboardService } from '../dashboard/dashboard.service';

interface MonthOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-report-and-analytics',
  imports: [DecimalPipe, FormsModule, NzSpinModule, NzIconModule, NzSelectModule, NgxChartsModule],
  templateUrl: './report-and-analytics.html',
  styleUrl: './report-and-analytics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportAndAnalytics implements OnInit {
  protected readonly dashboardService = inject(DashboardService);

  readonly legendPosition = LegendPosition.Below;
  readonly barLegendPosition = LegendPosition.Right;
  readonly barColorScheme: Color = {
    name: 'bar',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#66bb6a', '#e91e63', '#26a69a'],
  };
  readonly pieColorScheme: Color = {
    name: 'pie',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#66bb6a', '#e91e63'],
  };

  readonly barChartData = computed(() => {
    const sr = this.dashboardService.dashboardStats()?.salesRevenue;
    if (!sr) return [];
    return [
      {
        name: 'Today',
        series: [
          { name: 'Sales', value: sr.todaysSalesAmount },
          { name: 'Expenses', value: sr.todaysExpenses },
          { name: 'Revenue', value: Math.max(0, sr.todaysRevenue) },
        ],
      },
      {
        name: 'Monthly',
        series: [
          { name: 'Sales', value: sr.monthlySalesAmount },
          { name: 'Expenses', value: sr.monthlyExpenses },
          { name: 'Revenue', value: Math.max(0, sr.monthlyRevenue) },
        ],
      },
      {
        name: 'Yearly',
        series: [
          { name: 'Sales', value: sr.yearlySalesAmount },
          { name: 'Expenses', value: sr.yearlyExpenses },
          { name: 'Revenue', value: Math.max(0, sr.yearlyRevenue) },
        ],
      },
    ];
  });

  readonly pieChartData = computed(() => {
    const sr = this.dashboardService.dashboardStats()?.salesRevenue;
    if (!sr) return [];
    return [
      { name: 'Total Sales', value: sr.totalSalesAmount || 0 },
      { name: 'Total Expenses', value: sr.totalExpenses || 0 },
    ];
  });

  readonly selectedMonth = signal(new Date().getMonth() + 1);
  readonly selectedYear = signal(new Date().getFullYear());

  readonly months: readonly MonthOption[] = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  readonly years: readonly number[] = this.buildYearRange();

  ngOnInit(): void {
    this.dashboardService.getStats(this.selectedMonth(), this.selectedYear());
  }

  onPeriodChange(): void {
    this.dashboardService.getStats(this.selectedMonth(), this.selectedYear());
  }

  private buildYearRange(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);
  }
}
