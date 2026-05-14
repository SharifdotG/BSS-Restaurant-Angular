import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import { NewOrderService } from '../new-order.service';
import { CartItem, CreateOrderItemRequest, PostOrder, PostOrderItem } from '../../orders/orders.model';

interface CartGroup {
  tableId: string;
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
}

@Component({
  selector: 'app-cart',
  imports: [
    FormsModule,
    NzIconModule,
    NzImageModule,
    NzInputNumberModule,
    NzInputModule,
    NzDrawerModule,
    NzTooltipModule,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  readonly newOrderService = inject(NewOrderService);
  private readonly breakpoint = inject(BreakpointObserver);

  readonly fallbackImage = this.newOrderService.fallbackImage;

  readonly drawerWidth = signal(420);

  readonly subtotal = computed(() =>
    this.newOrderService.cartFood().reduce((total, item) => total + item.amount * item.quantity, 0),
  );

  /** Group cart items by table for multi-table ordering. */
  readonly cartGroups = computed<CartGroup[]>(() => {
    const items = this.newOrderService.cartFood();
    const tables = this.newOrderService.listOfTable();
    const map = new Map<string, CartGroup>();
    for (const item of items) {
      let group = map.get(item.tableId);
      if (!group) {
        const tableNumber =
          tables.find((t) => String(t.id) === item.tableId)?.tableNumber ?? `Table ${item.tableId}`;
        group = { tableId: item.tableId, tableNumber, items: [], subtotal: 0 };
        map.set(item.tableId, group);
      }
      group.items.push(item);
      group.subtotal += item.amount * item.quantity;
    }
    return Array.from(map.values());
  });

  readonly totalUnits = computed(() =>
    this.newOrderService.cartFood().reduce((sum, i) => sum + i.quantity, 0),
  );

  /**
   * Per-table phone number map: each table in the cart keeps its own optional
   * customer phone number. Keyed by tableId.
   */
  readonly phoneNumbers = signal<Record<string, string>>({});

  constructor() {
    this.breakpoint
      .observe(['(max-width: 600px)'])
      .pipe(takeUntilDestroyed())
      .subscribe((state) => {
        this.drawerWidth.set(state.matches ? window.innerWidth : 420);
      });
  }

  getFoodImage(image: string): string {
    return this.newOrderService.getFoodImage(image);
  }

  removeFromCart(foodId: number, tableId: string): void {
    this.newOrderService.cartFood.update((items) =>
      items.filter((item) => !(item.food.id === foodId && item.tableId === tableId)),
    );
  }

  updateQuantity(foodId: number, tableId: string, newQuantity: number): void {
    this.newOrderService.cartFood.update((items) =>
      items.map((item) =>
        item.food.id === foodId && item.tableId === tableId
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );
  }

  removeTableGroup(tableId: string): void {
    this.newOrderService.cartFood.update((items) =>
      items.filter((item) => item.tableId !== tableId),
    );
    this.phoneNumbers.update((m) => {
      const next = { ...m };
      delete next[tableId];
      return next;
    });
  }

  setPhoneNumber(tableId: string, value: string): void {
    this.phoneNumbers.update((m) => ({ ...m, [tableId]: value }));
  }

  getPhoneNumber(tableId: string): string {
    return this.phoneNumbers()[tableId] ?? '';
  }

  closeCart(): void {
    this.newOrderService.showCart.set(false);
  }

  confirmOrder(): void {
    const groups = this.cartGroups();
    if (!groups.length) return;

    const now = new Date();
    const dateStr = [
      now.getFullYear().toString().slice(-2),
      (now.getMonth() + 1).toString().padStart(2, '0'),
      now.getDate().toString().padStart(2, '0'),
    ].join('');

    let pending = groups.length;
    let anyFailed = false;

    // Place one order per table — each cart group becomes its own POST.
    // Only the groups whose POST succeeds get removed from the cart, so the
    // user can retry any that failed without losing their items.
    for (const group of groups) {
      const items: PostOrderItem[] = group.items.map((item) => ({
        foodId: item.food.id,
        // Backend rejects null here — match the working update payload shape.
        foodPackageId: 0,
        quantity: item.quantity,
        unitPrice: item.amount,
        totalPrice: item.quantity * item.amount,
      }));
      const orderItems: CreateOrderItemRequest[] = items.map((item) => ({
        foodId: item.foodId,
        packageId: item.foodPackageId ?? 0,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const tableToken = String(group.tableNumber || group.tableId).replace(/[^a-zA-Z0-9]/g, '');
      const orderNumber = `${dateStr}-${tableToken || group.tableId}-${randomDigits}`;
      const postData: PostOrder = {
        tableId: Number(group.tableId),
        orderNumber,
        amount: group.subtotal,
        // Backend rejects null here — send '' for "no phone" instead.
        phoneNumber: this.getPhoneNumber(group.tableId) || '',
        items,
        orderItems,
      };

      const finishGroup = (succeeded: boolean) => {
        if (succeeded) {
          this.newOrderService.cartFood.update((all) =>
            all.filter((i) => i.tableId !== group.tableId),
          );
          this.phoneNumbers.update((m) => {
            const next = { ...m };
            delete next[group.tableId];
            return next;
          });
        } else {
          anyFailed = true;
        }
        pending -= 1;
        if (pending === 0) {
          if (!anyFailed) {
            this.newOrderService.selectedTableId.set('');
            this.closeCart();
          }
        }
      };

      this.newOrderService.createOrder(postData).subscribe({
        next: () => finishGroup(true),
        error: () => finishGroup(false),
      });
    }
  }
}
