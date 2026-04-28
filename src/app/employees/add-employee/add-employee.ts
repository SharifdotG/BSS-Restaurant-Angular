import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import {
  NzModalComponent,
  NzModalContentDirective,
  NzModalFooterDirective,
  NzModalService,
} from 'ng-zorro-antd/modal';
import { EmployeesService } from '../employees.service';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import {
  NzFormControlComponent,
  NzFormDirective,
  NzFormItemComponent,
  NzFormLabelComponent,
} from 'ng-zorro-antd/form';
import {
  AbstractControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzInputDirective } from 'ng-zorro-antd/input';
import {
  catchError,
  debounceTime,
  first,
  map,
  Observable,
  Observer,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { NzUploadChangeParam, NzUploadComponent, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CreateEmployee } from '../employees.interface';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { API_BASE_URL } from '../../app.config';

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

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
    FormsModule,
    NzUploadComponent,
    NzIconDirective,
    NzDatePickerComponent,
    NzSelectComponent,
    NzOptionComponent,
  ],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.css',
})
export class AddEmployee implements OnInit, OnDestroy {
  httpClient = inject(HttpClient);
  employeeService = inject(EmployeesService);
  responsive = inject(BreakpointObserver);
  private baseUrl = inject(API_BASE_URL);

  modalWidth = '80vw';

  handleOk(): void {
    if (this.employeeService.isEditMode()) {
      // In edit mode, validate and send all fields including image
      const selectedEmployee = this.employeeService.selectedEmployee();
      if (this.validateForm.status === 'INVALID') {
        for (const i in this.validateForm.controls) {
          this.validateForm.controls[i as keyof typeof this.validateForm.controls].markAsDirty();
          this.validateForm.controls[
            i as keyof typeof this.validateForm.controls
          ].updateValueAndValidity();
        }
        this.validateForm.controls.firstName.markAsDirty();
      }
      if (selectedEmployee && this.validateForm.status === 'VALID') {
        this.employeeService.isSendingRequest.set(true);
        let UPDATE_VALUES: CreateEmployee = {
          designation: this.validateForm.controls.designation.value,
          joinDate: this.validateForm.controls.doj.value,
          email: this.validateForm.controls.email.value,
          phoneNumber: this.validateForm.controls.phoneNumber.value,
          firstName: this.validateForm.controls.firstName.value,
          middleName: this.validateForm.controls.middleName.value,
          lastName: this.validateForm.controls.lastName.value,
          fatherName: this.validateForm.controls.fatherName.value,
          motherName: this.validateForm.controls.motherName.value,
          spouseName: this.validateForm.controls.spouseName.value,
          dob: this.validateForm.controls.dob.value,
          nid: this.validateForm.controls.nidCardNumber.value,
          genderId:
            this.validateForm.controls.gender.value === 'Male'
              ? 1
              : this.validateForm.controls.gender.value === 'Female'
                ? 2
                : 3,
          image: this.image,
          base64: this.imageB64,
        };
        this.employeeService.updateEmployee(selectedEmployee.id, UPDATE_VALUES);
        setTimeout(() => {
          this.employeeService.isSendingRequest.set(false);
          this.handleCancel();
        }, 1000);
      }
    } else {
      // In add mode, validate all fields
      if (this.validateForm.status === 'INVALID') {
        for (const i in this.validateForm.controls) {
          this.validateForm.controls[i as keyof typeof this.validateForm.controls].markAsDirty();
          this.validateForm.controls[
            i as keyof typeof this.validateForm.controls
          ].updateValueAndValidity();
        }
        this.validateForm.controls.firstName.markAsDirty();
      }
      if (this.validateForm.status === 'VALID') {
        this.employeeService.isSendingRequest.set(true);
        let POST_VALUES: CreateEmployee = {
          designation: this.validateForm.controls.designation.value,
          joinDate: this.validateForm.controls.doj.value,
          email: this.validateForm.controls.email.value,
          phoneNumber: this.validateForm.controls.phoneNumber.value,
          firstName: this.validateForm.controls.firstName.value,
          middleName: this.validateForm.controls.middleName.value,
          lastName: this.validateForm.controls.lastName.value,
          fatherName: this.validateForm.controls.fatherName.value,
          motherName: this.validateForm.controls.motherName.value,
          spouseName: this.validateForm.controls.spouseName.value,
          dob: this.validateForm.controls.dob.value,
          nid: this.validateForm.controls.nidCardNumber.value,
          genderId:
            this.validateForm.controls.gender.value === 'Male'
              ? 1
              : this.validateForm.controls.gender.value === 'Female'
                ? 2
                : 3,
          image: this.image,
          base64: this.imageB64,
        };
        this.employeeService.addNewEmployee(POST_VALUES);
        setTimeout(() => {
          this.employeeService.isSendingRequest.set(false);
          this.handleCancel();
          this.employeeService.triggerRefresh.set(true);
        }, 1000);
      }
    }
  }

