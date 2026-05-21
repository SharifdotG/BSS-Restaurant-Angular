import { Component, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { type NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzModalService } from 'ng-zorro-antd/modal';

import { ExpensesService } from '../../expenses/expenses.service';
import { AddExpense } from '../add-expense/add-expense';
import { FeatureTable } from '../../shared/feature-table/feature-table';
import { FeatureTableColumnDirective } from '../../shared/feature-table/feature-table-column.directive';

@Component({
  selector: 'app-expense-list',
  providers: [NzModalService],
  imports: [
    NzIconModule,
    NzTooltipModule,
    AddExpense,
    FeatureTable,
    FeatureTableColumnDirective,
  ],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseList {
  expensesService = inject(ExpensesService);
  private modal = inject(NzModalService);

  pageSize = 15;
  pageIndex = 1;

  listOfExpenses = this.expensesService.listOfExpenses;

  constructor() {
    effect(() => {
      if (this.expensesService.triggerRefresh()) {
        if (this.expensesService.gotoLastPage()) {
          const lastPage = Math.max(
            1,
            Math.ceil((this.expensesService.totalExpenses() + 1) / this.pageSize),
          );
          this.pageIndex = lastPage;
          this.expensesService.gotoLastPage.set(false);
        }
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
    const expense = this.expensesService.listOfExpenses().find((e) => e.id === id);
    if (!expense) return;
    this.expensesService.selectedExpense.set(expense);
    this.expensesService.isEditMode.set(true);
    this.expensesService.showAddModal.set(true);
  }

  deleteExpense(id: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this expense?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes, Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzCentered: true,
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
