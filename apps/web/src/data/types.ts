export interface Country {
  name: string;
  code: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface PaymentType {
  id: string;
  name: string;
}

export interface SaleRecord {
  id: string;
  customerId: string;
  country: Country;
  revenue: number;
  paymentType: PaymentType;
  saleDate: string;
  category: Category;
}
