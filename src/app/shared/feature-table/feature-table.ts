import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { FeatureTableColumnDirective } from './feature-table-column.directive';

@Component({
  selector: 'app-feature-table',
  standalone: true,
  imports: [NgTemplateOutlet, NzTableModule, NzSkeletonModule, NzIconModule],
  templateUrl: './feature-table.html',
  styleUrl: './feature-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureTable {
  /** Row data. Loosely typed so any entity array (Employee[], FoodItem[], ...) can be passed. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly data = input.required<readonly any[]>();
  /** When true, the skeleton rows are shown instead of data. */
  readonly loading = input(false);
  /** Server-side total used for pagination. */
  readonly total = input(0);
  readonly pageSize = input(10);
  readonly pageIndex = input(1);
  /** Horizontal scroll min-width. Pass null to disable horizontal scroll. */
  readonly scrollX = input<string | null>('1000px');
  /** Vertical scroll height. Pass null to disable vertical scroll. */
  readonly scrollY = input<string | null>('calc(100% - 56px)');
  /** Show ng-zorro pagination row. */
  readonly showPagination = input(true);
  readonly showSizeChanger = input(true);
  /** Wrap the table in the standard feature-table-card chrome. */
  readonly card = input(true);
  /** Add-button label rendered inside the `actions` column header. */
  readonly addLabel = input<string | null>(null);
  /** Empty-state message when data is loaded but empty. */
  readonly emptyText = input('No items');
  /** Number of skeleton rows displayed while loading. Falls back to pageSize
   *  so the placeholder fills the same vertical space the real list will. */
  readonly skeletonRowCount = input<number | null>(null);

  readonly addClick = output<void>();
  readonly queryParamsChange = output<NzTableQueryParams>();

  readonly columns = contentChildren(FeatureTableColumnDirective);

  readonly widthConfig = computed(() => this.columns().map((col) => col.ftWidth()));

  readonly skeletonRows = computed(() => {
    const explicit = this.skeletonRowCount();
    return Array.from({ length: explicit ?? this.pageSize() });
  });

  readonly scrollConfig = computed<{ x?: string | null; y?: string | null }>(() => {
    return { x: this.scrollX(), y: this.scrollY() };
  });
}
