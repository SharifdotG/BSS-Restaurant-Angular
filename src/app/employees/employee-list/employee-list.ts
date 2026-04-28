import { Component, effect, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EmployeesService } from '../employees.service';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { AddEmployee } from '../add-employee/add-employee';
import { API_BASE_URL } from '../../app.config';

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
})
export class EmployeeList implements OnInit {
  protected employeeService = inject(EmployeesService);
  listOfEmployees = this.employeeService.listOfEmployees;
  imageBaseUrl = inject(API_BASE_URL) + '/images/user/';
  private modal = inject(NzModalService);

  ngOnInit() {
    // Initial load is handled by nz-table's (nzQueryParams) event
  }

  pageSize = 10;
  pageIndex = 1;
  starMarked: ThemeType = 'twotone';

  constructor() {
    effect(
      () => {
        if (this.employeeService.triggerRefresh()) {
          this.ngOnInit();
          this.employeeService.triggerRefresh.set(false);
        }
      },
      { allowSignalWrites: true },
    );
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pageIndex = params.pageIndex;
    this.pageSize = params.pageSize;
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  loadDataFromServer(pageIndex: number, pageSize: number): void {
    this.employeeService.getListOfEmployees('', pageIndex.toString(), pageSize.toString(), '');
  }

  editEmployee(id: string) {
    this.employeeService.getEmployeeById(id);
  }

  deleteUser(id: string) {
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
          this.pageIndex = Math.max(1, this.pageIndex - 1);
        }
      },
    });
  }

  getImageUrl(imageUrl: string | undefined): string {
    return this.imageBaseUrl + '/' + imageUrl;
  }

  toggleStar() {
    if (this.starMarked === 'fill') {
      this.starMarked = 'twotone';
    } else {
      this.starMarked = 'fill';
    }
  }
}
