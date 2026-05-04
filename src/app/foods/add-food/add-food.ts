import { Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import {
  AbstractControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Observable, Observer, Subject } from 'rxjs';
import { NzUploadChangeParam, NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FoodsService } from '../../foods/foods.service';
import { CreateFood, UpdateFood } from '../../foods/foods.interface';
import { API_BASE_URL } from '../../app.config';

@Component({
  selector: 'app-add-food',
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzFormModule,
    ReactiveFormsModule,
    NzGridModule,
    NzInputModule,
    FormsModule,
    NzUploadModule,
    NzIconModule,
    NzSelectModule,
  ],
  templateUrl: './add-food.html',
  styleUrl: './add-food.css',
})
export class AddFood implements OnInit, OnDestroy {
  backendService: FoodsService = inject(FoodsService);
  responsive = inject(BreakpointObserver);
  modalWidth = '80vw';
  discType = signal('');
  imageBaseUrl = inject(API_BASE_URL) + '/images/food/';

  constructor() {
    // Effect to populate form when editing
    effect(
      () => {
        const selectedFood = this.backendService.selectedFood();
        if (selectedFood && this.backendService.isEditMode()) {
          this.populateForm(selectedFood);
        }
      },
      { allowSignalWrites: true },
    );
  }

  populateForm(food: any) {
    // API returns discountType as string: "None", "Percentage", or "Flat"
    this.validateForm.patchValue({
      foodName: food.name,
      description: food.description,
      price: String(food.price),
      discountType: food.discountType || 'None',
      discountAmount: String(food.discount),
      discountedPrice: String(food.discountPrice),
    });

    // Set image if exists
    if (food.image) {
      this.image = food.image;
      this.fileList = [
        {
          uid: '-1',
          name: food.image,
          status: 'done',
          url: this.imageBaseUrl + food.image,
        },
      ];
    }
  }

  handleOk(): void {
    if (this.validateForm.status === 'INVALID') {
      for (const i in this.validateForm.controls) {
        this.validateForm.controls[i as keyof typeof this.validateForm.controls].markAsDirty();
        this.validateForm.controls[
          i as keyof typeof this.validateForm.controls
        ].updateValueAndValidity();
      }
    }
    if (this.validateForm.status === 'VALID') {
      const foodData = {
        name: this.validateForm.controls.foodName.value,
        description: this.validateForm.controls.description.value,
        price: this.validateForm.controls.price.value,
        discountType:
          this.validateForm.controls.discountType.value === 'None'
            ? 0
            : this.validateForm.controls.discountType.value === 'Flat'
              ? 2
              : 1,
        discount: this.validateForm.controls.discountAmount.value,
        discountPrice: this.validateForm.controls.discountedPrice.value,
        image: this.image,
        base64: this.imageB64,
      };

      if (this.backendService.isEditMode()) {
        // Update existing food
        const foodId = this.backendService.selectedFood()?.id;
        if (foodId) {
          this.backendService.updateFood(foodId, foodData as UpdateFood);
          setTimeout(() => {
            this.handleCancel();
          }, 1000);
        }
      } else {
        // Create new food
        this.backendService.addNewFood(foodData as CreateFood);
        setTimeout(() => {
          this.backendService.triggerRefresh.set(false);
          this.handleCancel();
          this.backendService.triggerRefresh.set(true);
        }, 1000);
      }
    }
  }

  handleCancel() {
    this.fileList = [];
    this.image = '';
    this.imageB64 = '';
    this.validateForm.reset();
    this.backendService.showAddModal.set(false);
    this.backendService.selectedFood.set(null);
    this.backendService.isEditMode.set(false);
  }

  //FORM SECTION
  fb = inject(NonNullableFormBuilder);
  private destroy$ = new Subject<void>();
  validateForm = this.fb.group({
    foodName: this.fb.control('', [Validators.required], [this.nameValidator]),
    description: this.fb.control('', [Validators.required], [this.fakeVal]),
    price: this.fb.control('', [Validators.required], [this.isNumberValidator]),
    discountType: this.fb.control({ value: 'None', disabled: false }, [Validators.nullValidator]),
    discountAmount: this.fb.control(
      { value: '0', disabled: true },
      [Validators.nullValidator],
      [this.isNumberValidator],
    ),
    discountedPrice: this.fb.control(
      { value: '0', disabled: true },
      [Validators.nullValidator],
      [this.isNumberValidator],
    ),
  });

  recalculateDiscountedPrice() {
    if (
      this.validateForm.controls.discountType.value === 'Flat' &&
      this.validateForm.controls.discountAmount.valid
    ) {
      let p = Number(this.validateForm.controls.price.value) || 0;
      let o = Number(this.validateForm.controls.discountAmount.value) || 0;
      this.validateForm.controls.discountedPrice.setValue(String(p - o));
    }
    if (
      this.validateForm.controls.discountType.value === 'Percentage' &&
      this.validateForm.controls.discountAmount.valid
    ) {
      let p = Number(this.validateForm.controls.price.value) || 0;
      let o = Number(this.validateForm.controls.discountAmount.value) || 0;
      this.validateForm.controls.discountedPrice.setValue(String(p - (o / 100) * p));
    }
  }

  ngOnInit() {
    this.validateForm.controls.price.statusChanges.subscribe((value: any) => {
      if (value === 'VALID') {
        this.recalculateDiscountedPrice();
      }
    });

    this.validateForm.controls.discountAmount.statusChanges.subscribe((value: any) => {
      if (value === 'VALID') {
        this.recalculateDiscountedPrice();
      }
    });

    this.validateForm.controls.discountType.valueChanges.subscribe((value) => {
      if (value === 'None') {
        this.validateForm.controls.discountAmount.disable();
        this.validateForm.controls.discountAmount.setValue('0');
        this.validateForm.controls.discountedPrice.disable();
        this.validateForm.controls.discountedPrice.setValue('0');
      } else {
        if (value === 'Flat') {
          this.discType.set(' ৳');
        } else if (value === 'Percentage') {
          this.discType.set(' %');
        }
        this.validateForm.controls.discountAmount.enable();
        this.validateForm.controls.discountedPrice.enable();
      }
    });

    this.responsive.observe([Breakpoints.Large, Breakpoints.XLarge]).subscribe((result) => {
      this.modalWidth = '100vw';
      if (result.matches) {
        this.modalWidth = '80vw';
      } else {
        this.modalWidth = '100vw';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Validators
  fakeVal(control: AbstractControl): Observable<ValidationErrors | null> {
    return new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        observer.next(null);
        observer.complete();
      }, 500);
    });
  }

  isNumberValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        if (control.value.length > 0 && !/^[+-]?\d+(\.\d+)?$/.test(control.value)) {
          observer.next({ error: true, isNotNum: true });
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

  submitForm() {
    // Form submission handled by handleOk
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
      event.file.error.statusText = 'Food Image';
      event.file.error.status = '200';
    }
  }
}
