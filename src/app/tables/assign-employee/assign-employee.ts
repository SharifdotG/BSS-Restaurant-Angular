import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import {
  NzModalComponent,
  NzModalContentDirective,
  NzModalFooterDirective,
} from 'ng-zorro-antd/modal';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { TablesService } from '../tables.service';
import { Employee } from '../../employees/employees.interface';
import { API_BASE_URL } from '../../app.config';

@Component({
  selector: 'app-assign-employee',
  imports: [
    FormsModule,
    NzButtonComponent,
    NzIconDirective,
    NzModalComponent,
    NzOptionComponent,
    NzSelectComponent,
    NzModalContentDirective,
    NzModalFooterDirective,
    NzAvatarComponent,
  ],
  templateUrl: './assign-employee.html',
  styleUrl: './assign-employee.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignEmployee {
  readonly tablesService = inject(TablesService);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly modalWidth = '600px';
  listOfSelectedEmployees: Employee[] = [];

  private assignModalWasOpen = false;

  constructor() {
    effect(() => {
      const isOpen = this.tablesService.showAssignModal();
      if (isOpen) {
        this.assignModalWasOpen = true;
        this.tablesService.loadListOfAvailableEmployees(this.tablesService.assignTableId());
      } else if (this.assignModalWasOpen) {
        this.assignModalWasOpen = false;
        this.listOfSelectedEmployees = [];
      }
    });
  }

  handleCancel(): void {
    this.tablesService.closeAssignModal();
  }

  handleOk(): void {
    if (this.listOfSelectedEmployees.length > 0) {
      this.tablesService.assignEmployeeToTable(
        this.listOfSelectedEmployees,
        this.tablesService.assignTableId(),
      );
    }
  }

  getEmployeeImageUrl(imageName: string | null | undefined): string {
    if (!imageName || imageName === 'null') return '';
    return `${this.baseUrl}/images/user/${imageName}`;
  }

  getEmployeeFullName(emp: Employee): string {
    const firstName = emp.user.firstName || '';
    const middleName = emp.user.middleName || '';
    const lastName = emp.user.lastName || '';
    return `${firstName} ${middleName} ${lastName}`.trim();
  }
}
