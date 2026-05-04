import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { Subject, debounceTime } from 'rxjs';
import { NewOrderService } from '../../new-order/new-order.service';
import { Table } from '../../tables/tables.interface';
import { FoodItem } from '../../foods/foods.interface';
import { CartItem } from '../../orders/orders.model';
import { Cart } from '../cart/cart';

@Component({
  selector: 'app-new-order',
  imports: [
    CommonModule,
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
})
export class NewOrder {
  newOrderService = inject(NewOrderService);
  currentTableSize = 10;
  currentFoodSize = 10;
  searchFoodInput: string = '';
  private searchSubject = new Subject<string>();

  // Drag functionality for cart button
  isDragging = false;
  hasMoved = false;
  cartButtonPosition = { x: 0, y: 0 };
  dragOffset = { x: 0, y: 0 };
  mouseDownPosition = { x: 0, y: 0 };

  fallbackImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLxy/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg==';

  ngOnInit() {
    this.newOrderService.getListOfTables('', '1', String(this.currentTableSize), '');
    this.newOrderService.getListOfFoods('', '1', String(this.currentFoodSize), '');
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchValue) => {
      this.performSearch(searchValue);
    });
  }

  onTableSelect(table: Table) {
    this.newOrderService.selectedTableId.set(String(table.id));
  }

  getTableImage(image: string) {
    return this.newOrderService.getTableImage(image);
  }

  onTableScroll() {
    this.currentTableSize += 5;
    this.newOrderService.getListOfTables('', '1', String(this.currentTableSize), '');
  }

  onFoodScroll() {
    this.currentFoodSize += 5;
    this.newOrderService.getListOfFoods('', '1', String(this.currentFoodSize), '');
  }

  getFoodImage(image: string) {
    return this.newOrderService.getFoodImage(image);
  }

  addToCart(food: FoodItem, tableId: string) {
    let fp = 0;
    if (food.discountType !== 'None') {
      fp = food.discountPrice;
    } else {
      fp = food.price;
    }

    let item: CartItem = {
      tableId: tableId,
      quantity: 1,
      amount: fp,
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

    let items = [...this.newOrderService.cartFood()];
    let flag = false;
    items.forEach((cartItem) => {
      if (cartItem.food.id === food.id) {
        cartItem.quantity++;
        flag = true;
      }
    });
    if (!flag) {
      items.push(item);
    }
    this.newOrderService.cartFood.set(items);
  }

  onSearchFoodInputChange() {
    this.searchSubject.next(this.searchFoodInput);
  }

  performSearch(searchValue: string) {
    this.newOrderService.getListOfFoods('', '1', String(this.currentTableSize), searchValue);
  }

  // Drag functionality
  onCartButtonMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.hasMoved = false;
    this.mouseDownPosition = {
      x: event.clientX,
      y: event.clientY,
    };
    const cartButton = event.target as HTMLElement;
    const rect = cartButton.closest('.cart-button-wrapper')?.getBoundingClientRect();
    if (rect) {
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }
  }

  onCartButtonMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const deltaX = Math.abs(event.clientX - this.mouseDownPosition.x);
      const deltaY = Math.abs(event.clientY - this.mouseDownPosition.y);

      // Consider it a drag if mouse moved more than 5 pixels
      if (deltaX > 5 || deltaY > 5) {
        this.hasMoved = true;
        this.cartButtonPosition = {
          x: event.clientX - this.dragOffset.x,
          y: event.clientY - this.dragOffset.y,
        };
        event.preventDefault();
      }
    }
  }

  onCartButtonMouseUp(event: MouseEvent) {
    this.isDragging = false;

    // If it was just a click (no movement), allow the offcanvas to open
    if (!this.hasMoved) {
      // Reset to allow click event to propagate
      return;
    }

    this.hasMoved = false;
    event.preventDefault();
  }

  protected readonly String = String;
}
