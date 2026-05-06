export interface SalesRevenueStats {
  todaysSales: number;
  monthlySales: number;
  yearlySales: number;
  totalSales: number;
  todaysSalesAmount: number;
  monthlySalesAmount: number;
  yearlySalesAmount: number;
  totalSalesAmount: number;
  todaysExpenses: number;
  monthlyExpenses: number;
  yearlyExpenses: number;
  totalExpenses: number;
  todaysRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalRevenue: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalEmployees: number;
  totalFoods: number;
  todaysOrders: number;
  todaysRevenue: number;
  totalTables: number;
  occupiedTables: number;
  salesRevenue: SalesRevenueStats;
  recentOrders: RecentOrder[];
  topSellingFoods: TopSellingFood[];
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  amount: number;
  orderStatus: string;
  orderTime: string;
  tableNumber: string;
}

export interface TopSellingFood {
  id: number;
  name: string;
  price: number;
  image: string;
  totalQuantitySold: number;
  totalRevenue: number;
}
