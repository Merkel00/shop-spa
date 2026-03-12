export type OrderItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
};

export type OrderCustomer = {
  name: string;
  email: string;
  address: string;
};

export type OrderStatus =
  | 'NEW'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type Order = {
  id: string;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  discountPercent: number;
  total: number;
  status?: OrderStatus;
};