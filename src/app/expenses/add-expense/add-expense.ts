import { Component, inject, effect, ChangeDetectionStrategy, signal } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExpensesService } from '../../expenses/expenses.service';
import { CreateExpense, UpdateExpense, ExpenseItem } from '../../expenses/expenses.interface';

@Component({
  selector: 'app-add-expense',
  imports: [
    NzModalModule,
    NzButtonModule,
    NzFormModule,
    ReactiveFormsModule,
    NzGridModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzIconModule,
    NzInputNumberModule,
  ],
  templateUrl: './add-expense.html',
  styleUrl: './add-expense.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddExpense {
  expensesService = inject(ExpensesService);
  private responsive = inject(BreakpointObserver);

  modalWidth = signal('80vw');

  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({
    title: this.fb.control('', [Validators.required]),
    category: this.fb.control('', [Validators.required]),
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    expenseDate: this.fb.control<Date | null>(null, [Validators.required]),
    notes: this.fb.control(''),
  });

  readonly categories = [
    'Ingredients',
    'Utilities',
    'Supplies',
    'Maintenance',
    'Salary',
    'Rent',
    'Other',
  ];

  constructor() {
    effect(
      () => {
        const selectedExpense = this.expensesService.selectedExpense();
        if (selectedExpense && this.expensesService.isEditMode()) {
          this.populateForm(selectedExpense);
        }
      },
      { allowSignalWrites: true },
    );

    this.responsive
      .observe([Breakpoints.Large, Breakpoints.XLarge])
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        this.modalWidth.set(result.matches ? '60vw' : '100vw');
      });
  }

  populateForm(expense: ExpenseItem): void {
    this.validateForm.patchValue({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      expenseDate: new Date(expense.expenseDate),
      notes: expense.notes ?? '',
    });
  }

  handleOk(): void {
    if (this.validateForm.status === 'INVALID') {
      Object.values(this.validateForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    const formValue = this.validateForm.getRawValue();
    const expenseData: CreateExpense = {
      title: formValue.title,
      category: formValue.category,
      amount: formValue.amount!,
      expenseDate: formValue.expenseDate!.toISOString(),
      notes: formValue.notes,
    };

    if (this.expensesService.isEditMode()) {
      const expenseId = this.expensesService.selectedExpense()?.id;
      if (expenseId) {
        this.expensesService.updateExpense(expenseId, expenseData as UpdateExpense);
      }
    } else {
      this.expensesService.addNewExpense(expenseData);
    }
    this.validateForm.reset();
  }

  handleCancel(): void {
    this.validateForm.reset();
    this.expensesService.showAddModal.set(false);
    this.expensesService.selectedExpense.set(null);
    this.expensesService.isEditMode.set(false);
  }
}