  handleCancel() {
    this.fileList = [];
    this.image = '';
    this.imageB64 = '';
    this.validateForm.reset();
    this.employeeService.showAddModal.set(false);
    this.employeeService.selectedEmployee.set(null);
    this.employeeService.isEditMode.set(false);
  }

  //FORM SECTION
  fb = inject(NonNullableFormBuilder);
  private destroy$ = new Subject<void>();
  validateForm = this.fb.group({
    firstName: this.fb.control('', [Validators.required], [this.nameValidator]),
    middleName: this.fb.control('', [Validators.nullValidator], [this.middleNameValidator]),
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor() {
    // Effect to populate form when editing
    effect(() => {
      const selectedEmployee = this.employeeService.selectedEmployee();
      const isEditMode = this.employeeService.isEditMode();

      if (isEditMode && selectedEmployee) {
        // Populate form with employee data
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

        // Set image if exists
        if (selectedEmployee.user.image) {
          this.image = selectedEmployee.user.image;
          this.previewImage = `${this.baseUrl}/images/user/${selectedEmployee.user.image}`;
          this.fileList = [
            {
              uid: '-1',
              name: selectedEmployee.user.image,
              status: 'done',
              url: `${this.baseUrl}/images/user/${selectedEmployee.user.image}`,
            },
          ];
        }

        // Enable all fields in edit mode (removed the disable logic)
        Object.keys(this.validateForm.controls).forEach((key) => {
          this.validateForm.get(key)?.enable();
        });
      } else {
        // Enable all fields in add mode
        Object.keys(this.validateForm.controls).forEach((key) => {
          this.validateForm.get(key)?.enable();
        });
      }
    });
  }

  ngOnInit() {
    this.responsive.observe([Breakpoints.Large, Breakpoints.XLarge]).subscribe((result) => {
      this.modalWidth = '100vw';
      if (result.matches) {
        this.modalWidth = '80vw';
      } else {
        this.modalWidth = '100vw';
      }
    });
  }

  // Validators
  middleNameValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        if (control.value.length > 0 && !/^[a-zA-Z ]+$/.test(control.value)) {
          observer.next({ error: true, notAplhaNum: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }, 500);
    });
  }

  nameValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        if (!/^[a-zA-Z ]+$/.test(control.value)) {
          observer.next({ error: true, notAplhaNum: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }, 500);
    });
  }

  phoneNumberValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    // In edit mode, skip validation if phone number hasn't changed
    const selectedEmployee = this.employeeService.selectedEmployee();
    const isEditMode = this.employeeService.isEditMode();
    if (isEditMode && selectedEmployee && selectedEmployee.user.phoneNumber === control.value) {
      return of(null);
    }

    return this.httpClient
      .get<boolean>(`${this.baseUrl}/api/Auth/phoneNumberExist/${control.value}`)
      .pipe(
        map((isTaken) => (isTaken ? { phoneNumberTaken: true } : null)),
        catchError(() => of(null)),
      );
  }

  nidNumberValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        if (!/^\d{4,}$/.test(control.value)) {
          observer.next({ error: true, isNotNumeric: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }, 500);
    });
  }

  submitForm() {
    // Form submission handled in handleOk
  }

  //File Upload Section
  image = '';
  imageB64 = '';
  fileList: NzUploadFile[] = [];
  previewImage: string | undefined = '';
  previewVisible = false;

  handlePreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.url && !file['preview']) {
      file['preview'] = await this.getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file['preview'];
    this.previewVisible = true;
  };

  getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  date: any;

  beforeUpload(file: NzUploadFile, fileList: NzUploadFile[]): boolean {
    return true;
  }

  onChange(event: NzUploadChangeParam) {
    const reader = new FileReader();
    if (event.file.originFileObj) {
      reader.onloadend = () => {
        this.imageB64 = reader.result as string;
        this.image = event.file.uid + event.file.name;
      };
      reader.readAsDataURL(event.file.originFileObj);
    }

    if (event.type !== 'removed') {
      this.image = '';
      this.imageB64 = '';
    }

    if (event.type === 'error') {
      event.file.error.statusText = 'Employee Image';
      event.file.error.status = '200';
    }
  }

  protected readonly toString = toString;
}
