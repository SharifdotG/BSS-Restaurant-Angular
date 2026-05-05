import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NewOrderService } from '../new-order.service';
import { Table } from '../../tables/tables.interface';
import { FoodItem } from '../../foods/foods.interface';
import { CartItem } from '../../orders/orders.model';
import { Cart } from '../cart/cart';

@Component({
  selector: 'app-new-order',
  imports: [
    FormsModule,
    InfiniteScrollDirective,
    NzSpinModule,
    NzIconModule,
    NzImageModule,
    NzInputModule,
    NzButtonModule,
    Cart,
  ],
  templateUrl: './new-order.html',
  styleUrl: './new-order.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewOrder {
  readonly newOrderService = inject(NewOrderService);

  currentTableSize = 10;
  currentFoodSize = 10;

  readonly searchFoodInput = signal('');
  private readonly searchSubject = new Subject<string>();

  readonly fallbackImage = this.newOrderService.fallbackImage;

  // Drag functionality for cart button
  isDragging = signal(false);
  hasMoved = signal(false);
  cartButtonPosition = signal({ x: 0, y: 0 });
  private dragOffset = { x: 0, y: 0 };
  private mouseDownPosition = { x: 0, y: 0 };

  constructor() {
    this.searchSubject
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((searchValue) => {
        this.performSearch(searchValue);
      });
  }

  ngOnInit(): void {
    this.newOrderService.getListOfTables('', '1', String(this.currentTableSize));
    this.newOrderService.getListOfFoods('', '1', String(this.currentFoodSize));
  }

  onTableSelect(table: Table): void {
    this.newOrderService.selectedTableId.set(String(table.id));
  }

  getTableImage(image: string): string {
    return this.newOrderService.getTableImage(image);
  }

  onTableScroll(): void {
    this.currentTableSize += 5;
    this.newOrderService.getListOfTables('', '1', String(this.currentTableSize));
  }

  onFoodScroll(): void {
    this.currentFoodSize += 5;
    this.newOrderService.getListOfFoods('', '1', String(this.currentFoodSize));
  }

  getFoodImage(image: string): string {
    return this.newOrderService.getFoodImage(image);
  }

  addToCart(food: FoodItem, tableId: string): void {
    const finalPrice = food.discountType !== 'None' ? food.discountPrice : food.price;

    const newItem: CartItem = {
      tableId,
      quantity: 1,
      amount: finalPrice,
      food: {
        id: food.id,
        name: food.name,
        description: food.description,
        price: food.price,
        discountType: food.discountType,
        discount: food.discount,
        discountPrice: food.discountPrice,
        image: food.image,
      },
    };

    this.newOrderService.cartFood.update((items) => {
      const existingItem = items.find((item) => item.food.id === food.id);
      if (existingItem) {
        return items.map((item) =>
          item.food.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...items, newItem];
    });
  }

  onSearchFoodInputChange(value: string): void {
    this.searchFoodInput.set(value);
    this.searchSubject.next(value);
  }

  performSearch(searchValue: string): void {
    this.newOrderService.getListOfFoods(
      '',
      '1',
      String(this.currentFoodSize),
      searchValue,
    );
  }

  // Drag functionality
  onCartButtonMouseDown(event: MouseEvent): void {
    this.isDragging.set(true);
    this.hasMoved.set(false);
    this.mouseDownPosition = { x: event.clientX, y: event.clientY };
    const cartButton = event.target as HTMLElement;
    const rect = cartButton
      .closest('.cart-button-wrapper')
      ?.getBoundingClientRect();
    if (rect) {
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }
  }

  onCartButtonMouseMove(event: MouseEvent): void {
    if (this.isDragging()) {
      const deltaX = Math.abs(event.clientX - this.mouseDownPosition.x);
      const deltaY = Math.abs(event.clientY - this.mouseDownPosition.y);

      if (deltaX > 5 || deltaY > 5) {
        this.hasMoved.set(true);
        this.cartButtonPosition.set({
          x: event.clientX - this.dragOffset.x,
          y: event.clientY - this.dragOffset.y,
        });
        event.preventDefault();
      }
    }
  }

  onCartButtonMouseUp(event: MouseEvent): void {
    this.isDragging.set(false);

    if (!this.hasMoved()) {
      return;
    }

    this.hasMoved.set(false);
    event.preventDefault();
  }
}