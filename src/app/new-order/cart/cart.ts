import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NewOrderService } from '../new-order.service';
import { PostOrder, PostOrderItem } from '../../orders/orders.model';

@Component({
  selector: 'app-cart',
  imports: [
    FormsModule,
    NzIconModule,
    NzImageModule,
    NzInputNumberModule,
    NzInputModule,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  readonly newOrderService = inject(NewOrderService);

  readonly fallbackImage = this.newOrderService.fallbackImage;

  readonly subtotal = computed(() =>
    this.newOrderService
      .cartFood()
      .reduce((total, item) => total + item.amount * item.quantity, 0),
  );

  phoneNumber = signal('');

  getFoodImage(image: string): string {
    return this.newOrderService.getFoodImage(image);
  }

  removeFromCart(foodId: number): void {
    this.newOrderService.cartFood.update((items) =>
      items.filter((item) => item.food.id !== foodId),
    );
  }

  updateQuantity(foodId: number, newQuantity: number): void {
    this.newOrderService.cartFood.update((items) =>
      items.map((item) =>
        item.food.id === foodId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  }

  confirmOrder(): void {
    const items: PostOrderItem[] = this.newOrderService.cartFood().map(
      (item) => ({
        foodId: item.food.id,
        foodPackageId: null,
        quantity: item.quantity,
        unitPrice: item.amount,
        totalPrice: item.quantity * item.amount,
      }),
    );

    const selectedTable = this.newOrderService
      .listOfTable()
      .find(
        (table) =>
          table.id.toString() === this.newOrderService.selectedTableId(),
      );
    const tableNumber = selectedTable?.tableNumber ?? 'TABLE';

    const now = new Date();
    const dateStr = [
      now.getFullYear().toString().slice(-2),
      (now.getMonth() + 1).toString().padStart(2, '0'),
      now.getDate().toString().padStart(2, '0'),
    ].join('');

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `${dateStr}-${tableNumber}-${randomDigits}`;

    const postData: PostOrder = {
      tableId: Number(this.newOrderService.selectedTableId()),
      orderNumber,
      amount: this.subtotal(),
      phoneNumber: this.phoneNumber() || null,
      items,
    };

    this.newOrderService.createOrder(postData);
  }
}