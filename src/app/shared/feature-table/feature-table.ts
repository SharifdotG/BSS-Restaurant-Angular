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
  readonly data = input.required<readonly any[]>();
  readonly loading = input(false);
  readonly total = input(0);
  readonly pageSize = input(10);
  readonly pageIndex = input(1);
  readonly scrollX = input<string | null>('1000px');
  readonly scrollY = input<string | null>('calc(100% - 56px)');
  readonly showPagination = input(true);
  readonly showSizeChanger = input(true);
  readonly card = input(true);
  readonly addLabel = input<string | null>(null);
  readonly emptyText = input('No items');
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
