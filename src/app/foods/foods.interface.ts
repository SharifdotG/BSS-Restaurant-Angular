export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  discountType: string;
  discount: number;
  discountPrice: number;
  image: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResponseFoodList {
  success: boolean;
  data: FoodItem[];
  totalRecords: number;
  total: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateFood {
  name: string;
  description: string;
  price: string;
  discountType: number;
  discount: string;
  discountPrice: string;
  image: string;
  base64: string;
}


export interface UpdateFood {
  name: string;
  description: string;
  price: string;
  discountType: number;
  discount: string;
  discountPrice: string;
  image: string;
  base64: string;
}
