export interface LiveSale {
  id: string;
  countryCode: string;
  countryName: string;
  revenue: number;
  category: string;
  paymentType: string;
  timestamp: string;
}

export interface CountryMonthlyStat {
  countryCode: string;
  countryName: string;
  monthRevenue: number;
  monthOrders: number;
  todayRevenue: number;
  todayOrders: number;
}

export interface LiveSalesSnapshot {
  stats: CountryMonthlyStat[];
  month: string;
}
