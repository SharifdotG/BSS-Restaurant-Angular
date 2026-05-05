import { Component, inject, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { NzUploadChangeParam, NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FoodsService } from '../../foods/foods.service';
import { FoodItem, CreateFood, UpdateFood } from '../../foods/foods.interface';
import { API_BASE_URL } from '../../app.config';

@Component({
  selector: 'app-add-food',
  imports: [
    NzModalModule,
    NzButtonModule,
    NzFormModule,
    ReactiveFormsModule,
    NzGridModule,
    NzInputModule,
    NzUploadModule,
    NzIconModule,
    NzSelectModule,
  ],
  templateUrl: './add-food.html',
  styleUrl: './add-food.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFood {
  readonly foodsService = inject(FoodsService);
  private readonly responsive = inject(BreakpointObserver);
  private readonly fb = inject(NonNullableFormBuilder);
  readonly imageBaseUrl = inject(API_BASE_URL) + '/images/food/';

  // Local component state using signals
  readonly modalWidth = signal('80vw');
  readonly discType = signal('');
  readonly image = signal('');
  readonly imageB64 = signal('');
  readonly fileList = signal<NzUploadFile[]>([]);
  readonly previewImage = signal('');
  readonly previewVisible = signal(false);

  validateForm = this.fb.group({
    foodName: this.fb.control<string>('', [Validators.required], [this.nameValidator]),
    description: this.fb.control<string>('', [Validators.required]),
    price: this.fb.control<string>('', [Validators.required], [this.isNumberValidator]),
    discountType: this.fb.control<string>({ value: 'None', disabled: false }, [
      Validators.nullValidator,
    ]),
    discountAmount: this.fb.control<string>(
      { value: '0', disabled: true },
      [Validators.nullValidator],
      [this.isNumberValidator],
    ),
    discountedPrice: this.fb.control<string>(
      { value: '0', disabled: true },
      [Validators.nullValidator],
      [this.isNumberValidator],
    ),
  });

  constructor() {
    // Effect to populate form when editing
    effect(
      () => {
        const selectedFood = this.foodsService.selectedFood();
        if (selectedFood && this.foodsService.isEditMode()) {
          this.populateForm(selectedFood);
        }
      },
      { allowSignalWrites: true },
    );

    this.setupFormListeners();
    this.setupResponsiveListener();
  }

  private setupFormListeners(): void {
    this.validateForm.controls.price.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe((status) => {
        if (status === 'VALID') {
          this.recalculateDiscountedPrice();
        }
      });

    this.validateForm.controls.discountAmount.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe((status) => {
        if (status === 'VALID') {
          this.recalculateDiscountedPrice();
        }
      });

    this.validateForm.controls.discountType.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (value === 'None') {
          this.validateForm.controls.discountAmount.disable();
          this.validateForm.controls.discountAmount.setValue('0');
          this.validateForm.controls.discountedPrice.disable();
          this.validateForm.controls.discountedPrice.setValue('0');
        } else {
          this.discType.set(value === 'Flat' ? ' ৳' : ' %');
          this.validateForm.controls.discountAmount.enable();
          this.validateForm.controls.discountedPrice.enable();
        }
      });
  }

  private setupResponsiveListener(): void {
    this.responsive
      .observe([Breakpoints.Large, Breakpoints.XLarge])
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        this.modalWidth.set(result.matches ? '80vw' : '100vw');
      });
  }

  populateForm(food: FoodItem): void {
    this.validateForm.patchValue({
      foodName: food.name,
      description: food.description,
      price: String(food.price),
      discountType: food.discountType || 'None',
      discountAmount: String(food.discount),
      discountedPrice: String(food.discountPrice),
    });

    if (food.image) {
      this.image.set(food.image);
      this.fileList.set([
        {
          uid: '-1',
          name: food.image,
          status: 'done',
          url: this.imageBaseUrl + food.image,
        },
      ]);
    }
  }

  handleOk(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    const formValue = this.validateForm.getRawValue(); // Includes disabled controls
    const foodData: CreateFood | UpdateFood = {
      name: formValue.foodName,
      description: formValue.description,
      price: formValue.price,
      discountType:
        formValue.discountType === 'None' ? 0 : formValue.discountType === 'Flat' ? 2 : 1,
      discount: formValue.discountAmount,
      discountPrice: formValue.discountedPrice,
      image: this.image(),
      base64: this.imageB64(),
    };

    if (this.foodsService.isEditMode()) {
      const foodId = this.foodsService.selectedFood()?.id;
      if (foodId) {
        this.foodsService.updateFood(foodId, foodData as UpdateFood);
        setTimeout(() => this.handleCancel(), 1000);
      }
    } else {
      this.foodsService.addNewFood(foodData as CreateFood);
      setTimeout(() => {
        this.foodsService.triggerRefresh.set(false);
        this.handleCancel();
        this.foodsService.triggerRefresh.set(true);
      }, 1000);
    }
  }

  handleCancel(): void {
    this.fileList.set([]);
    this.image.set('');
    this.imageB64.set('');
    this.validateForm.reset();
    this.foodsService.showAddModal.set(false);
    this.foodsService.selectedFood.set(null);
    this.foodsService.isEditMode.set(false);
  }

  recalculateDiscountedPrice(): void {
    const discountType = this.validateForm.controls.discountType.value;
    const price = Number(this.validateForm.controls.price.value) || 0;
    const discountAmount = Number(this.validateForm.controls.discountAmount.value) || 0;

    if (discountType === 'Flat' && this.validateForm.controls.discountAmount.valid) {
      this.validateForm.controls.discountedPrice.setValue(String(price - discountAmount));
    } else if (discountType === 'Percentage' && this.validateForm.controls.discountAmount.valid) {
      this.validateForm.controls.discountedPrice.setValue(
        String(price - (discountAmount / 100) * price),
      );
    }
  }

  // Validators
  private isNumberValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(
      /^[+-]?\d+(\.\d+)?$/.test(control.value) ? null : { error: true, isNotNum: true },
    ).pipe(delay(500));
  }

  private nameValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(/^[a-zA-Z ]+$/.test(control.value) ? null : { error: true, notAplhaNum: true }).pipe(
      delay(500),
    );
  }

  // File Upload Section
  async handlePreview(file: NzUploadFile): Promise<void> {
    if (!file.url && !file['preview']) {
      file['preview'] = await this.getBase64(file.originFileObj!);
    }
    this.previewImage.set(file.url || file['preview'] || '');
    this.previewVisible.set(true);
  }

  private getBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  beforeUpload(): boolean {
    return true;
  }

  onChange(event: NzUploadChangeParam): void {
    if (event.type === 'removed') {
      this.image.set('');
      this.imageB64.set('');
      return;
    }

    if (event.file.originFileObj) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.imageB64.set(reader.result as string);
        this.image.set(event.file.uid + event.file.name);
      };
      reader.readAsDataURL(event.file.originFileObj);
    }

    if (event.type === 'error' && event.file.error) {
      (event.file.error as any).statusText = 'Food Image';
      (event.file.error as any).status = '200';
    }
  }
}
