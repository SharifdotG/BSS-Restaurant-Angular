import {
  Component,
  OnInit,
  effect,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OrdersService } from '../orders.service';
import { TablesService } from '../../tables/tables.service';
import { FoodsService } from '../../foods/foods.service';
import {
  UpdateOrder,
  EditOrderItem,
  OrderItem,
  OrderData,
} from '../orders.model';
import { User } from '../../auth/auth.model';

@Component({
  selector: 'app-edit-order',
  imports: [
    FormsModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzImageModule,
    NzSelectModule,
  ],
  templateUrl: './edit-order.html',
  styleUrl: './edit-order.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditOrder implements OnInit {
  readonly ordersService = inject(OrdersService);
  readonly foodsService = inject(FoodsService);
  private readonly tablesService = inject(TablesService);
  private readonly message = inject(NzMessageService);

  editItems = signal<EditOrderItem[]>([]);
  phoneNumber = signal<string>('');
  selectedFoodId = signal<number | null>(null);
  private lastLoadedOrderId: string | null = null;

  /** Derived total – recalculates automatically when editItems changes */
  totalAmount = computed(() =>
    this.editItems().reduce((sum, item) => sum + item.totalPrice, 0),
  );

  readonly fallbackImage =
    'data:image/png;base64,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';

  constructor() {
    effect(
      () => {
        const order = this.ordersService.selectedOrder();
        if (order && order.id !== this.lastLoadedOrderId) {
          this.lastLoadedOrderId = order.id;
          this.populateOrderData(order);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.tablesService.getListOfTables('', '1', '1000', '');
    this.foodsService.getListOfFood('', '1', '1000', '');
  }

  private populateOrderData(order: OrderData): void {
    this.phoneNumber.set((order.orderedBy as User & { phoneNumber?: string })?.phoneNumber ?? '');

    const items: EditOrderItem[] = order.orderItems.map(
      (item: OrderItem, index: number) => ({
        uniqueId: `${item.food.id}-${index}-${Date.now()}`,
        foodId: item.food.id,
        foodName: item.food.name,
        foodImage: item.food.image,
        foodPackageId: item.foodPackage?.id ?? 0,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      }),
    );

    this.editItems.set(items);
  }

  handleOk(): void {
    const order = this.ordersService.selectedOrder();
    if (!order) {
      this.message.error('No order selected for update');
      return;
    }

    const tableId = order.table?.id;
    if (!tableId) {
      this.message.error('Cannot update order: missing table information');
      return;
    }

    const updateData: UpdateOrder = {
      tableId,
      orderNumber: order.orderNumber,
      amount: this.totalAmount(),
      phoneNumber: this.phoneNumber() || '',
      items: this.editItems().map((item) => ({
        foodId: Number(item.foodId),
        foodPackageId: Number(item.foodPackageId) || 0,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    };

    this.ordersService.updateOrder(order.id, updateData);
  }

  handleCancel(): void {
    this.ordersService.showEditModal.set(false);
    this.ordersService.selectedOrder.set(null);
    this.editItems.set([]);
    this.lastLoadedOrderId = null;
  }

  onQuantityChange(index: number, newQuantity: number): void {
    this.editItems.update((items) => {
      const updated = [...items];
      const item = updated[index];
      if (item) {
        updated[index] = {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.unitPrice,
        };
      }
      return updated;
    });
  }

  removeItem(index: number): void {
    this.editItems.update((items) => items.filter((_, i) => i !== index));
  }

  getFoodImage(image: string): string {
    return this.ordersService.getFoodImage(image);
  }

  addFoodToOrder(): void {
    const foodId = this.selectedFoodId();
    if (!foodId) {
      this.message.warning('Please select a food item to add');
      return;
    }

    const selectedFood = this.foodsService.listOfFood().find((f) => f.id === foodId);
    if (!selectedFood) {
      this.message.error('Food item not found');
      return;
    }

    const existingItemIndex = this.editItems().findIndex(
      (item) => item.foodId === foodId,
    );

    if (existingItemIndex >= 0) {
      this.editItems.update((items) => {
        const updated = [...items];
        const existingItem = updated[existingItemIndex];
        if (existingItem) {
          updated[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
            totalPrice: (existingItem.quantity + 1) * existingItem.unitPrice,
          };
        }
        return updated;
      });
    } else {
      const price =
        selectedFood.discountPrice > 0 ? selectedFood.discountPrice : selectedFood.price;
      const newItem: EditOrderItem = {
        uniqueId: `${foodId}-${Date.now()}`,
        foodId,
        foodName: selectedFood.name,
        foodImage: selectedFood.image,
        foodPackageId: 0,
        quantity: 1,
        unitPrice: price,
        totalPrice: price,
      };
      this.editItems.update((items) => [...items, newItem]);
    }

    this.selectedFoodId.set(null);
    this.message.success(`Added ${selectedFood.name} to order`);
  }
}