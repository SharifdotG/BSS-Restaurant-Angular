import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../tables.service';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AddTable } from '../add-table/add-table';
import { AssignEmployee } from '../assign-employee/assign-employee';
import { EmployeeTooltip } from '../employee-tooltip/employee-tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { API_BASE_URL } from '../../app.config';

@Component({
  selector: 'app-table-list',
  imports: [
    CommonModule,
    NzTableModule,
    NzAvatarModule,
    NzIconModule,
    NzTooltipModule,
    AddTable,
    AssignEmployee,
    EmployeeTooltip,
  ],
  providers: [NzModalService],
  templateUrl: './table-list.html',
  styleUrl: './table-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableList {
  readonly tableService = inject(TableService);
  private readonly modal = inject(NzModalService);
  private readonly responsive = inject(BreakpointObserver);

  readonly listOfTables = this.tableService.listOfTables;
  readonly listOfEmployees = this.tableService.listOfEmployees;
  readonly imageBaseUrl = inject(API_BASE_URL) + '/images/table/';

  tableWidthConfig = ['120px', '140px', '110px', '160px', 'auto', '180px'];
  pageSize = 10;
  pageIndex = 1;

  constructor() {
    effect(
      () => {
        if (this.tableService.triggerRefresh()) {
          this.loadDataFromServer(this.pageIndex, this.pageSize);
          this.tableService.triggerRefresh.set(false);
        }
      },
      { allowSignalWrites: true },
    );

    this.responsive.observe([Breakpoints.Large, Breakpoints.XLarge]).subscribe((result) => {
      this.tableWidthConfig = result.matches
        ? ['120px', '160px', '130px', '180px', 'auto', '180px']
        : ['120px', '100px', '70px', '110px', 'auto', '180px'];
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pageIndex = params.pageIndex;
    this.pageSize = params.pageSize;
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  loadDataFromServer(pageIndex: number, pageSize: number): void {
    this.tableService.getListOfTables('', pageIndex.toString(), pageSize.toString(), '');
    this.tableService.loadFullListOfEmployees();
  }

  editTable(id: number): void {
    this.tableService.getTableById(id);
  }

  deleteTable(id: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this table?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes, Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.tableService.deleteTable(id);
        if (this.tableService.listOfTables().length <= 1) {
          this.pageIndex = Math.max(1, this.pageIndex - 1);
        }
      },
    });
  }

  getImageUrl(imageUrl: string): string {
    return this.imageBaseUrl + imageUrl;
  }

  showAssignModal(tableId: string, tableName: string, image: string, numberOfSeats: number): void {
    this.tableService.assignTableId.set(tableId);
    this.tableService.assignTableImage.set(this.getImageUrl(image));
    this.tableService.assignTableSeats.set(numberOfSeats);
    this.tableService.assignTableName.set(tableName);
    this.tableService.showAssignModal.set(true);
    this.tableService.loadListOfAvailableEmployees(tableId);
  }

  protected readonly String = String;
}
