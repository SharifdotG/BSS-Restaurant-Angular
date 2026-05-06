import { ChangeDetectionStrategy, Component, OnInit, effect, inject } from '@angular/core';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';

import { FoodsService } from '../../foods/foods.service';
import { FoodItem } from '../../foods/foods.interface';
import { AddFood } from '../add-food/add-food';
import { API_BASE_URL } from '../../app.config';

@Component({
  selector: 'app-food-list',
  providers: [NzModalService],
  imports: [NzTableModule, NzAvatarModule, NzIconModule, NzTooltipModule, NzButtonModule, AddFood],
  templateUrl: './food-list.html',
  styleUrl: './food-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodList implements OnInit {
  foodService: FoodsService = inject(FoodsService);
  private modal = inject(NzModalService);

  pageSize = 10;
  pageIndex = 1;
  imageBaseUrl = inject(API_BASE_URL) + '/images/food/';

  listOfFood = this.foodService.listOfFood;

  constructor() {
    effect(() => {
      if (this.foodService.triggerRefresh()) {
        this.ngOnInit();
        this.foodService.triggerRefresh.set(false);
      }
    });
  }

  ngOnInit(): void {}

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortBy = currentSort?.key || '';
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.loadDataFromServer(pageIndex, pageSize, sortBy);
  }

  loadDataFromServer(pageIndex: number, pageSize: number, sortBy: string = ''): void {
    this.foodService.getListOfFood(sortBy, pageIndex.toString(), pageSize.toString());
  }

  getImageUrl(image: string): string {
    return this.imageBaseUrl + image;
  }

  editFood(id: number): void {
    this.foodService.getFoodById(id);
  }

  deleteFood(id: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this food item?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes, Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.foodService.deleteFood(id);
        if (this.foodService.listOfFood().length <= 1 && this.pageIndex > 1) {
          this.pageIndex--;
          this.loadDataFromServer(this.pageIndex, this.pageSize);
        }
      },
    });
  }

  getDiscountDisplay(data: FoodItem): string {
    if (data.discountType === 'None') {
      return '-';
    } else if (data.discountType === 'Percentage') {
      return data.discount + ' %';
    } else {
      return String(data.discount);
    }
  }
}
