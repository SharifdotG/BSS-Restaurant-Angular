import { Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EmployeesService } from '../employees.service';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { AddEmployee } from '../add-employee/add-employee';
import { API_BASE_URL } from '../../app.config';
import { ChangeDetectionStrategy } from '@angular/core';

export type ThemeType = 'fill' | 'outline' | 'twotone';

@Component({
  selector: 'app-employee-list',
  providers: [NzModalService],
  imports: [
    NzTableModule,
    NzAvatarComponent,
    NzIconDirective,
    AddEmployee,
    NzTooltipDirective,
    DatePipe,
  ],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeList {
  protected employeeService = inject(EmployeesService);
  listOfEmployees = this.employeeService.listOfEmployees;
  imageBaseUrl = inject(API_BASE_URL) + '/images/user/';
  private modal = inject(NzModalService);

  pageSize = signal(10);
  pageIndex = signal(1);
  starMarked = signal<ThemeType>('twotone');

  constructor() {
    effect(() => {
      if (this.employeeService.triggerRefresh()) {
        this.loadDataFromServer(this.pageIndex(), this.pageSize());
      }
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pageIndex.set(params.pageIndex);
    this.pageSize.set(params.pageSize);
    this.loadDataFromServer(this.pageIndex(), this.pageSize());
  }

  loadDataFromServer(pageIndex: number, pageSize: number): void {
    this.employeeService.getListOfEmployees('', pageIndex.toString(), pageSize.toString(), '');
  }

  editEmployee(id: string): void {
    this.employeeService.getEmployeeById(id);
  }

  deleteUser(id: string): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this employee?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes, Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.employeeService.deleteEmployee(id);
        if (this.employeeService.listOfEmployees().length <= 1) {
          this.pageIndex.update((p) => Math.max(1, p - 1));
        }
      },
    });
  }

  getImageUrl(imageUrl: string | undefined): string {
    return imageUrl ? `${this.imageBaseUrl}/${imageUrl}` : '';
  }

  toggleStar(): void {
    this.starMarked.update((v) => (v === 'fill' ? 'twotone' : 'fill'));
  }
}
