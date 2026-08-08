import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { products } from '@/src/data/products';

type CartItem = { productId: string; qty: number };
type CartContextValue = { items: CartItem[]; addItem: (productId: string) => void; removeItem: (productId: string) => void; updateQty: (productId: string, qty: number) => void; totalCount: number; totalPrice: number };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (productId: string) => setItems((current) => {
    const existing = current.find((item) => item.productId === productId);
    if (existing) return current.map((item) => item.productId === productId ? { ...item, qty: item.qty + 1 } : item);
    return [...current, { productId, qty: 1 }];
  });

  const removeItem = (productId: string) => setItems((current) => current.filter((item) => item.productId !== productId));

  const updateQty = (productId: string, qty: number) => setItems((current) => qty <= 0 ? current.filter((item) => item.productId !== productId) : current.map((item) => item.productId === productId ? { ...item, qty } : item));

  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return sum + (product?.price ?? 0) * item.qty;
  }, 0), [items]);

  return <CartContext.Provider value={{ items, addItem, removeItem, updateQty, totalCount, totalPrice }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
