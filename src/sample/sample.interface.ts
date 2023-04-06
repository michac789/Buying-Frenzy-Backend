export interface MenuData {
  dishName: string;
  price: number;
}

export interface RestaurantData {
  cashBalance: number;
  openingHours: string;
  restaurantName: string;
  menu: MenuData[];
}

export interface PurchaseHistoryData {
  dishName: string;
  restaurantName: string;
  transactionAmount: number;
  transactionDate: string;
}

export interface UserData {
  id: number;
  cashBalance: number;
  name: string;
  purchaseHistory: PurchaseHistoryData[];
}
