import { Table } from '../tables/tables.interface';
import { User } from '../auth/auth.model';

export interface ResponseOrderList {
  data: OrderData[];
  pageNumber: number;
  currentPage: number;
  perPage: number;
  pageSize: number;
  firstPage: string;
  lastPage: string | number;
  totalPages: number;
  totalRecords: number;
  total: number;
  from: number;
  to: number;
  nextPageUrl: string;
  prevPageUrl: string;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  amount: number;
  orderStatus: string;
  orderTime: string;
  table: Table;
  orderedBy: User;
  orderTakenBy: User;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  food: OrderFood;
  foodPackage: OrderFoodPackage;
}

export interface OrderFood {
  id: number;
  name: string;
  description: string;
  price: number;
  discountType: string;
  discount: number;
  discountPrice: number;
  image: string;
}

export interface OrderFoodPackage {
  id: number;
  food: OrderFood;
  package: OrderPackage;
}

export interface OrderPackage {
  id: number;
  name: string;
  price: number;
}

export interface CreateOrderRequest {
  tableId: number;
  customerId?: string;
  orderItems: CreateOrderItemRequest[];
  notes?: string;
}

export interface CreateOrderItemRequest {
  foodId?: number;
  packageId?: number;
  quantity: number;
  unitPrice: number;
}

export interface CartItem {
  tableId: string;
  quantity: number;
  amount: number;
  food: OrderFood;
}

export interface PostOrder {
  tableId: number;
  orderNumber: string;
  amount: number;
  phoneNumber: string | null;
  items: PostOrderItem[];
}

export interface PostOrderItem {
  foodId: number;
  foodPackageId: number | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface UpdateOrder {
  tableId: number;
  orderNumber: string;
  amount: number;
  phoneNumber: string;
  items: UpdateOrderItem[];
}

export interface UpdateOrderItem {
  foodId: number;
  foodPackageId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface EditOrderItem {
  uniqueId: string;
  foodId: number;
  foodName: string;
  foodImage: string;
  foodPackageId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}