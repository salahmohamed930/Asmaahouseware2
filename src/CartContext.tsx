import { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from './types';
import { useAuth } from './AuthContext';
import { supabase } from './types';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*), variant:product_variants(*)')
      .eq('user_id', user.id);
    setItems(data || []);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addItem = async (product: Product, variant: ProductVariant, quantity: number) => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (variant.quantity <= 0) {
      toast.error('عذراً، هذا المنتج غير متوفر حالياً');
      return;
    }

    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('variant_id', variant.id)
      .single();

    if (existing) {
      await updateQuantity(existing.id, existing.quantity + quantity);
    } else {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: product.id,
        variant_id: variant.id,
        quantity
      });
      fetchCart();
      toast.success('تمت الإضافة للسلة');
    }
  };

  const removeItem = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    fetchCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
  };

  const total = items.reduce((acc, item) => {
    const price = user?.role === 'wholesale' ? item.variant?.wholesale_price : item.variant?.price;
    return acc + (price || 0) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
