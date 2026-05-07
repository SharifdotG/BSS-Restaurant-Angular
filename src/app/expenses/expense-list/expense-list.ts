import { Component, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { NzTableModule, type NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

import { ExpensesService } from '../../expenses/expenses.service';
import { AddExpense } from '../add-expense/add-expense';

@Component({
  selector: 'app-expense-list',
  providers: [NzModalService],
  imports: [
    NzTableModule,
    NzIconModule,
    NzTooltipModule,
    NzButtonModule,
    NzSkeletonModule,
    AddExpense,
  ],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseList {
  expensesService = inject(ExpensesService);
  private modal = inject(NzModalService);

  pageSize = 10;
  pageIndex = 1;

  listOfExpenses = this.expensesService.listOfExpenses;

  constructor() {
    effect(() => {
      if (this.expensesService.triggerRefresh()) {
        this.loadDataFromServer(this.pageIndex, this.pageSize);
        this.expensesService.triggerRefresh.set(false);
      }
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortBy = currentSort?.key ?? '';
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.loadDataFromServer(pageIndex, pageSize, sortBy);
  }

  loadDataFromServer(pageIndex: number, pageSize: number, sortBy = ''): void {
    this.expensesService.getListOfExpenses(sortBy, pageIndex.toString(), pageSize.toString());
  }

  editExpense(id: number): void {
    this.expensesService.getExpenseById(id);
  }

  deleteExpense(id: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this expense?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes, Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        if (this.listOfExpenses().length <= 1 && this.pageIndex > 1) {
          this.pageIndex--;
        }
        this.expensesService.deleteExpense(id);
      },
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
