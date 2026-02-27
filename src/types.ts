import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'customer' | 'wholesale' | 'admin';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  address?: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  code: string;
  category_id: string;
  is_active: boolean;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color_hex: string;
  color_name: string;
  price: number;
  wholesale_price: number;
  quantity: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_path: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  phone: string;
  phone2?: string;
  address: string;
  status: 'created' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name_snapshot: string;
  color_name_snapshot: string;
  color_hex_snapshot: string;
  price_snapshot: number;
  quantity: number;
}
