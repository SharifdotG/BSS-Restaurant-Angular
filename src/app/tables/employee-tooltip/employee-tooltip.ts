import { ChangeDetectionStrategy, computed, inject, Component, input } from '@angular/core';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzMenuDirective, NzMenuItemComponent } from 'ng-zorro-antd/menu';
import { TablesService } from '../tables.service';
import { Employee } from '../../employees/employees.interface';
import { API_BASE_URL } from '../../app.config';

@Component({
  selector: 'app-employee-tooltip',
  imports: [
    NzTooltipDirective,
    NzAvatarComponent,
    NzIconDirective,
    NzDropdownMenuComponent,
    NzMenuDirective,
    NzMenuItemComponent,
  ],
  providers: [NzModalService],
  templateUrl: './employee-tooltip.html',
  styleUrl: './employee-tooltip.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeTooltip {
  private readonly modal = inject(NzModalService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly nzContextMenuService = inject(NzContextMenuService);
  private readonly tablesService = inject(TablesService);

  employeeId = input.required<string>();
  employeeName = input.required<string>();
  employeeList = input.required<Employee[]>();
  employeeTableId = input.required<string>();
  tableName = input.required<string>();

  readonly employeeImageUrl = computed(() => {
    const employees = this.employeeList();
    const id = this.employeeId();
    const employee = employees.find((e) => e.id === id);
    return employee ? `${this.baseUrl}/images/user/${employee.user.image}` : '';
  });

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create($event, menu);
  }

  removeEmployeeFromTable(): void {
    this.tablesService.removeEmployeeFromTable(this.employeeTableId());
  }

  showDeleteConfirm(): void {
    this.modal.confirm({
      nzTitle: `Remove "${this.employeeName()}" from ${this.tableName()}?`,
      nzOkText: 'Confirm Remove',
      nzOnOk: () => this.removeEmployeeFromTable(),
      nzCancelText: 'Cancel Operation',
      nzCentered: true,
    });
  }
}
