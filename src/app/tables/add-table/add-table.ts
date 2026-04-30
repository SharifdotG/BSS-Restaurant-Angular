import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import {
  NzFormControlComponent,
  NzFormDirective,
  NzFormItemComponent,
  NzFormLabelComponent,
} from 'ng-zorro-antd/form';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputDirective } from 'ng-zorro-antd/input';
import {
  NzModalComponent,
  NzModalContentDirective,
  NzModalFooterDirective,
} from 'ng-zorro-antd/modal';
import { NzUploadChangeParam, NzUploadComponent, NzUploadFile } from 'ng-zorro-antd/upload';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TableService } from '../tables.service';
import { CreateTableRequest, UpdateTableRequest, Table } from '../tables.interface';
import { API_BASE_URL } from '../../app.config';

function tableNameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (value && !/^[a-z0-9]+$/i.test(value)) {
    return { error: true, notAlphaNum: true };
  }
  return null;
}

function numberOfSeatsValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (value && value.length > 0 && !/^\d*$/.test(value)) {
    return { error: true, isNotNum: true };
  }
  return null;
}

@Component({
  selector: 'app-add-table',
  imports: [
    NzButtonComponent,
    NzColDirective,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzIconDirective,
    NzInputDirective,
    NzModalComponent,
    NzRowDirective,
    NzUploadComponent,
    ReactiveFormsModule,
    NzModalContentDirective,
    NzModalFooterDirective,
  ],
  templateUrl: './add-table.html',
  styleUrl: './add-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTable {
  readonly tableService = inject(TableService);
  private readonly responsive = inject(BreakpointObserver);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly modalWidth = signal('50vw');

  validateForm = this.fb.group({
    tableName: this.fb.control('', [Validators.required, tableNameValidator]),
    numberofseats: this.fb.control('', [Validators.required, numberOfSeatsValidator]),
  });

  image = '';
  imageB64 = '';
  fileList: NzUploadFile[] = [];
  previewImage = '';
  previewVisible = false;

  private addModalWasOpen = false;

  constructor() {
    effect(
      () => {
        const isOpen = this.tableService.showAddModal();
        if (isOpen) {
          this.addModalWasOpen = true;
          const table = this.tableService.selectedTable();
          if (table && this.tableService.isEditMode()) {
            this.populateForm(table);
          }
        } else if (this.addModalWasOpen) {
          this.addModalWasOpen = false;
          this.resetForm();
        }
      },
      { allowSignalWrites: true },
    );

    this.responsive.observe([Breakpoints.Large, Breakpoints.XLarge]).subscribe((result) => {
      this.modalWidth.set(result.matches ? '50vw' : '100vw');
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

    if (this.tableService.isEditMode()) {
      const updateData: UpdateTableRequest = {
        id: this.tableService.selectedTable()!.id,
        tableNumber: this.validateForm.controls.tableName.value,
        numberOfSeats: this.validateForm.controls.numberofseats.value,
      };

      if (this.image && this.imageB64) {
        updateData.image = this.image;
        updateData.base64 = this.imageB64;
      }

      this.tableService.updateTable(updateData.id, updateData);
    } else {
      const postData: CreateTableRequest = {
        tableNumber: this.validateForm.controls.tableName.value,
        numberOfSeats: this.validateForm.controls.numberofseats.value,
        image: this.image,
        base64: this.imageB64,
      };

      this.tableService.addNewTable(postData);
    }
  }

  handleCancel(): void {
    this.tableService.closeAddModal();
  }

  private populateForm(table: Table): void {
    this.validateForm.patchValue({
      tableName: table.tableNumber,
      numberofseats: table.numberOfSeats.toString(),
    });

    if (table.image) {
      this.image = table.image;
      this.previewImage = `${this.baseUrl}/images/table/${table.image}`;
      this.fileList = [
        {
          uid: '-1',
          name: table.image,
          status: 'done',
          url: `${this.baseUrl}/images/table/${table.image}`,
        },
      ];
    }
  }

  private resetForm(): void {
    this.fileList = [];
    this.image = '';
    this.imageB64 = '';
    this.previewImage = '';
    this.previewVisible = false;
    this.validateForm.reset();
  }

  handlePreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.url && !file['preview']) {
      file['preview'] = await this.getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file['preview'];
    this.previewVisible = true;
  };

  private getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  beforeUpload(_file: NzUploadFile, _fileList: NzUploadFile[]): boolean {
    return true;
  }

  onChange(event: NzUploadChangeParam): void {
    if (event.file.originFileObj) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.imageB64 = reader.result as string;
        this.image = event.file.uid + event.file.name;
      };
      reader.readAsDataURL(event.file.originFileObj);
    }

    if (event.type === 'removed') {
      this.image = '';
      this.imageB64 = '';
    }

    if (event.type === 'error') {
      event.file.error.statusText = 'Table Image';
      event.file.error.status = '200';
    }
  }
}
