import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgxChartsModule, LegendPosition, Color, ScaleType } from '@swimlane/ngx-charts';

import { DashboardService } from '../../dashboard/dashboard.service';
import { ThemeService } from '../../core/theme.service';

interface MonthOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-report-and-analytics',
  imports: [
    DecimalPipe,
    FormsModule,
    NzSkeletonModule,
    NzIconModule,
    NzSelectModule,
    NgxChartsModule,
  ],
  templateUrl: './report-and-analytics.html',
  styleUrl: './report-and-analytics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportAndAnalytics implements OnInit {
  protected readonly dashboardService = inject(DashboardService);
  private readonly breakpoint = inject(BreakpointObserver);
  protected readonly themeService = inject(ThemeService);

  readonly legendPosition = LegendPosition.Below;
  readonly barLegendPosition = signal(LegendPosition.Right);
  readonly pieChartView = signal<[number, number]>([320, 320]);
  /** Explicit view size for the bar chart so ngx-charts renders within bounds.
   *  Mobile gets a taller frame because the legend moves below the bars. */
  readonly barChartView = signal<[number, number]>([720, 440]);

  readonly barColorScheme = computed<Color>(() => {
    const isDark = this.themeService.resolvedTheme() === 'dark';
    return {
      name: 'bar',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: isDark ? ['#3291ff', '#ff4d96', '#a371f7'] : ['#0070f3', '#ff0080', '#7928ca'],
    };
  });

  /** Donut chart — ink + mute for a stark infographic look */
  readonly pieColorScheme = computed<Color>(() => {
    const isDark = this.themeService.resolvedTheme() === 'dark';
    return {
      name: 'pie',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: isDark ? ['#fafafa', '#525252'] : ['#171717', '#a1a1a1'],
    };
  });

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

  constructor() {
    this.breakpoint
      .observe(['(max-width: 768px)'])
      .pipe(takeUntilDestroyed())
      .subscribe((state) => {
        const isMobile = state.matches;
        this.barLegendPosition.set(isMobile ? LegendPosition.Below : LegendPosition.Right);
        this.pieChartView.set(isMobile ? [240, 240] : [320, 320]);
        // Explicit bar-chart canvas so the legend + X-axis labels render fully.
        // Width gets clamped by the wrapper; height needs to cover bars + legend.
        const width = isMobile ? Math.min(window.innerWidth - 64, 540) : 720;
        const height = isMobile ? 520 : 440;
        this.barChartView.set([width, height]);
      });

    // React to theme changes: ngx-charts caches color scales, so re-trigger via signal access
    effect(() => {
      // Read schemes so the effect tracks them — Angular re-renders the chart inputs.
      this.barColorScheme();
      this.pieColorScheme();
    });
  }

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
