import {
  Component,
  ChangeDetectionStrategy,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  NzModalComponent,
  NzModalContentDirective,
  NzModalFooterDirective,
} from 'ng-zorro-antd/modal';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import {
  NzFormControlComponent,
  NzFormDirective,
  NzFormItemComponent,
  NzFormLabelComponent,
} from 'ng-zorro-antd/form';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { debounceTime, map, of, takeUntil, catchError, Observable, Subject } from 'rxjs';
import { NzUploadChangeParam, NzUploadComponent, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { API_BASE_URL } from '../../app.config';
import { CreateEmployee } from '../employees.interface';
import { EmployeesService } from '../employees.service';

@Component({
  selector: 'app-add-employee',
  imports: [
    CommonModule,
    NzModalComponent,
    NzButtonComponent,
    NzModalFooterDirective,
    NzFormItemComponent,
    NzFormDirective,
    ReactiveFormsModule,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzColDirective,
    NzInputDirective,
    NzRowDirective,
    NzModalContentDirective,
    NzUploadComponent,
    NzIconDirective,
    NzDatePickerComponent,
    NzSelectComponent,
    NzOptionComponent,
  ],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEmployee implements OnInit, OnDestroy {
  private httpClient = inject(HttpClient);
  private responsive = inject(BreakpointObserver);
  private baseUrl = inject(API_BASE_URL);
  private fb = inject(NonNullableFormBuilder);
  private destroy$ = new Subject<void>();

  employeeService = inject(EmployeesService);

  modalWidth = signal('80vw');
  image = signal('');
  imageB64 = signal('');
  fileList = signal<NzUploadFile[]>([]);
  previewImage = signal<string | undefined>('');
  previewVisible = signal(false);

  validateForm = this.fb.group({
    firstName: this.fb.control('', [Validators.required], [this.nameValidator]),
    middleName: this.fb.control('', [], [this.middleNameValidator]),
    lastName: this.fb.control('', [Validators.required], [this.nameValidator]),
    spouseName: this.fb.control('', [Validators.required], [this.nameValidator]),
    fatherName: this.fb.control('', [Validators.required], [this.nameValidator]),
    motherName: this.fb.control('', [Validators.required], [this.nameValidator]),
    designation: this.fb.control('', [Validators.required], [this.nameValidator]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    phoneNumber: this.fb.control('', [Validators.required], [this.phoneNumberValidator.bind(this)]),
    nidCardNumber: this.fb.control('', [Validators.required], [this.nidNumberValidator]),
    dob: this.fb.control('', [Validators.required]),
    doj: this.fb.control('', [Validators.required]),
    gender: this.fb.control('', [Validators.required]),
  });

  constructor() {
    effect(() => {
      const selectedEmployee = this.employeeService.selectedEmployee();
      const isEditMode = this.employeeService.isEditMode();

      if (isEditMode && selectedEmployee) {
        this.validateForm.patchValue({
          firstName: selectedEmployee.user.firstName,
          middleName: selectedEmployee.user.middleName || '',
          lastName: selectedEmployee.user.lastName,
          spouseName: selectedEmployee.user.spouseName || '',
          fatherName: selectedEmployee.user.fatherName || '',
          motherName: selectedEmployee.user.motherName || '',
          designation: selectedEmployee.designation,
          email: selectedEmployee.user.email,
          phoneNumber: selectedEmployee.user.phoneNumber,
          nidCardNumber: selectedEmployee.user.nid || '',
          dob: selectedEmployee.user.dob || '',
          doj: selectedEmployee.joinDate || '',
          gender:
            selectedEmployee.user.genderId === 1
              ? 'Male'
              : selectedEmployee.user.genderId === 2
                ? 'Female'
                : 'Other',
        });

        if (selectedEmployee.user.image) {
          this.image.set(selectedEmployee.user.image);
          this.previewImage.set(`${this.baseUrl}/images/user/${selectedEmployee.user.image}`);
          this.fileList.set([
            {
              uid: '-1',
              name: selectedEmployee.user.image,
              status: 'done',
              url: `${this.baseUrl}/images/user/${selectedEmployee.user.image}`,
            },
          ]);
        } else {
          this.image.set('');
          this.previewImage.set('');
          this.fileList.set([]);
        }

        Object.values(this.validateForm.controls).forEach((control) => control.enable());
      } else {
        Object.values(this.validateForm.controls).forEach((control) => control.enable());
      }
    });

    effect(() => {
      if (this.employeeService.triggerRefresh() && this.employeeService.showAddModal()) {
        this.handleCancel();
      }
    });
  }

  ngOnInit(): void {
    this.responsive
      .observe([Breakpoints.Large, Breakpoints.XLarge])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.modalWidth.set(result.matches ? '80vw' : '100vw');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleOk(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    const formValue = this.validateForm.value;

    const payload: CreateEmployee = {
      designation: formValue.designation!,
      joinDate: formValue.doj!,
      email: formValue.email!,
      phoneNumber: formValue.phoneNumber!,
      firstName: formValue.firstName!,
      middleName: formValue.middleName || '',
      lastName: formValue.lastName!,
      fatherName: formValue.fatherName || '',
      motherName: formValue.motherName || '',
      spouseName: formValue.spouseName || '',
      dob: formValue.dob!,
      nid: formValue.nidCardNumber!,
      genderId: formValue.gender === 'Male' ? 1 : formValue.gender === 'Female' ? 2 : 3,
      image: this.image(),
      base64: this.imageB64(),
    };

    if (this.employeeService.isEditMode()) {
      const selectedEmployee = this.employeeService.selectedEmployee();
      if (selectedEmployee) {
        this.employeeService.updateEmployee(selectedEmployee.id, payload);
      }
    } else {
      this.employeeService.addNewEmployee(payload);
    }
  }

  handleCancel(): void {
    this.fileList.set([]);
    this.image.set('');
    this.imageB64.set('');
    this.validateForm.reset();
    this.employeeService.showAddModal.set(false);
    this.employeeService.selectedEmployee.set(null);
    this.employeeService.isEditMode.set(false);
  }

  middleNameValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(control.value).pipe(
      debounceTime(500),
      map((value) =>
        value.length > 0 && !/^[a-zA-Z ]+$/.test(value) ? { error: true, notAplhaNum: true } : null,
      ),
    );
  }

  nameValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(control.value).pipe(
      debounceTime(500),
      map((value) => (!/^[a-zA-Z ]+$/.test(value) ? { error: true, notAplhaNum: true } : null)),
    );
  }

  phoneNumberValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    const selectedEmployee = this.employeeService.selectedEmployee();
    const isEditMode = this.employeeService.isEditMode();

    if (isEditMode && selectedEmployee && selectedEmployee.user.phoneNumber === control.value) {
      return of(null);
    }

    return this.httpClient
      .get<boolean>(`${this.baseUrl}/api/Auth/phoneNumberExist/${control.value}`)
      .pipe(
        debounceTime(500),
        map((isTaken) => (isTaken ? { phoneNumberTaken: true } : null)),
        catchError(() => of(null)),
      );
  }

  nidNumberValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(control.value).pipe(
      debounceTime(500),
      map((value) => (!/^\d{4,}$/.test(value) ? { error: true, isNotNumeric: true } : null)),
    );
  }

  handlePreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.url && !file['preview']) {
      file['preview'] = await this.getBase64(file.originFileObj!);
    }
    this.previewImage.set(file.url || file['preview']);
    this.previewVisible.set(true);
  };

  getBase64 = (file: File): Promise<string> =>
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
    const reader = new FileReader();
    if (event.file.originFileObj) {
      reader.onloadend = () => {
        this.imageB64.set(reader.result as string);
        this.image.set(event.file.uid + event.file.name);
      };
      reader.readAsDataURL(event.file.originFileObj);
    }

    if (event.type === 'removed') {
      this.image.set('');
      this.imageB64.set('');
    }

    if (event.type === 'error') {
      event.file.error.statusText = 'Employee Image';
      event.file.error.status = '200';
    }
  }
}
