export type Cat =
  | 'laptops'
  | 'accessories'
  | 'phones'
  | 'other'
  | 'shoes'
  | 'clothing'
  | 'electronics'
  | 'bags'
  | 'fitness'
  | 'outdoor';

export interface Product {
  id: string;
  title: string;
  price: number;
  category: Cat | string;
  description: string;
  image: string;
  stock: number;
  rating?: number | null;
}