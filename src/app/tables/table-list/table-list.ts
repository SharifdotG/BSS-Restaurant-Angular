import { ChangeDetectionStrategy, Component, OnInit, effect, inject } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzModalService } from 'ng-zorro-antd/modal';

import { TablesService } from '../tables.service';
import { AssignEmployee } from '../assign-employee/assign-employee';
import { AddTable } from '../add-table/add-table';
import { EmployeeTooltip } from '../employee-tooltip/employee-tooltip';
import { API_BASE_URL } from '../../app.config';
import { FeatureTable } from '../../shared/feature-table/feature-table';
import { FeatureTableColumnDirective } from '../../shared/feature-table/feature-table-column.directive';

@Component({
  selector: 'app-table-list',
  imports: [
    NzAvatarModule,
    NzIconModule,
    NzTooltipModule,
    AddTable,
    AssignEmployee,
    EmployeeTooltip,
    FeatureTable,
    FeatureTableColumnDirective,
  ],
  providers: [NzModalService],
  templateUrl: './table-list.html',
  styleUrl: './table-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableList implements OnInit {
  readonly tablesService = inject(TablesService);
  private readonly modal = inject(NzModalService);

  readonly listOfTables = this.tablesService.listOfTables;
  readonly listOfEmployees = this.tablesService.listOfEmployees;
  readonly imageBaseUrl = inject(API_BASE_URL) + '/images/table/';

  pageSize = 15;
  pageIndex = 1;

  constructor() {
    effect(() => {
      if (this.tablesService.triggerRefresh()) {
        if (this.tablesService.gotoLastPage()) {
          const lastPage = Math.max(
            1,
            Math.ceil((this.tablesService.totalTables() + 1) / this.pageSize),
          );
          this.pageIndex = lastPage;
          this.tablesService.gotoLastPage.set(false);
        }
        this.loadDataFromServer(this.pageIndex, this.pageSize);
        this.tablesService.triggerRefresh.set(false);
      }
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
    const table = this.tablesService.listOfTables().find((t) => Number(t.id) === Number(id));
    if (!table) return;
    this.tablesService.selectedTable.set(table);
    this.tablesService.isEditMode.set(true);
    this.tablesService.showAddModal.set(true);
  }

  deleteTable(id: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this table?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes, Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzCentered: true,
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
