export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  discountType: string;
  discount: number;
  discountPrice: number;
  image?: string;
}

export interface CreateFoodRequest {
  name: string;
  description: string;
  price: string;
  discountType: number;
  discount: string;
  discountPrice?: string;
  image?: string;
  base64?: string;
}

export interface UpdateFoodRequest extends CreateFoodRequest {
  id: number;
}

export interface FoodCategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

export interface FoodPackage {
  id: number;
  food: FoodItem;
  package: Package;
}

export interface Package {
  id: number;
  name: string;
  price: number;
}
