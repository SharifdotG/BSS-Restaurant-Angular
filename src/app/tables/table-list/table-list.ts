import { ChangeDetectionStrategy, Component, OnInit, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { TablesService } from '../tables.service';
import { AssignEmployee } from '../assign-employee/assign-employee';
import { AddTable } from '../add-table/add-table';
import { EmployeeTooltip } from '../employee-tooltip/employee-tooltip';
import { API_BASE_URL } from '../../app.config';

@Component({
  selector: 'app-table-list',
  imports: [
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
export class TableList implements OnInit {
  readonly tablesService = inject(TablesService);
  private readonly modal = inject(NzModalService);
  private readonly responsive = inject(BreakpointObserver);

  readonly listOfTables = this.tablesService.listOfTables;
  readonly listOfEmployees = this.tablesService.listOfEmployees;
  readonly imageBaseUrl = inject(API_BASE_URL) + '/images/table/';

  tableWidthConfig = ['120px', '140px', '110px', '160px', 'auto', '180px'];
  pageSize = 10;
  pageIndex = 1;

  constructor() {
    effect(() => {
      if (this.tablesService.triggerRefresh()) {
        this.loadDataFromServer(this.pageIndex, this.pageSize);
        this.tablesService.triggerRefresh.set(false);
      }
    });

    this.responsive
      .observe([Breakpoints.Large, Breakpoints.XLarge])
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        this.tableWidthConfig = result.matches
          ? ['120px', '160px', '130px', '180px', 'auto', '180px']
          : ['120px', '100px', '70px', '110px', 'auto', '180px'];
      });
  }

  ngOnInit(): void {
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pageIndex = params.pageIndex;
    this.pageSize = params.pageSize;
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  loadDataFromServer(pageIndex: number, pageSize: number): void {
    this.tablesService.getListOfTables('', pageIndex.toString(), pageSize.toString(), '');
    this.tablesService.loadFullListOfEmployees();
  }

  editTable(id: number): void {
    this.tablesService.getTableById(id);
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
        this.tablesService.deleteTable(id);
        if (this.tablesService.listOfTables().length <= 1) {
          this.pageIndex = Math.max(1, this.pageIndex - 1);
        }
      },
    });
  }

  getImageUrl(imageUrl: string): string {
    return this.imageBaseUrl + imageUrl;
  }

  showAssignModal(tableId: string, tableName: string, image: string, numberOfSeats: number): void {
    this.tablesService.assignTableId.set(tableId);
    this.tablesService.assignTableImage.set(this.getImageUrl(image));
    this.tablesService.assignTableSeats.set(numberOfSeats);
    this.tablesService.assignTableName.set(tableName);
    this.tablesService.showAssignModal.set(true);
    this.tablesService.loadListOfAvailableEmployees(tableId);
  }

  protected readonly String = String;
}
